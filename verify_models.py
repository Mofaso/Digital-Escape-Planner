import os
import json
from google import genai
import traceback
import sys

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

def list_models():
    secrets = load_secrets()
    key = secrets.get("GEMINI_API_KEY", "")
    if not key:
        print("No API Key found.")
        return
    
    try:
        client = genai.Client(api_key=key)
        print("Client initialized. Fetching models...")
        
        with open("models.txt", "w", encoding="utf-8") as f:
            count = 0
            try:
                for m in client.models.list():
                    # Check available attributes
                    if count == 0:
                        print(f"Model attributes: {dir(m)}")
                    
                    try:
                        name = m.name if hasattr(m, 'name') else str(m)
                        # Avoid attribute errors
                        line = f"Model: {name}"
                        print(line)
                        f.write(line + "\n")
                        count += 1
                    except Exception as inner_e:
                        f.write(f"Error processing model: {inner_e}\n")
            except Exception as outer_e:
                f.write(f"Error listing models: {outer_e}\n")
                print(f"Error listing models: {outer_e}")
                
            f.write(f"\nTotal models found: {count}\n")
            print(f"Total models found: {count}")

    except Exception as e:
        with open("models.txt", "w", encoding="utf-8") as f:
            f.write(f"Client Init Error: {e}\n")
        print(f"Client Init Error: {e}")

if __name__ == "__main__":
    list_models()
