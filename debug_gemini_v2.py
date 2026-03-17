import os
import json
import google.generativeai as genai
import traceback

def load_secrets():
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        path = os.path.join(base_dir, "data", "secrets.json")
        with open(path, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading secrets: {e}")
        return {}

def test_gemini():
    secrets = load_secrets()
    api_key = secrets.get("GEMINI_API_KEY")
    
    if not api_key:
        print("CRITICAL: No API Key found in secrets.json")
        return

    print(f"DEBUG: Found API Key: {api_key[:5]}...{api_key[-5:] if len(api_key)>5 else ''}")
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash") # Trying a known stable model name first
        
        print("DEBUG: Sending test prompt...")
        response = model.generate_content("Hello, can you hear me?")
        print(f"SUCCESS: Response received: {response.text}")
        
    except Exception:
        print("ERROR: Gemini API Call Failed.")
        traceback.print_exc()

    print("-" * 20)
    print("Testing original code's model name 'gemini-flash-latest'...")
    try:
        model = genai.GenerativeModel("gemini-flash-latest")
        response = model.generate_content("Hello?")
        print(f"SUCCESS: Response received with gemini-flash-latest: {response.text}")
    except Exception:
        print("ERROR: gemini-flash-latest Failed.")
        traceback.print_exc()

if __name__ == "__main__":
    test_gemini()
