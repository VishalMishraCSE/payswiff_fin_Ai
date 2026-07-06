import requests
import os

# Load environment
if os.path.exists(".env"):
    with open(".env", "r") as f:
        for line in f:
            if "=" in line:
                k, v = line.strip().split("=", 1)
                os.environ[k.strip()] = v.strip().strip('"').strip("'")

key = os.getenv("GEMINI_API_KEY", "")
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={key}"

print("Listing models...")
res = requests.get(url)
print(f"Status Code: {res.status_code}")
if res.status_code == 200:
    models_data = res.json()
    for m in models_data.get("models", []):
        print(f"Model: {m.get('name')} - Supported methods: {m.get('supportedGenerationMethods')}")
else:
    print(f"Response: {res.text}")
