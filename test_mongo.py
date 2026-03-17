# test_mongo.py
from pymongo import MongoClient
import json, sys

with open("data/secrets.json") as f:
    secrets = json.load(f)

uri = secrets["MONGO_URI"]
client = MongoClient(uri)
db = client["escape_planner"]
print("Connected OK. Databases sample:", client.list_database_names()[:5])
