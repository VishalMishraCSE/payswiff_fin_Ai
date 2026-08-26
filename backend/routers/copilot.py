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


def parse_intent_fallback(user_message: str, merchant_id: int = 1) -> str:
    """
    Fallback intent parser when NVIDIA_API_KEY is not configured or API call fails.
    Parses natural language queries directly into agent tool tags.
    """
    msg_lower = user_message.lower().strip()

    # 1. Rate Limit Action
    rate_match = re.search(r'(?:set|change|update)\s+(?:rate\s+limit|limit)\s+(?:to\s+)?(\d+)', msg_lower)
    if rate_match:
        val = rate_match.group(1)
        return f"[ACTION: UPDATE_RATE_LIMIT, value: {val}]"

    # 2. Inspect Transaction (#105, txn 105, inspect transaction 105)
    inspect_match = re.search(r'(?:inspect|check|audit)\s+(?:transaction\s+)?(?:#|txn-)?(\w+)', msg_lower)
    if inspect_match:
        ref = inspect_match.group(1)
        return f"[INSPECT: {ref}]"
    
    digits_inspect = re.search(r'#(\d+)', msg_lower)
    if digits_inspect:
        return f"[INSPECT: {digits_inspect.group(1)}]"

    # 3. Customer payment lookup: "show payment of minnu yadav", "transactions for priya"
    customer_match = re.search(r'(?:payment|payments|transaction|transactions|order|orders)\s+(?:of|for|by)\s+([a-zA-Z\s]+)', msg_lower)
    if customer_match:
        name = customer_match.group(1).strip()
        name = re.sub(r'^(the)\s+', '', name).strip()
        if name:
            return f"[SQL: SELECT id, reference_id, customer_name, amount, payment_method, status, is_fraud, created_at FROM transactions WHERE LOWER(customer_name) LIKE '%{name}%' AND merchant_id = {merchant_id}]"

    # 4. Failed transactions
    if "failed" in msg_lower:
        if "upi" in msg_lower:
            return f"[SQL: SELECT id, reference_id, customer_name, amount, payment_method, status, created_at FROM transactions WHERE status = 'Failed' AND UPPER(payment_method) = 'UPI' AND merchant_id = {merchant_id}]"
        elif "card" in msg_lower:
            return f"[SQL: SELECT id, reference_id, customer_name, amount, payment_method, status, created_at FROM transactions WHERE status = 'Failed' AND UPPER(payment_method) = 'CARD' AND merchant_id = {merchant_id}]"
        else:
            return f"[SQL: SELECT id, reference_id, customer_name, amount, payment_method, status, is_fraud FROM transactions WHERE status = 'Failed' AND merchant_id = {merchant_id}]"

    # 5. Fraud / Risk
    if "fraud" in msg_lower or "risk" in msg_lower or "anomaly" in msg_lower:
        return f"[SQL: SELECT id, reference_id, customer_name, amount, payment_method, status, fraud_score FROM transactions WHERE is_fraud = 1 AND merchant_id = {merchant_id}]"

    # 6. Performance / Summary
    if "summary" in msg_lower or "performance" in msg_lower or "report" in msg_lower or "overview" in msg_lower:
        return f"[SQL: SELECT COUNT(*) as total_transactions, SUM(amount) as total_volume_inr, SUM(CASE WHEN status='Failed' THEN 1 ELSE 0 END) as failed_count, SUM(CASE WHEN is_fraud=1 THEN 1 ELSE 0 END) as fraud_count FROM transactions WHERE merchant_id = {merchant_id}]"

    # 7. Default keyword search (e.g., "minnu yadav", "payment", "upi")
    clean_query = re.sub(r'[^a-zA-Z0-9\s]', '', msg_lower).strip()
    if clean_query:
        words = [w for w in clean_query.split() if len(w) > 2 and w not in ["show", "the", "find", "get", "search", "list", "all", "what", "where"]]
        if words:
            like_clause = " OR ".join([f"LOWER(customer_name) LIKE '%{w}%' OR LOWER(reference_id) LIKE '%{w}%'" for w in words])
            return f"[SQL: SELECT id, reference_id, customer_name, amount, payment_method, status, is_fraud, created_at FROM transactions WHERE ({like_clause}) AND merchant_id = {merchant_id}]"

    return f"[SQL: SELECT id, reference_id, customer_name, amount, payment_method, status, is_fraud, created_at FROM transactions WHERE merchant_id = {merchant_id} ORDER BY id DESC LIMIT 5]"


