from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from database import get_db
import models
import datetime
from typing import Dict, Any, List
import re
import os
import requests
from ml_models import score_transaction_ml

router = APIRouter(prefix="/copilot", tags=["copilot"])

# Simple in-memory storage for pending human-in-the-loop approvals
PENDING_ACTIONS = {}

# Retrieve API credentials from environment
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "")


def call_nvidia(system_prompt: str, user_message: str, chat_history: List[Dict[str, str]] = None) -> str:
    """Makes a direct POST request to NVIDIA API Catalog (OpenAI-compatible) with retries."""
    if not NVIDIA_API_KEY:
        return (
            "⚠ **NVIDIA API Key is missing.**\n\n"
            "Please ensure `NVIDIA_API_KEY` is set in your backend `.env` file to activate the live Copilot."
        )

    url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    # Format history turns for Nvidia (OpenAI format)
    messages = [{"role": "system", "content": system_prompt}]
    if chat_history:
        for turn in chat_history:
            role = "assistant" if turn["role"] == "model" else turn["role"]
            messages.append({"role": role, "content": turn.get("text", turn.get("content", ""))})

    messages.append({"role": "user", "content": user_message})

    payload = {
        "model": "meta/llama-3.1-8b-instruct",
        "messages": messages,
        "temperature": 0.15,
        "max_tokens": 1024,
    }

    import time

    for attempt in range(4):
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            if response.status_code in [429, 503]:
                print(
                    f"NVIDIA API returned status {response.status_code}. Retrying in 2.5s (attempt {attempt + 1}/4)..."
                )
                time.sleep(2.5)
                continue

            if response.status_code != 200:
                print(f"NVIDIA API Error: {response.status_code} - {response.text}")
                return f"Error: NVIDIA API responded with code {response.status_code}."

            res_json = response.json()
            choices = res_json.get("choices", [])
            if choices:
                return choices[0].get("message", {}).get("content", "")
            return "Error: Empty response returned from NVIDIA."
        except Exception as e:
            print(f"NVIDIA Exception on attempt {attempt + 1}: {e}")
            if attempt < 3:
                time.sleep(2.5)
                continue
            return f"Error: Failed to request NVIDIA API: {e}"

    return "Error: NVIDIA API is temporarily overloaded (503/429)."


def call_llm(system_prompt: str, user_message: str, chat_history: List[Dict[str, str]] = None) -> str:
    """Invokes the NVIDIA API for LLM reasoning and agent tool calling."""
    return call_nvidia(system_prompt, user_message, chat_history)


