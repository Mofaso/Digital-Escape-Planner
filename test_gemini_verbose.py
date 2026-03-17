import sys
import io
import traceback
from safety_ai_gemini import generate_response, start_config
import json

# Redirect stderr to stdout
sys.stderr = sys.stdout

def load_secrets():
    try:
        with open("data/secrets.json", "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading secrets: {e}")
        return {}

print("STARTING TEST")
secrets = load_secrets()
key = secrets.get("GEMINI_API_KEY")
if not key:
    print("NO KEY")
    sys.exit(1)

print(f"Configuring with key length: {len(key)}")
start_config(key)

print("Calling generate_response...")
resp = generate_response("test", profile="test")
print("Response returned:")
print(resp)
print("TEST COMPLETE")