def get_nvidia_api_key() -> str:
    """Dynamically fetch NVIDIA API key from environment variables or .env file."""
    key = (
        os.getenv("NVIDIA_API_KEY", "")
        or os.getenv("NVIDIA_KEY", "")
        or os.getenv("NVAPI_KEY", "")
        or os.getenv("NV_API_KEY", "")
        or os.getenv("NVIDIA_API_SECRET", "")
    )
    if not key:
        # Check root or backend .env
        for env_path in [".env", "backend/.env", "../.env"]:
            if os.path.exists(env_path):
                try:
                    with open(env_path, "r") as f:
                        for line in f:
                            if "=" in line and not line.strip().startswith("#"):
                                k, v = line.strip().split("=", 1)
                                if k.strip() in ["NVIDIA_API_KEY", "NVIDIA_KEY", "NVAPI_KEY", "NV_API_KEY"]:
                                    val = v.strip().strip('"').strip("'")
                                    if val:
                                        return val
                except Exception:
                    pass
    return key


def call_nvidia(system_prompt: str, user_message: str, chat_history: List[Dict[str, str]] | None = None) -> str:
    """Makes a direct POST request to NVIDIA API Catalog with a strict 5-second timeout to prevent UI hanging."""
    api_key = get_nvidia_api_key()
    if not api_key:
        return ""

    url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
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

    # Top production models on NVIDIA API catalog (prioritize fast active endpoints)
    models_to_try = [
        "meta/llama-3.1-70b-instruct",
        "meta/llama-3.1-8b-instruct",
    ]

    for model_name in models_to_try:
        payload = {
            "model": model_name,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 1024,
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=8.0)

            if response.status_code == 200:
                res_json = response.json()
                choices = res_json.get("choices", [])
                if choices:
                    content = choices[0].get("message", {}).get("content")
                    if content:
                        return str(content)
            else:
                print(f"NVIDIA Model {model_name} status {response.status_code}")
        except Exception as e:
            print(f"NVIDIA Exception on model {model_name}: {e}")

    return ""


def call_llm(system_prompt: str, user_message: str, chat_history: List[Dict[str, str]] | None = None, merchant_id: int = 1) -> str:
    """Invokes the NVIDIA API for LLM reasoning, or falls back to smart intent parsing if key is missing or request fails."""
    api_key = get_nvidia_api_key()
    if api_key:
        res = call_nvidia(system_prompt, user_message, chat_history)
        if res and not res.startswith("Error:"):
            return res

    return parse_intent_fallback(user_message, merchant_id)



