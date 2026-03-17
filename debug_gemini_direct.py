
import google.generativeai as genai
import json
import os
import traceback

def load_secrets():
    try:
        if os.path.exists("data/secrets.json"):
            with open("data/secrets.json", "r") as f:
                return json.load(f)
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
        print("Error: GEMINI_API_KEY not found")
        return

    print(f"Configuring Gemini...")
    genai.configure(api_key=api_key)
    
    model_name = "gemini-flash-latest"
    print(f"Testing model: {model_name}")
    
    try:
        system_instruction = "You are a helpful assistant."
        user_prompt = "Hello"
        
        print("Testing system_instruction in constructor...")
        # Pass system instruction to constructor
        model = genai.GenerativeModel("gemini-flash-latest", system_instruction=system_instruction)
        
        # Only send user message in history
        full_prompt = [
            {"role": "user", "parts": [user_prompt]},
        ]
        
        response = model.generate_content(full_prompt)

        print("SUCCESS! Response received.")
        print(response.text)
    except Exception as e:
        print("\n--- ERROR DETAILS ---")
        traceback.print_exc()
        print("---------------------")

if __name__ == "__main__":
    main()
