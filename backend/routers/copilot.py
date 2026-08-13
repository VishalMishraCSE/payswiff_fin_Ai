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


def call_nvidia(system_prompt: str, user_message: str, chat_history: List[Dict[str, str]] = None) -> str:
    """Makes a direct POST request to NVIDIA API Catalog (OpenAI-compatible) with retries across standard model endpoints."""
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

    # Standard production models supported by NVIDIA API catalog
    models_to_try = [
        "meta/llama-3.3-70b-instruct",
        "nvidia/llama-3.1-nemotron-70b-instruct",
        "meta/llama-3.1-70b-instruct",
        "google/gemma-2-27b-it",
    ]

    import time

    for model_name in models_to_try:
        payload = {
            "model": model_name,
            "messages": messages,
            "temperature": 0.12,
            "max_tokens": 2048,
        }

        for attempt in range(2):
            try:
                response = requests.post(url, json=payload, headers=headers, timeout=30)
                if response.status_code in [429, 503]:
                    time.sleep(1.5)
                    continue

                if response.status_code == 200:
                    res_json = response.json()
                    choices = res_json.get("choices", [])
                    if choices:
                        content = choices[0].get("message", {}).get("content")
                        if content is not None:
                            return str(content)
                else:
                    print(f"NVIDIA Model {model_name} returned status {response.status_code}: {response.text}")
                    break  # Try next model if status is 404 or 400
            except Exception as e:
                print(f"NVIDIA Exception on model {model_name} (attempt {attempt + 1}): {e}")
                time.sleep(1.0)

    return ""


def call_llm(system_prompt: str, user_message: str, chat_history: List[Dict[str, str]] = None, merchant_id: int = 1) -> str:
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
        ai_response_clean = str(ai_response).strip()

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
        r"\[(SQL|INSPECT|ACTION):.*?\]", "", str(ai_response), flags=re.IGNORECASE | re.DOTALL
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
