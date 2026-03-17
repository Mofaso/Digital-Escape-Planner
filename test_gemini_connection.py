import json
import os
import google.generativeai as genai
from safety_ai_gemini import generate_response, start_config

def load_secrets():
    try:
        with open("data/secrets.json", "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading secrets.json: {e}")
        return {}

secrets = load_secrets()
GEMINI_KEY = secrets.get("GEMINI_API_KEY", "")

print(f"Loaded Key: {GEMINI_KEY[:5]}...{GEMINI_KEY[-5:] if GEMINI_KEY else ''}")

if not GEMINI_KEY:
    print("FATAL: No API key found.")
    exit(1)

start_config(GEMINI_KEY)

try:
    print("Attempting to generate response...")
    response = generate_response("I am stuck in a room.", profile="TestUser")
    print("Response received:")
    print(response)
except Exception as e:
    print("FATAL EXCEPTION:")
    print(e)
