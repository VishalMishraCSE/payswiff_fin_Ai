import requests
import random
import sys

BASE_URL = "http://127.0.0.1:8000"


def test_health():
    print("Testing / health endpoint...")
    response = requests.get(f"{BASE_URL}/")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert data["status"] == "ok", "Expected status 'ok'"
    print("[OK] Health check passed!")


def test_auth_and_analytics():
    email = f"test_merchant_{random.randint(1000, 9999)}@payswiff.com"
    password = "SecurePassword123!"

    print(f"\nTesting merchant registration with email: {email}...")
    reg_response = requests.post(
        f"{BASE_URL}/auth/register", json={"email": email, "password": password, "role": "merchant"}
    )
    assert reg_response.status_code == 201, f"Expected 201, got {reg_response.status_code}"
    print("[OK] Merchant registration passed!")

    print("\nTesting merchant login...")
    login_response = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    assert login_response.status_code == 200, f"Expected 200, got {login_response.status_code}"
    token_data = login_response.json()
    assert "access_token" in token_data, "Access token missing in response"
    token = token_data["access_token"]
    print("[OK] Merchant login passed!")

    # Set Auth headers
    headers = {"Authorization": f"Bearer {token}"}

    print("\nTesting /analytics/dashboard endpoint...")
    dash_response = requests.get(f"{BASE_URL}/analytics/dashboard", headers=headers)
    assert dash_response.status_code == 200, f"Expected 200, got {dash_response.status_code}"
    dash_data = dash_response.json()
    print(f"Dashboard metrics: {dash_data}")
    assert "total_revenue" in dash_data
    assert "total_transactions" in dash_data
    print("[OK] Dashboard metrics API passed!")

    print("\nTesting /analytics/revenue_trend endpoint...")
    trend_response = requests.get(f"{BASE_URL}/analytics/revenue_trend", headers=headers)
    assert trend_response.status_code == 200, f"Expected 200, got {trend_response.status_code}"
    trend_data = trend_response.json()
    print(f"Revenue Trend data length: {len(trend_data)}")
    assert len(trend_data) > 0
    print("[OK] Revenue trend API passed!")

    print("\nTesting /analytics/status_breakdown endpoint...")
    breakdown_response = requests.get(f"{BASE_URL}/analytics/status_breakdown", headers=headers)
    assert breakdown_response.status_code == 200, f"Expected 200, got {breakdown_response.status_code}"
    breakdown_data = breakdown_response.json()
    print(f"Status breakdown: {breakdown_data}")
    assert len(breakdown_data) > 0
    print("[OK] Status breakdown API passed!")

    print("\nTesting /analytics/forecast endpoint...")
    forecast_response = requests.get(f"{BASE_URL}/analytics/forecast", headers=headers)
    assert forecast_response.status_code == 200, f"Expected 200, got {forecast_response.status_code}"
    forecast_data = forecast_response.json()
    assert "data" in forecast_data
    assert "model_metadata" in forecast_data
    print("[OK] ML Forecasting API passed!")


if __name__ == "__main__":
    try:
        test_health()
        test_auth_and_analytics()
        print("\n*** ALL API METRIC ENDPOINT VALIDATION RUNS PASSED SUCCESSFULLY! ***")
    except AssertionError as e:
        print(f"\n[FAIL] Validation test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n[FAIL] Unexpected error: {e}")
        sys.exit(1)