@router.post("/chat")
def chat_copilot(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    """
    Main LLM-based Copilot chatbot with live Agentic tool calling capabilities using Gemini or NVIDIA LLMs.
    """
    message = payload.get("message", "").strip()
    merchant_id = payload.get("merchant_id", 1)

    system_prompt = f"""You are FinAI Copilot, an advanced AI assistant.
You have direct read-only access to the database and can execute overrides after human approval.

The current merchant has merchant_id = 1.
Database Tables Schema:
1. transactions:
   - id: INTEGER (Primary Key)
   - reference_id: VARCHAR (Unique transaction ID like 'TXN-LIVE-100234')
   - merchant_id: INTEGER
   - customer_name: VARCHAR
   - customer_email: VARCHAR
   - amount: FLOAT
   - currency: VARCHAR ('INR')
   - status: VARCHAR ('Success', 'Pending', 'Failed')
   - payment_method: VARCHAR ('Card', 'UPI', 'NetBanking')
   - is_fraud: BOOLEAN
   - fraud_score: FLOAT (0.0 to 100.0)
   - created_at: DATETIME
2. merchants:
   - id: INTEGER (Primary Key)
   - business_name: VARCHAR
   - user_id: INTEGER
   - kyc_status: VARCHAR ('pending', 'approved', 'rejected')
3. merchant_settings:
   - id: INTEGER (Primary key)
   - merchant_id: INTEGER
   - rate_limit_per_min: INTEGER

Available Agentic Tools:
1. SQL Query Tool: Query the database. To do this, emit exactly:
   [SQL: <SELECT statement>]
   Example: [SQL: SELECT COUNT(*) FROM transactions WHERE status = 'Failed' AND merchant_id = 1]
   - The query MUST be read-only (starting with SELECT) and limited to tables: transactions, merchants, merchant_settings, audit_logs.
   - Do NOT run INSERT, UPDATE, DELETE, or DROP.
2. Inspect Transaction Tool: Retrieve security details and SHAP explanation factors. To do this, emit exactly:
   [INSPECT: <id_or_reference_id>]
   Example: [INSPECT: TXN-LIVE-123456]
3. Update Rate Limit Tool: Request security rate limit updates. To do this, emit exactly:
   [ACTION: UPDATE_RATE_LIMIT, value: <integer>]
   Example: [ACTION: UPDATE_RATE_LIMIT, value: 300]
   - Emitting this will immediately prompt the user for human confirmation (HITL).

Guidelines:
- When you emit a tool tag, do not include any other conversational text in that turn. Just output the tag itself.
- If you receive a tool output, integrate and summarize the findings for the user using beautiful Markdown lists, bolding, and tables.
"""

    chat_history = []
    current_user_msg = message

    # Multi-turn tool calling loop (max 4 iterations to prevent loops)
    for iteration in range(4):
        ai_response = call_llm(system_prompt, current_user_msg, chat_history)
        ai_response_clean = ai_response.strip()

        # 1. Action Tool: Update Settings (HITL)
        rate_limit_match = re.search(
            r"\[ACTION:\s*UPDATE_RATE_LIMIT,\s*value:\s*(\d+)\]", ai_response_clean, re.IGNORECASE
        )
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
                    "description": f"Increase API rate limits from current standard (100 req/min) to {new_limit} req/min. This action will be logged in the database audit log.",
                    "confirm_label": "Approve Change",
                    "cancel_label": "Cancel Request",
                },
            }

        # 2. Database Query Tool (SQL)
        sql_match = re.search(r"\[SQL:\s*(SELECT.*?)(?=\])\]", ai_response_clean, re.IGNORECASE | re.DOTALL)
        if sql_match:
            sql_query = sql_match.group(1).strip()
            is_safe = sql_query.upper().startswith("SELECT") and not any(
                kw in sql_query.upper() for kw in ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE"]
            )

            if not is_safe:
                observation = "Error: Only read-only SELECT queries are allowed."
            else:
                try:
                    from sqlalchemy import text

                    result = db.execute(text(sql_query))
                    columns = list(result.keys())
                    rows = result.fetchall()

                    if not rows:
                        observation = "Query executed successfully. Result: 0 rows found."
                    else:
                        # Format as clean markdown table
                        header = "| " + " | ".join(columns) + " |\n"
                        divider = "| " + " | ".join(["---"] * len(columns)) + " |\n"
                        md_rows = ""
                        for r in rows:
                            md_rows += "| " + " | ".join(str(val) for val in r) + " |\n"
                        observation = f"Database output:\n{header}{divider}{md_rows}"
                except Exception as e:
                    observation = f"Error executing SQL: {str(e)}"

            # Append conversational turns to Gemini context and loop
            chat_history.append({"role": "user", "text": current_user_msg})
            chat_history.append({"role": "model", "text": ai_response_clean})
            current_user_msg = f"Tool Output:\n{observation}"
            continue

        # 3. Anomaly Scorer / Inspection Tool
        inspect_match = re.search(r"\[INSPECT:\s*(\S+?)(?=\])\]", ai_response_clean, re.IGNORECASE)
        if inspect_match:
            txn_ref = inspect_match.group(1).replace("#", "").strip()

            # Find by ID or reference
            if txn_ref.startswith("TXN-"):
                txn = db.query(models.Transaction).filter(models.Transaction.reference_id == txn_ref).first()
            else:
                try:
                    txn = db.query(models.Transaction).filter(models.Transaction.id == int(txn_ref)).first()
                except ValueError:
                    txn = None

            if not txn:
                observation = f"Transaction `{txn_ref}` not found in the database."
            else:
                scoring_details = score_transaction_ml(txn.amount, txn.payment_method, txn.created_at.hour)
                shap_factors = ""
                for factor, contribution in scoring_details["shap_values"].items():
                    sign = "+" if contribution > 0 else ""
                    shap_factors += f"- **{factor}**: {sign}{contribution}%\n"

                observation = f"""Security audit details for transaction #{txn.id} ({txn.reference_id}):
- Customer: {txn.customer_name} ({txn.customer_email})
- Amount: ₹{txn.amount:.2f}
- Payment Method: {txn.payment_method}
- Status: {txn.status}
- Fraud Probability: {scoring_details["fraud_score"]}%
- Security Classification: {scoring_details["classification"]}
- SHAP Feature Contributions:
{shap_factors}
"""

            chat_history.append({"role": "user", "text": current_user_msg})
            chat_history.append({"role": "model", "text": ai_response_clean})
            current_user_msg = f"Tool Output:\n{observation}"
            continue

        # 4. Standard Text response
        return {"sender": "ai", "message": ai_response_clean}

    # Fallback if loops exceeded
    return {"sender": "ai", "message": ai_response}


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
        "message": f"Successfully authorized settings change! Current API rate limit is updated to **{new_limit} req/min** in database. Immutable audit log recorded.",
    }
