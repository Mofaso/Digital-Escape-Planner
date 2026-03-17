
import google.generativeai as genai
import json
import os
import sys

# Add current directory to path so we can import safety_ai_gemini
sys.path.append(os.getcwd())

from safety_ai_gemini import generate_response, start_config

def load_secrets():
    try:
        if os.path.exists("data/secrets.json"):
            with open("data/secrets.json", "r") as f:
                return json.load(f)
        # Fallback path if running from root but data is in subfolder
        elif os.path.exists("e:/DigitalEscapePlanner/data/secrets.json"):
             with open("e:/DigitalEscapePlanner/data/secrets.json", "r") as f:
                return json.load(f)
        return {}
    except Exception as e:
        print(f"Error loading secrets: {e}")
        return {}

def main():
    print("Loading secrets...")
    secrets = load_secrets()
    api_key = secrets.get("GEMINI_API_KEY")
    
    if not api_key:
        print("Error: GEMINI_API_KEY not found in secrets.json")
        return

    print(f"Configuring Gemini with key ending in ...{api_key[-4:]}")
    start_config(api_key)
    
    print("Sending test message to Gemini...")
    try:
        response = generate_response("Hello, this is a test for safety protocols.", configure_only=False)
        print("\n--- Response ---")
        print(response)
        print("----------------")
        
        if "trouble connecting" in response:
             print("FAILURE: Connection issue still present.")
        else:
             print("SUCCESS: Received valid response.")
             
    except Exception as e:
        print(f"FAILURE: Exception occurred: {e}")

if __name__ == "__main__":
    main()
