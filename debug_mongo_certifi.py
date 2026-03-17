from pymongo import MongoClient
import json
import os
import certifi

def load_secrets():
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        path = os.path.join(base_dir, "data", "secrets.json")
        if not os.path.exists(path):
            return {}
        with open(path, "r") as f:
            return json.load(f)
    except Exception:
        return {}

def test_connection():
    secrets = load_secrets()
    mongo_uri = secrets.get("MONGO_URI", "")
    
    print(f"Testing Remote URI with certifi...")
    if mongo_uri:
        try:
            client = MongoClient(mongo_uri, 
                               tlsCAFile=certifi.where(),
                               serverSelectionTimeoutMS=5000)
            client.server_info()
            print("Remote Connection Successful with certifi!")
            return True
        except Exception as e:
            print(f"Remote Connection Failed with certifi: {e}")
    return False

if __name__ == "__main__":
    test_connection()
