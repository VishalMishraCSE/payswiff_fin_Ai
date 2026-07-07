import requests
import sys
import io

if hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "buffer"):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

BASE_URL = "http://127.0.0.1:8000"


def test_greeting():
    print("1. Testing AI Greeting...")
    res = requests.post(f"{BASE_URL}/copilot/chat", json={"message": "Hello, who are you?", "merchant_id": 1})
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    print(f"Copilot Response:\n{data.get('message')}\n")
    assert (
        "Copilot" in data.get("message")
        or "assistant" in data.get("message").lower()
        or "finai" in data.get("message").lower()
    ), "Expected copilot greeting info"
    print("[OK] Greeting test passed!")


def test_sql_query():
    print("\n2. Testing Agentic SQL DB Tool...")
    res = requests.post(
        f"{BASE_URL}/copilot/chat", json={"message": "Show me the last 3 transactions in my database", "merchant_id": 1}
    )
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    msg = data.get("message", "")
    print(f"Copilot Response:\n{msg}\n")
    assert (
        "|" in msg or "TXN" in msg or "transaction" in msg.lower()
    ), "Expected database results in markdown table format"
    print("[OK] Agentic SQL Query tool test passed!")


def test_inspect_transaction():
    print("\n3. Testing Transaction Inspection Tool...")
    # Find a valid transaction ID from DB or inspect #10
    res = requests.post(f"{BASE_URL}/copilot/chat", json={"message": "Inspect transaction #10", "merchant_id": 1})
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    msg = data.get("message", "")
    print(f"Copilot Response:\n{msg}\n")
    assert (
        "fraud" in msg.lower() or "security" in msg.lower() or "shap" in msg.lower()
    ), "Expected transaction audit details in response"
    print("[OK] Transaction Inspection tool test passed!")


def test_hitl_action():
    print("\n4. Testing HITL Action Card Trigger...")
    res = requests.post(
        f"{BASE_URL}/copilot/chat",
        json={"message": "Please change my rate limit to 400 requests/minute", "merchant_id": 1},
    )
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    print(f"Copilot Response:\n{data}\n")
    assert data.get("action_pending") is True, "Expected action_pending to be True"
    assert "action_card" in data, "Expected action_card payload"
    action_card = data["action_card"]
    assert action_card.get("action_id") is not None
    assert "400" in action_card.get("description")
    print("[OK] HITL Rate Limit override trigger test passed!")


if __name__ == "__main__":
    try:
        test_greeting()
        test_sql_query()
        test_inspect_transaction()
        test_hitl_action()
        print("\n*** ALL COPILOT AGENT INTEGRATION TESTS PASSED SUCCESSFULLY! ***")
    except AssertionError as e:
        print(f"\n[FAIL] Assertion failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n[FAIL] Unexpected error: {e}")
        sys.exit(1)
