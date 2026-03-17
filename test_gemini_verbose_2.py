import sys
import io
import traceback
import google.generativeai as genai
from safety_ai_gemini import start_config
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

print(f"Configuring with key: {key[:5]}...")
start_config(key)

model = genai.GenerativeModel("gemini-flash-latest")
print("Model initialized: gemini-1.5-flash")

try:
    print("Calling generate_content...")
    response = model.generate_content("Hello, this is a test.")
    print("Response object received.")
    print(f"Response text: {response.text}")
except Exception as e:
    print("CAUGHT EXCEPTION:")
    print(e)
    traceback.print_exc()

print("TEST COMPLETE")
