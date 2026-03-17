from pymongo import MongoClient
import json

with open("data/secrets.json") as f:
    secrets = json.load(f)

client = MongoClient(secrets["MONGO_URI"])
db = client["escape_planner"]

print("Databases:", client.list_database_names())

print("Collections inside escape_planner:", db.list_collection_names())

if "users" in db.list_collection_names():
    print("Users collection exists.")
else:
    print("Users collection does NOT exist.")
