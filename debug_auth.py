from pymongo import MongoClient
import json
import os
import certifi

def test_connection():
    # Construct URI manually to test the 'fixed' version without editing secrets.json yet
    # Assuming the user replaced <password> with <1234qwerasdfM12> meaning the password is just 1234qwerasdfM12
    
    # Original from user: mongodb+srv://Mohan_Kumar:<1234qwerasdfM12>@cluster1.yn8kteu.mongodb.net/?appName=Cluster1
    # Corrected: mongodb+srv://Mohan_Kumar:1234qwerasdfM12@cluster1.yn8kteu.mongodb.net/?appName=Cluster1
    
    uri = "mongodb+srv://Mohan_Kumar:1234qwerasdfM12@cluster1.yn8kteu.mongodb.net/?appName=Cluster1"
    
    print(f"Testing Corrected URI: {uri.replace('1234qwerasdfM12', 'HIDDEN')}...")
    
    try:
        client = MongoClient(uri, 
                           serverSelectionTimeoutMS=5000,
                           tlsCAFile=certifi.where())
        # Try a simple command
        client.admin.command('ping')
        print("Connection Successful! The issue was the < > placeholders.")
        return True
    except Exception as e:
        print(f"Connection Failed: {e}")
        return False

if __name__ == "__main__":
    test_connection()
