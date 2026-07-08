import requests
import os

# Load environment
if os.path.exists(".env"):
    with open(".env", "r") as f:
        for line in f:
            if "=" in line:
                k, v = line.strip().split("=", 1)
                os.environ[k.strip()] = v.strip().strip('"').strip("'")

key = os.getenv("NVIDIA_API_KEY", "")
url = "https://integrate.api.nvidia.com/v1/chat/completions"
headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json", "Accept": "application/json"}

models_to_test = [
    "nvidia/llama-3.1-nemotron-70b-instruct",
    "meta/llama-3.3-70b-instruct",
    "nvidia/llama-3.3-nemotron-super-49b-v1",
    "nvidia/llama-3.3-nemotron-super-49b-v1.5",
    "google/gemma-3-12b-it",
]

for model in models_to_test:
    print(f"\nTesting model: {model}")
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": "Hello, write one short sentence greeting."}],
        "temperature": 0.15,
        "max_tokens": 50,
    }
    try:
        res = requests.post(url, json=payload, headers=headers, timeout=30)
        print(f"Status Code: {res.status_code}")
        if res.status_code == 200:
            res_json = res.json()
            print(f"Success Response Choices: {res_json.get('choices')}")
        else:
            print(f"Error Response: {res.text}")
    except Exception as e:
        print(f"Exception: {e}")
