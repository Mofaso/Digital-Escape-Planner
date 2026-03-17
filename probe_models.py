import sys
import os
import json
import time
from google import genai

# Force UTF-8 for stdout
sys.stdout.reconfigure(encoding='utf-8')

def load_secrets():
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        path = os.path.join(base_dir, "data", "secrets.json")
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading secrets: {e}")
        return {}

def probe():
    secrets = load_secrets()
    key = secrets.get("GEMINI_API_KEY", "")
    if not key:
        print("No API Key found.")
        return

    try:
        client = genai.Client(api_key=key)
    except Exception as e:
        print(f"Client init failed: {e}")
        return

    # List of candidates to try
    candidates = [
        "gemini-2.5-flash",
        "gemini-flash-latest",
        "gemini-pro-latest",
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash-8b",
        "gemini-1.5-flash"
    ]

    print(f"Probing {len(candidates)} models...")

    for model in candidates:
        print(f"\n--- Testing: {model} ---")
        try:
            response = client.models.generate_content(
                model=model,
                contents="Hello"
            )
            print(f"[SUCCESS] Model: {model}")
            print(f"Response: {response.text[:50]}...")
            print(f"!!! USE THIS MODEL: {model} !!!")
            return
        except Exception as e:
            print(f"[FAILED] ({model}): {e}")
            time.sleep(1)

if __name__ == "__main__":
    probe()
