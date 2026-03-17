import os
import json
from google import genai
import traceback

def load_secrets():
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        path = os.path.join(base_dir, "data", "secrets.json")
        print(f"Loading secrets from: {path}")
        if not os.path.exists(path):
            print(f"Warning: secrets.json not found at {path}")
            return {}
        with open(path, "r") as f:
            data = json.load(f)
            print("Secrets loaded. Keys:", list(data.keys()))
            return data
    except Exception as e:
        print(f"Error loading secrets.json: {e}")
        return {}

def test_genai():
    secrets = load_secrets()
    key = secrets.get("GEMINI_API_KEY", "")
    if not key:
        print("No key found.")
        return

    print(f"Key loaded: {key[:5]}... ({len(key)} chars)")
    
    try:
        client = genai.Client(api_key=key)
        print("Client initialized.")
    except Exception as e:
        print(f"Client init failed: {e}")
        return

    candidates = [
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash", 
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-8b",
        "gemini-1.5-pro",
        "gemini-1.0-pro",
        "gemini-pro"
    ]

    print("\n--- Testing Model Candidates ---")
    for model in candidates:
        print(f"Testing {model}...", end=" ")
        try:
            response = client.models.generate_content(
                model=model,
                contents="Hello"
            )
            print(f"✅ SUCCESS! Response: {response.text[:20]}...")
            print(f"Recommend using: {model}")
            return
        except Exception as e:
            print(f"❌ Failed: {e}")

if __name__ == "__main__":
    test_genai()