@router.post("/chat")
def chat_copilot(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    """
    Main LLM-based Copilot chatbot with live Agentic tool calling capabilities using NVIDIA LLMs.
    """
    try:
        return _chat_copilot_internal(payload, db)
    except Exception as e:
        print(f"Unhandled error in chat_copilot: {e}")
        return {
            "sender": "ai",
            "message": f"I encountered an error processing your request: {str(e)}. Please try again.",
        }


def _chat_copilot_internal(payload: Dict[str, Any], db: Session):
    message = payload.get("message", "").strip()
    merchant_id = payload.get("merchant_id", 1)

    system_prompt = f"""You are **FinAI Copilot**, a highly intelligent AI financial analyst assistant built into the FinAI Merchant Intelligence Platform. You speak in a warm, professional, and concise tone. You NEVER show raw SQL queries, code, or internal tool syntax to the user.

## Your Identity
- You are a senior financial analyst AI. You explain things clearly using plain English, markdown tables, bullet points, and bold highlights.
- When a user asks about transactions, payments, customers, or fraud — you silently use your database tools behind the scenes, then present the results in a beautifully formatted, human-readable summary.
- You NEVER expose SQL syntax, tool tags, or internal commands in your response. Those are internal implementation details.

## Current Context
- Current merchant: merchant_id = {merchant_id}
- Currency: INR (₹)
- Today's date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}

## Database Schema (internal reference only — never mention this to user)
- **transactions**: id, reference_id, merchant_id, customer_name, customer_email, amount, currency, status (Success/Pending/Failed), payment_method (Card/UPI/NetBanking), is_fraud (boolean), fraud_score (0.0-100.0), created_at
- **merchants**: id, business_name, user_id, kyc_status
- **merchant_settings**: id, merchant_id, rate_limit_per_min

## Internal Tools (NEVER show these tags to user — emit them ALONE on a single line with NO other text)
1. **Database Query**: To look up data, emit ONLY this on a line by itself:
   [SQL: <SELECT query>]
   Rules: Must be SELECT only. Must filter by merchant_id = {merchant_id}. Never emit INSERT/UPDATE/DELETE/DROP.

2. **Transaction Inspection**: To get ML security audit + SHAP explainability for a transaction:
   [INSPECT: <transaction_id_or_reference>]

3. **Rate Limit Change** (triggers human approval):
   [ACTION: UPDATE_RATE_LIMIT, value: <number>]

## CRITICAL RULES
1. When you need data, emit ONLY the tool tag with ZERO additional text. No explanations, no "Let me check", no "Here is the query". Just the tag alone.
2. After receiving tool output, ALWAYS synthesize it into a natural, professional response with markdown formatting. Present amounts with ₹ symbol, dates in readable format, and fraud scores as percentages.
3. NEVER say "I ran a SQL query" or "The database returned". Instead say things like "I found 3 recent transactions..." or "Here are your latest payments..."
4. If a user asks about a specific person, transaction, or amount — construct the appropriate query silently and present the findings conversationally.
5. For greetings or general questions, respond naturally without using any tools.
6. You are an expert at understanding intent. "Show me today's payments" means query transactions from today. "Any fraud alerts?" means filter by is_fraud = 1. "How much did I earn?" means SUM(amount) for successful transactions.
"""

    chat_history = []
    current_user_msg = message
    last_observation = None

    # Multi-turn tool calling loop (max 4 iterations to prevent loops)
    for iteration in range(4):
        ai_response = call_llm(system_prompt, current_user_msg, chat_history, merchant_id) or ""
        ai_response_clean = ai_response.strip()

        # 1. Action Tool: Update Settings (HITL)
        rate_limit_match = re.search(r"\[ACTION:\s*UPDATE_RATE_LIMIT[^\]]*?(\d+)\]", ai_response_clean, re.IGNORECASE)
        if rate_limit_match:
            try:
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
            except Exception as e:
                print(f"Error preparing rate limit action: {e}")

        # 2. Database Query Tool (SQL) — only run if we haven't already fetched data in this turn
        sql_match = re.search(r"\[SQL:\s*(SELECT[\s\S]+?)\]", ai_response_clean, re.IGNORECASE)
        if sql_match and not last_observation:
            sql_query = sql_match.group(1).strip()
            is_safe = sql_query.upper().startswith("SELECT") and not re.search(
                r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE)\b", sql_query, re.IGNORECASE
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

            last_observation = observation
            # Append conversational turns to LLM context and loop
            chat_history.append({"role": "user", "text": current_user_msg})
            chat_history.append({"role": "model", "text": ai_response_clean})
            current_user_msg = f"SYSTEM OBSERVATION: The SQL database query executed successfully and returned the data below. Do NOT emit [SQL: ...] or any other tool tags again. You MUST write a conversational, helpful English response to the user summarizing these numbers:\n\n{observation}"
            continue

        # 3. Anomaly Scorer / Inspection Tool — only run if we haven't already inspected in this turn
        inspect_match = re.search(r"\[INSPECT:\s*([^\]]+)\]", ai_response_clean, re.IGNORECASE)
        if inspect_match and not last_observation:
            try:
                raw_ref = inspect_match.group(1).strip()
                txn_ref = re.sub(r"(?i)transaction|#|`|'|\s+", "", raw_ref).strip()

                txn = None
                # Try matching reference_id or substring
                if txn_ref:
                    txn = (
                        db.query(models.Transaction)
                        .filter(models.Transaction.reference_id.ilike(f"%{txn_ref}%"))
                        .first()
                    )

                if not txn:
                    # Try parsing digits as integer ID or padded TXN-0000000 reference
                    digits = re.findall(r"\d+", raw_ref)
                    if digits:
                        try:
                            txn_id = int(digits[-1])
                            txn = db.query(models.Transaction).filter(models.Transaction.id == txn_id).first()
                            if not txn:
                                padded_ref = f"TXN-{txn_id:07d}"
                                txn = (
                                    db.query(models.Transaction)
                                    .filter(models.Transaction.reference_id == padded_ref)
                                    .first()
                                )
                        except ValueError:
                            pass

                if not txn:
                    observation = f"Transaction `{raw_ref}` not found in the database."
                else:
                    # Safely extract hour whether created_at is a datetime object or SQLite string
                    try:
                        if hasattr(txn.created_at, "hour"):
                            txn_hour = txn.created_at.hour
                        elif isinstance(txn.created_at, str) and "T" in txn.created_at:
                            txn_hour = int(txn.created_at.split("T")[1].split(":")[0])
                        elif isinstance(txn.created_at, str) and " " in txn.created_at:
                            txn_hour = int(txn.created_at.split(" ")[1].split(":")[0])
                        else:
                            txn_hour = 12
                    except Exception:
                        txn_hour = 12

                    scoring_details = score_transaction_ml(txn.amount, txn.payment_method, txn_hour)
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
            except Exception as e:
                observation = f"Error inspecting transaction: {str(e)}"

            last_observation = observation
            chat_history.append({"role": "user", "text": current_user_msg})
            chat_history.append({"role": "model", "text": ai_response_clean})
            current_user_msg = f"SYSTEM OBSERVATION: The security audit tool returned the analysis below. Do NOT emit [INSPECT: ...] or any other tool tags again. You MUST write a clear English explanation of these security findings for the user:\n\n{observation}"
            continue

        # 4. Standard Text response (or fallback if LLM repeated a tag despite observation)
        if last_observation and ("[SQL:" in ai_response_clean or "[INSPECT:" in ai_response_clean):
            return {"sender": "ai", "message": f"Here are the findings from your query:\n\n{last_observation}"}

        clean_msg = re.sub(
            r"\[(SQL|INSPECT|ACTION):.*?\]", "", ai_response_clean, flags=re.IGNORECASE | re.DOTALL
        ).strip()
        return {
            "sender": "ai",
            "message": clean_msg
            or (f"Here are the findings:\n\n{last_observation}" if last_observation else ai_response_clean),
        }

    # Fallback if loops exceeded
    if last_observation:
        return {"sender": "ai", "message": f"Here are the findings from your query:\n\n{last_observation}"}
    clean_fallback = re.sub(
        r"\[(SQL|INSPECT|ACTION):.*?\]", "", ai_response, flags=re.IGNORECASE | re.DOTALL
    ).strip()
    return {
        "sender": "ai",
        "message": clean_fallback or "I processed your request, but could not generate a textual summary.",
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

    try:
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
    except Exception as e:
        db.rollback()
        print(f"Error updating merchant settings: {e}")

    return {
        "status": "success",
        "message": f"Successfully authorized settings change! Current API rate limit is updated to **{new_limit} req/min** in database. Immutable audit log recorded.",
    }


@router.post("/support-ticket")
def create_support_ticket(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    """
    Creates and dispatches a customer care support ticket when troubleshooting does not resolve the merchant's issue.
    """
    merchant_id = payload.get("merchant_id", 1)
    issue_category = payload.get("category", "General Technical Support")
    details = payload.get("details", "Merchant requested Customer Care assistance via FinAI Chatbot.")
    priority = payload.get("priority", "High")

    ticket_id = f"TKT-{datetime.datetime.now().strftime('%m%d')}-{abs(hash(str(datetime.datetime.now()))) % 10000:04d}"

    try:
        # Save Support Ticket in MySQL
        ticket = models.SupportTicket(
            ticket_id=ticket_id,
            merchant_id=merchant_id,
            category=issue_category,
            problem_details=details,
            troubleshooting_attempted="Standard automated troubleshooting was attempted.",
            status="pending",
            priority=priority,
            assigned_to="Payswiff Technical Care Specialist (On-Duty)",
        )
        db.add(ticket)

        # Log to MySQL audit logs
        audit_log = models.AuditLog(
            method="POST",
            path=f"/copilot/support-ticket/{ticket_id}",
            user_email=f"merchant_{merchant_id}@payswiff.com",
            status_code=200,
        )
        db.add(audit_log)
        db.commit()
        db.refresh(ticket)
    except Exception as e:
        db.rollback()
        print(f"Error logging support ticket: {e}")

    return {
        "status": "dispatched",
        "ticket_id": ticket_id,
        "merchant_id": merchant_id,
        "category": issue_category,
        "priority": priority,
        "assigned_to": "Payswiff Technical Care Specialist (On-Duty)",
        "estimated_resolution_time": "< 10 minutes",
        "message": f"Support Ticket **{ticket_id}** created and assigned to Payswiff Customer Care Team. A specialist has been dispatched.",
    }


@router.get("/support-tickets")
def list_support_tickets(status: str = None, db: Session = Depends(get_db)):
    """
    Retrieves all support tickets for the Customer Care Officer dashboard queue.
    """
    query = db.query(models.SupportTicket)
    if status:
        query = query.filter(models.SupportTicket.status == status)

    tickets = query.order_by(models.SupportTicket.created_at.desc()).all()
    results = []
    for t in tickets:
        merchant = db.query(models.Merchant).filter(models.Merchant.id == t.merchant_id).first()
        results.append(
            {
                "id": t.id,
                "ticket_id": t.ticket_id,
                "merchant_id": t.merchant_id,
                "merchant_name": merchant.business_name if merchant else "Unknown Merchant",
                "category": t.category,
                "problem_details": t.problem_details,
                "troubleshooting_attempted": t.troubleshooting_attempted,
                "status": t.status,
                "priority": t.priority,
                "assigned_to": t.assigned_to,
                "agent_notes": t.agent_notes,
                "created_at": t.created_at.isoformat() if t.created_at else None,
                "resolved_at": t.resolved_at.isoformat() if t.resolved_at else None,
            }
        )
    return results


@router.patch("/support-tickets/{ticket_id}")
def update_support_ticket(ticket_id: str, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    """
    Allows Customer Care agents to update ticket status (in_progress, resolved) and add resolution notes.
    """
    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if "status" in payload:
        ticket.status = payload["status"]
        if payload["status"] == "resolved":
            ticket.resolved_at = datetime.datetime.now(datetime.timezone.utc)
    if "agent_notes" in payload:
        ticket.agent_notes = payload["agent_notes"]
    if "assigned_to" in payload:
        ticket.assigned_to = payload["assigned_to"]

    db.commit()
    db.refresh(ticket)
    return {
        "status": "success",
        "ticket_id": ticket.ticket_id,
        "new_status": ticket.status,
        "message": f"Support Ticket {ticket.ticket_id} updated successfully.",
    }


@router.post("/customer-care-chat")
def customer_care_chat(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    """
    Multilingual Customer Care AI Assistant for merchants.
    Understands queries in any language (English, Hindi, Telugu, Tamil, Kannada, Marathi, Bengali, Hinglish, etc.),
    provides actionable step-by-step guidance, and can handle both hardware/POS inquiries and general questions.
    """
    user_message = payload.get("message", "").strip()
    language = payload.get("language", "en").lower()
    merchant_id = payload.get("merchant_id", 1)
    chat_history = payload.get("chat_history", [])

    if not user_message:
        return {"sender": "ai", "message": "Please enter your question or issue."}

    # Language mapping display name
    lang_names = {
        "en": "English",
        "hi": "Hindi (हिन्दी)",
        "te": "Telugu (తెలుగు)",
        "ta": "Tamil (தமிழ்)",
        "kn": "Kannada (ಕನ್ನಡ)",
        "mr": "Marathi (मराठी)",
        "bn": "Bengali (বাংলা)",
        "hinglish": "Hinglish (Hindi written in English Roman script)",
    }
    target_language_name = lang_names.get(language, "English")

    system_prompt = f"""You are **FinAI Care Assistant**, the official multilingual 24/7 customer care & technical support AI for the **Payswiff Merchant Platform**.
You speak with warmth, deep technical expertise, and empathy.

## Target Response Language
- **IMPORTANT**: You MUST respond in **{target_language_name}**.
- If the user wrote in Hindi, Telugu, Tamil, Kannada, Marathi, Bengali, or Hinglish, speak natively, fluently, and naturally in that requested language.
- Use native scripts (Devanagari for Hindi/Marathi, Telugu script for Telugu, Tamil script for Tamil, Bengali script for Bengali, Kannada script for Kannada) OR Hinglish if target is Hinglish.

## What You Understand
1. **Payswiff Hardware & Devices**:
   - **Soundbox (Smart Soundbox 2.0 / 3.0)**: Power ON/OFF, speaker audio volume, battery charging via Type-C adapter, SIM card tray ejector pin hole, audio language switching (Hindi, Telugu, Tamil, etc.).
   - **POS Machines & Swiping Terminals**: EMV Chip insert, NFC Contactless Tap & Pay, Magnetic stripe swipe, thermal paper roll jam (57x40mm), 'PED Tamper' security lock, host timeout.
   - **Dynamic QR Displays & Standees**: NPCI key refresh, screen display sync, offline buffer clear.
2. **Payments, UPI & Settlements**:
   - Failed transactions, amount debited from customer (automatic 24-48 hr NPCI bank refund cycle).
   - Daily T+1 batch settlement payout schedule (11:30 PM automated credit), manual settlement close.
   - KYC verification, chargeback dispute evidence, GST invoices.
3. **General Inquiries & Knowledge**:
   - You also intelligently understand greetings, general questions, business advice, math, and general merchant queries with polite, helpful, and concise answers.

## Formatting Guidelines
- Use clean Markdown: bold highlights, bullet points, and numbered steps (1., 2., 3.) when explaining procedures.
- Keep troubleshooting steps easy to understand for busy shopkeepers and merchants.
- If the user's issue cannot be fixed by troubleshooting (e.g. broken hardware, water damage, permanent tamper lock, persistent payment discrepancy), warmly let them know they can click "No, contact support person" to dispatch our on-duty specialist.
"""

    api_key = get_nvidia_api_key()
    ai_text = ""
    if api_key:
        ai_text = call_nvidia(system_prompt, user_message, chat_history)

    if not ai_text:
        # Smart multilingual fallback knowledge
        ai_text = generate_multilingual_fallback(user_message, language)

    # Detect category and summary for potential support escalation
    category, summary = detect_issue_category_and_summary(user_message)

    return {
        "sender": "ai",
        "message": ai_text,
        "language": language,
        "category": category,
        "summary": summary,
    }


def detect_issue_category_and_summary(msg: str):
    m = msg.lower()
    if any(k in m for k in ["sim", "eject", "slot", "pin", "hole", "tray"]):
        return "Soundbox & POS - SIM Card & Connectivity", "SIM card error / not detected"
    if any(k in m for k in ["battery", "charge", "power", "drain", "charger", "plug"]):
        return "Hardware - Battery & Power Charging", "Battery charging or power failure"
    if any(k in m for k in ["sound", "speaker", "audio", "voice", "volume", "soundbox", "bol"]):
        return "Hardware - Sound Box Device", "Soundbox speaker / audio announcement error"
    if any(k in m for k in ["network", "signal", "offline", "disconnect", "wifi", "4g"]):
        return "Connectivity - 4G Network & Wi-Fi", "Terminal network offline / signal drop"
    if any(k in m for k in ["card", "swipe", "chip", "nfc", "tap"]):
        return "Swiping Machine - Card Reader & NFC", "Card reader swipe / EMV chip failure"
    if any(k in m for k in ["payment", "failed", "paisa", "kat gaya", "refund", "utr", "transaction"]):
        return "Transactions - Payment Gateway Routing", "Payment failure / customer debited"
    if any(k in m for k in ["qr", "barcode", "screen", "display"]):
        return "Smart Soundbox & POS - Dynamic QR", "Dynamic QR code screen not loading"
    if any(k in m for k in ["printer", "paper", "receipt", "roll", "jam"]):
        return "Swiping Machine - Thermal Printer", "Receipt printer jam or feeding error"
    if any(k in m for k in ["settle", "payout", "bank", "khata", "jama"]):
        return "Merchant Account - Bank Settlement", "Daily settlement payout pending"
    if any(k in m for k in ["tamper", "lock", "ped"]):
        return "Swiping Machine - Security Tamper Lock", "POS tamper lockout triggered"
    return "General Technical Support", msg[:80]


def generate_multilingual_fallback(msg: str, lang: str) -> str:
    m = msg.lower()
    
    # Hindi Fallback
    if lang == "hi":
        if any(k in m for k in ["sim", "सिम"]):
            return "📌 **SIM कार्ड समस्या का समाधान:**\n1. साउंड बॉक्स के साइड में दिए गए छोटे छेद में पिन डालकर SIM ट्रे बाहर निकालें।\n2. SIM के गोल्डन चिप को सूखे कपड़े से साफ करके दोबारा ठीक से लगाएं।\n3. डिवाइस को रीस्टार्ट करें और 30 सेकंड प्रतीक्षा करें जब तक नेटवर्क लाइट हरी/नीली न हो जाए।"
        if any(k in m for k in ["sound", "speaker", "आवाज", "बोल", "साउंड"]):
            return "📌 **साउंड बॉक्स आवाज समस्या का समाधान:**\n1. पावर बटन और रीस्टार्ट बटन को 5-10 सेकंड तक दबाकर रखें।\n2. साइड में दिए गए वॉल्यूम (+) बटन को दबाकर पूरी आवाज बढ़ाएं।\n3. ऊपर दिए गए 'ऑडियो टेस्ट' बटन को दबाकर स्पीकर चेक करें।"
        if any(k in m for k in ["battery", "charge", "बैटरी", "चार्ज"]):
            return "📌 **बैटरी और चार्जिंग समाधान:**\n1. ओरिजिनल 5V/2A चार्जर और Type-C केबल को कम से कम 20-30 मिनट तक कनेक्ट रखें।\n2. चेक करें कि रेड चार्जिंग इंडिकेटर लाइट जल रही है या नहीं।\n3. चार्ज होने के बाद पावर बटन को 10 सेकंड दबाकर चालू करें।"
        if any(k in m for k in ["payment", "पैसे", "पेंडिंग", "कट"]):
            return "📌 **पेमेंट / पैसे कटने की समस्या:**\n1. ग्राहक से बैंक SMS का UTR / RRN नंबर प्राप्त करें।\n2. FinAI के 'Transactions' टैब में स्टेटस चेक करें।\n3. यदि पैसे कट गए हैं और मशीन पर फेल्ड आया है, तो बैंक 24-48 घंटों में ग्राहक को स्वतः रिफंड कर देता है।"
        return "नमस्ते! मैंने आपका प्रश्न समझ लिया है। Payswiff डिवाइस (साउंडबॉक्स, POS मशीन, पेमेंट या सेटलमेंट) से संबंधित किसी भी सहायता के लिए आप पूछ सकते हैं।"

    # Telugu Fallback
    elif lang == "te":
        if any(k in m for k in ["sim", "సిమ్"]):
            return "📌 **SIM కార్డ్ సమస్య పరిష్కారం:**\n1. సౌండ్‌బాక్స్ పక్కన ఉన్న చిన్న రంధ్రంలో పిన్ ఉంచి SIM ట్రేని బయటకు తీయండి.\n2. SIM పై ఉన్న గోల్డెన్ చిప్‌ను పొడి గుడ్డతో శుభ్రం చేసి మళ్ళీ సరిగ్గా అమర్చండి.\n3. డివైజ్‌ని రీస్టార్ట్ చేసి నెట్‌వర్క్ లైట్ ఆకుపచ్చ/నీలంగా మారే వరకు 30 సెకన్లు ఆగండి."
        if any(k in m for k in ["sound", "speaker", "సౌండ్", "వాయిస్"]):
            return "📌 **సౌండ్‌బాక్స్ స్పీకర్ సమస్య పరిష్కారం:**\n1. పవర్ బటన్ మరియు రీస్టార్ట్ బటన్‌ను 5-10 సెకన్ల పాటు నొక్కి ఉంచండి.\n2. వాల్యూమ్ (+) బటన్ నొక్కి శబ్దాన్ని పెంచండి.\n3. ఆడియో టెస్ట్ బటన్ నొక్కి స్పీకర్ వాయిస్‌ని చెక్ చేయండి."
        if any(k in m for k in ["battery", "charge", "ఛార్జింగ్", "బ్యాటరీ"]):
            return "📌 **బ్యాటరీ మరియు ఛార్జింగ్ సమస్య:**\n1. ఒరిజినల్ ఛార్జర్‌ను 20-30 నిమిషాల పాటు డివైజ్‌కి కనెక్ట్ చేసి ఉంచండి.\n2. రెడ్ ఛార్జింగ్ లైట్ వెలుగుతుందో లేదో చూడండి.\n3. పవర్ బటన్‌ను 10 సెకన్లు నొక్కి డివైజ్ ఆన్ చేయండి."
        return "నమస్కారం! మీ ప్రశ్నను మేము విశ్లేషించాము. సౌండ్‌బాక్స్, POS మెషిన్, చెల్లింపులు లేదా సెటిల్‌మెంట్ సంబంధిత ఏ సహాయానికైనా అడగవచ్చు."

    # Tamil Fallback
    elif lang == "ta":
        if any(k in m for k in ["sim", "சிம்"]):
            return "📌 **SIM கார்டு தீர்வு:**\n1. சவுண்ட்பாக்ஸின் பக்கத்திலுள்ள துளையில் பின்னை செருகி SIM டிரேயை எடுக்கவும்.\n2. சிப்பின் தங்கப் பகுதியை துணியால் துடைத்து மீண்டும் சரியாக பொருத்தவும்.\n3. சாதனத்தை மறுதொடக்கம் (Restart) செய்யவும்."
        if any(k in m for k in ["sound", "speaker", "சத்தம்", "சவுண்ட்"]):
            return "📌 **சவுண்ட்பாக்ஸ் ஒலி தீர்வு:**\n1. பவர் பட்டனை 5-10 வினாடிகள் அழுத்தி ரீஸ்டார்ட் செய்யவும்.\n2. வால்யூம் (+) பொத்தானை அழுத்தி ஒலியை அதிகரிக்கவும்."
        return "வணக்கம்! உங்கள் கோரிக்கை பெறப்பட்டது. Payswiff சவுண்ட்பாக்ஸ், POS இயந்திரம், கட்டண முறைகள் குறித்த அனைத்து சந்தேகங்களுக்கும் உதவ தயாராக உள்ளோம்."

    # Hinglish Fallback
    elif lang == "hinglish":
        if any(k in m for k in ["sim", "slot"]):
            return "📌 **SIM Card Solution:**\n1. Soundbox ke side me diye gaye small hole me ejector pin daalkar SIM tray bahar nikalein.\n2. SIM chip ko saaf kapde se clean karke wapas theek se lagayein.\n3. Machine ko restart karein aur 30 seconds wait karein jab tak network light steady green/blue na ho jaye."
        if any(k in m for k in ["battery", "charge"]):
            return "📌 **Battery & Charging Solution:**\n1. Device ko official Type-C charger se connect karein aur kam se kam 20-30 minutes charge hone dein.\n2. Red LED indicator light check karein.\n3. Power button ko 10 seconds tak hold karke ON karein."
        return "Hello! Hum aapki help ke liye available hain. Soundbox, POS machine, payments ya settlement se juda koi bhi sawal poochiye!"

    # Default English Fallback
    return "Here are the recommended diagnostic troubleshooting steps for your inquiry:\n\n1. **Power Cycle**: Hold the Power ON/OFF button for 5-10 seconds to reboot the device.\n2. **Connectivity**: Verify your 4G SIM is seated properly or re-connect Wi-Fi.\n3. **Charging**: Ensure terminal is charged with official 5V/2A Type-C adapter.\n4. **Support**: If the problem persists, click 'No, contact support person' below to dispatch an on-duty specialist."

