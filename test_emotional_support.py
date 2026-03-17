
from safety_ai_gemini import generate_response
import os
import json

# Mock secrets to get API key if needed, or assume it's set in env/file
# For this test we can try to use the existing secrets loading or just rely on the env if set.
# But main.py loads secrets. Let's start_config manually if needed.
# However, safety_ai_gemini handles configuration if key is passed.

def load_secrets():
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        path = os.path.join(base_dir, "data", "secrets.json")
        if not os.path.exists(path):
            return {}
        with open(path, "r") as f:
            return json.load(f)
    except:
        return {}

secrets = load_secrets()
GEMINI_KEY = secrets.get("GEMINI_API_KEY", "")

# Test Case 1: Panic State
print("\n--- TEST CASE 1: PANIC STATE ---")
metadata_panic = {
    "cpm": 450,
    "variability": 200,
    "total_time": "2.50",
    "char_count": 20
}
response_panic = generate_response("I am lost and scared", metadata=metadata_panic, api_key=GEMINI_KEY)
print(f"User: I am lost and scared (High Typing Speed)")
print(f"AI: {response_panic}\n")

# Test Case 2: Calm State
print("\n--- TEST CASE 2: CALM STATE ---")
metadata_calm = {
    "cpm": 150,
    "variability": 20,
    "total_time": "5.00",
    "char_count": 20
}
response_calm = generate_response("What should I do if I think I'm being followed?", metadata=metadata_calm, api_key=GEMINI_KEY)
print(f"User: What should I do if I think I'm being followed? (Normal Typing Speed)")
print(f"AI: {response_calm}\n")
