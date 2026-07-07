import requests
import sys
import io

if hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "buffer"):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

BASE_URL = "http://127.0.0.1:8000"


def test_mock_pay():
    print("Testing mock payment sandbox API...")
    payload = {
        "customer_name": "Test Runner",
        "customer_email": "testrunner@payswiff.com",
        "amount": 18500.0,
        "payment_method": "Card",
    }
    res = requests.post(f"{BASE_URL}/transactions/mock-pay", json=payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"

    data = res.json()
    print(f"Mock Pay Response: {data}")
    assert data.get("reference_id").startswith("TXN-MOCK-"), "Expected reference ID format TXN-MOCK-*"
    assert data.get("amount") == 18500.0
    assert data.get("payment_method") == "Card"
    assert "status" in data
    assert "fraud_score" in data
    print("[OK] Mock Pay API test passed!")


if __name__ == "__main__":
    try:
        test_mock_pay()
        print("\n*** MOCK PAY API INTEGRATION TEST PASSED SUCCESSFULLY! ***")
    except AssertionError as e:
        print(f"\n[FAIL] Assertion failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n[FAIL] Unexpected error: {e}")
        sys.exit(1)
