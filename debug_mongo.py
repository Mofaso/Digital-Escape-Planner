
import json
import urllib.parse
from pymongo.uri_parser import parse_uri

def test_secrets():
    try:
        with open("data/secrets.json", "r") as f:
            secrets = json.load(f)
    except Exception as e:
        print(f"Error reading secrets.json: {e}")
        return

    mongo_uri = secrets.get("MONGO_URI", "")
    print(f"Loaded URI: {mongo_uri}")
    
    try:
        # Basic string parsing to show what's likely the user/pass
        if "@" in mongo_uri and "://" in mongo_uri:
            # remove scheme
            part = mongo_uri.split("://")[1]
            # get user:pass
            creds = part.split("@")[0]
            if ":" in creds:
                user, pw = creds.split(":", 1)
                
                print("\n--- DECODED CREDENTIALS ---")
                print(f"Username: {urllib.parse.unquote(user)}")
                print(f"Password: {urllib.parse.unquote(pw)}")
                print("---------------------------")
                
                print("\nNOTE: The password shown above is what MongoDB receives.")
                print("If you see an extra '>' at the end, remove '%3E' from your connection string.")
                print("If you see '@' in the password, ensure it is encoded as '%40' in the URI.")
                
        # Try verifying with pymongo parser if possible
        # parsed = parse_uri(mongo_uri)
        # print(f"Pymongo parsed database: {parsed.get('database')}")

    except Exception as e:
        print(f"Error parsing URI: {e}")

if __name__ == "__main__":
    test_secrets()
