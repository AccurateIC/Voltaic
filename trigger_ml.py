import requests
import json

url = "http://localhost:5011/user"
payload = {
    "email": "dhananjay@accurateic.in",
    "logged_in": True
}

try:
    response = requests.post(url, json=payload, timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
