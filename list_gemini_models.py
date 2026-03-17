import google.generativeai as genai
import json
import os

def load_secrets():
    try:
        with open("data/secrets.json", "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading secrets: {e}")
        return {}

secrets = load_secrets()
key = secrets.get("GEMINI_API_KEY")
if key:
    genai.configure(api_key=key)

print("Listing models...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(e)
