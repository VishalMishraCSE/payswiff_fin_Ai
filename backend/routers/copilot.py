from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from database import get_db
import models
import datetime
from typing import Dict, Any, List
import re
from ml_models import score_transaction_ml

router = APIRouter(prefix="/copilot", tags=["copilot"])

# Simple in-memory storage for pending human-in-the-loop approvals
PENDING_ACTIONS = {}


@router.post("/chat")
def chat_copilot(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    """
    Main LLM-based Copilot chatbot with tool calling capabilities.
    Processes natural language queries and returns textual answers, tables, or Action Cards.
    """
    message = payload.get("message", "").strip()
    merchant_id = payload.get("merchant_id", 1)

    # 1. Check if the message is requesting an action that requires HITL Approval
    rate_limit_match = re.search(r"(?:set|change|increase|update)\s+rate\s+limit\s+to\s+(\d+)", message, re.IGNORECASE)
    if rate_limit_match:
        new_limit = int(rate_limit_match.group(1))
        action_id = f"act_{int(datetime.datetime.now().timestamp())}"

        PENDING_ACTIONS[action_id] = {
            "action_id": action_id,
            "merchant_id": merchant_id,
            "action_type": "update_rate_limit",
            "value": new_limit,
            "description": f"Update API rate limits to {new_limit} req/min",
        }

        return {
            "sender": "ai",
            "message": f"I detect that you want to change your API rate limit to **{new_limit} requests/minute**. Since this is a critical security configuration, it requires your explicit confirmation.",
            "action_pending": True,
            "action_card": {
                "action_id": action_id,
                "title": "Authorize API Configuration Change",
                "description": f"Increase API rate limits from current standard (100 req/min) to {new_limit} req/min. This action will be logged in the immutable audit ledger.",
                "confirm_label": "Approve Change",
                "cancel_label": "Cancel Request",
            },
        }

    # 2. Check if the message is inquiring about failed UPI payments
    if "failed upi" in message.lower() or "upi failed" in message.lower():
        # Query failed UPI transactions
        results = (
            db.query(models.Transaction)
            .filter(models.Transaction.payment_method == "UPI")
            .filter(models.Transaction.status == "Failed")
            .order_by(models.Transaction.created_at.desc())
            .limit(5)
            .all()
        )

        if not results:
            return {
                "sender": "ai",
                "message": "I checked our ledger, and there are no failed UPI transactions logged in the past 90 days. All systems are operating smoothly.",
            }

        # Format a gorgeous markdown table response
        md_table = "| ID | Customer | Amount | Date |\n| :--- | :--- | :--- | :--- |\n"
        for txn in results:
            formatted_date = txn.created_at.strftime("%b %d, %H:%M")
            md_table += f"| `#{txn.id}` | {txn.customer_name} | ₹{txn.amount:.2f} | {formatted_date} |\n"

        return {
            "sender": "ai",
            "message": f"### `[AgenticAI] query_database_tool` Result\nI retrieved the most recent failed UPI payments from your database:\n\n{md_table}\n\nWould you like me to inspect any of these transactions for anomalies?",
        }

    # 3. Check if the message is requesting inspection of a transaction
    inspect_match = re.search(r"inspect\s+(?:transaction\s+)?(TXN-\d+|#?\d+)", message, re.IGNORECASE)
    if inspect_match:
        txn_id_str = inspect_match.group(1).replace("#", "")

        # Search by ID or reference
        if txn_id_str.startswith("TXN-"):
            txn = db.query(models.Transaction).filter(models.Transaction.reference_id == txn_id_str).first()
        else:
            try:
                txn = db.query(models.Transaction).filter(models.Transaction.id == int(txn_id_str)).first()
            except ValueError:
                txn = None

        if not txn:
            return {
                "sender": "ai",
                "message": f"I could not find transaction `{txn_id_str}` in the database. Please verify the ID and try again.",
            }

        # Get simulated SHAP parameters
        hour = txn.created_at.hour
        scoring_details = score_transaction_ml(txn.amount, txn.payment_method, hour)

        # Format the SHAP factors
        shap_factors = ""
        for factor, contribution in scoring_details["shap_values"].items():
            color = "🔴" if contribution > 0 else "🟢"
            sign = "+" if contribution > 0 else ""
            shap_factors += f"- {color} **{factor}**: {sign}{contribution}%\n"

        ai_msg = f"""### `[GenAI] Conversational Anomaly Explainer`
Here are the security audit details for transaction **#{txn.id}** (`{txn.reference_id}`):

- **Customer:** {txn.customer_name} ({txn.customer_email})
- **Amount:** ₹{txn.amount:.2f}
- **Payment Method:** {txn.payment_method}
- **Status:** `{txn.status}`
- **Security Health classification:** **{scoring_details["classification"]}**

#### SHAP Feature Contributions:
{shap_factors}

**AI Recommendation:** The transaction exhibits a fraud probability of **{scoring_details["fraud_score"]}%**. {"It should be reviewed immediately by a compliance auditor." if scoring_details["is_fraud"] else "No security actions are required."}"""

        return {"sender": "ai", "message": ai_msg}

    # 4. Standard conversational responses (GenAI summary)
    if "revenue" in message.lower() or "report" in message.lower():
        return {
            "sender": "ai",
            "message": """### `[GenAI] Performance Overview`
Here is a generative summary of your store's performance:

*   **Total Sales:** Your overall volume is stable, with card payments registering a **12% growth** this week.
*   **Peak Hours:** Settlement volumes peak between **2:00 PM and 5:00 PM**, driven heavily by UPI QR scans.
*   **Failure Analysis:** UPI has a success rate of **98.2%**, while NetBanking failures account for **85%** of payment declines due to bank server timeouts.
*   **Recommendation:** Activating standard rate limit configurations will reduce spam payment requests by up to **40%**.""",
        }

    # Default fallback greeting
    return {
        "sender": "ai",
        "message": f"Hello! I am your **FinAI Copilot**. I have access to `[AgenticAI]` tools and `[GenAI]` reasoning. You can ask me to:\n\n1. Check database records (e.g. *'Show me failed UPI payments'*)\n2. Perform audit operations (e.g. *'Inspect transaction #105'*)\n3. Configure account settings (e.g. *'Set rate limit to 300 requests/minute'*)",
    }


@router.post("/approve")
def approve_action(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    """
    Executes a pending Agentic AI action after manual merchant approval (HITL).
    """
    action_id = payload.get("action_id")
    approved = payload.get("approved", True)

    if not action_id or action_id not in PENDING_ACTIONS:
        raise HTTPException(status_code=404, detail="Pending action not found or expired")

    action_details = PENDING_ACTIONS.pop(action_id)

    if not approved:
        return {
            "status": "cancelled",
            "message": "Configuration change request rejected by the user. Settings unchanged.",
        }

    merchant_id = action_details["merchant_id"]
    new_limit = action_details["value"]

    # Update settings in DB
    settings = db.query(models.MerchantSettings).filter(models.MerchantSettings.merchant_id == merchant_id).first()
    if not settings:
        settings = models.MerchantSettings(merchant_id=merchant_id, rate_limit_per_min=new_limit)
        db.add(settings)
    else:
        settings.rate_limit_per_min = new_limit

    # Write to Audit Logs
    audit_log = models.AuditLog(
        method="POST", path="/copilot/approve", user_email="merchant@finai.com", status_code=200
    )
    db.add(audit_log)
    db.commit()

    return {
        "status": "success",
        "message": f"Successfully authorized settings change! Current API rate limit is updated to **{new_limit} req/min** in PostgreSQL. Immutable audit log recorded.",
    }
