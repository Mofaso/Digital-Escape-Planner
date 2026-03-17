from pymongo import MongoClient
import json
import os

def load_secrets():
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        path = os.path.join(base_dir, "data", "secrets.json")
        if not os.path.exists(path):
            print(f"Warning: secrets.json not found at {path}")
            return {}
        with open(path, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading secrets.json: {e}")
        return {}

def test_connection():
    secrets = load_secrets()
    mongo_uri = secrets.get("MONGO_URI", "")
    
    print(f"Testing Remote URI: {mongo_uri}")
    if mongo_uri:
        try:
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            client.server_info()
            print("Remote Connection Successful!")
            return
        except Exception as e:
            print(f"Remote Connection Failed: {e}")
    else:
        print("No Remote URI found.")

    print("Testing Local Connection: mongodb://localhost:27017/")
    try:
        client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=5000)
        client.server_info()
        print("Local Connection Successful!")
    except Exception as e:
        print(f"Local Connection Failed: {e}")

if __name__ == "__main__":
    test_connection()
