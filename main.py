from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, decode_token
from pymongo import MongoClient
from safety_ai_gemini import generate_response, start_config
import os
import json
import datetime
import webbrowser
from threading import Timer

# -------------------- LOAD SECRETS --------------------
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

secrets = load_secrets()
GEMINI_KEY = secrets.get("GEMINI_API_KEY", "")
MONGO_URI = secrets.get("MONGO_URI", "")

# -------------------- FLASK APP --------------------
app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "super_secret_key_here"

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# -------------------- SETUP GEMINI --------------------
# Configure Gemini with the key from secrets
if GEMINI_KEY:
    start_config(GEMINI_KEY)

import certifi

# -------------------- CONNECT MONGODB --------------------
users_col = None

def connect_db(uri):
    try:
        # Add certifi to TLS verification
        client = MongoClient(uri, 
                           serverSelectionTimeoutMS=5000,
                           tlsCAFile=certifi.where())
        db = client["escape_planner"]
        col = db["users"]
        client.server_info() # Trigger connection check
        print(f"MongoDB Connected Successfully to {uri.split('@')[-1] if '@' in uri else 'localhost'}!")
        return col
    except Exception as e:
        print(f"MongoDB Connection Failed to {uri}: {e}")
        return None

# Try Remote
if MONGO_URI:
    users_col = connect_db(MONGO_URI)

# Try Local if Remote failed
if users_col is None:
    print("Attempting fallback to local MongoDB...")
    # constant localhost doesn't need certifi usually, but consistent client usage is fine
    # local usually doesn't need tlsCAFile unless configured for SSL
    try:
        client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=5000)
        db = client["escape_planner"]
        users_col = db["users"]
        client.server_info()
        print("MongoDB Connected Successfully to localhost!")
    except Exception as e:
        print(f"Local MongoDB Connection Failed: {e}")
        users_col = None

if users_col is None:
    print("CRITICAL: Could not connect to any database.")


# -------------------- HOME --------------------
@app.route("/")
def home():
    return redirect("/login")

# -------------------- SIGNUP --------------------
@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        if users_col is None:
             return "<h2>Database Error 🔴</h2><p>Could not connect to database. Please check logs.</p><a href='/signup'>Try Again</a>"

        username = request.form["username"]
        password = request.form["password"]

        if users_col.find_one({"username": username}):
            return "<h2>User already exists 😅</h2><a href='/signup'>Try Again</a>"

        hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")

        users_col.insert_one({
            "username": username,
            "password": hashed_pw,
            "created_at": datetime.datetime.utcnow()
        })

        return redirect("/login")

    return render_template("signup.html")

# -------------------- LOGIN --------------------
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        if users_col is None:
             return "<h2>Database Error 🔴</h2><p>Could not connect to database. Please check logs.</p><a href='/login'>Try Again</a>"
             
        username = request.form["username"]
        password = request.form["password"]

        user = users_col.find_one({"username": username})
        if not user:
            return "<h2>User not found ❌</h2><a href='/login'>Try Again</a>"

        if not bcrypt.check_password_hash(user["password"], password):
            return "<h2>Invalid password ❌</h2><a href='/login'>Try Again</a>"

        token = create_access_token(identity=username)
        return redirect(f"/chat?token={token}")

    return render_template("login.html")

# -------------------- CHAT PAGE --------------------
@app.route("/chat")
def chat_page():
    token = request.args.get("token")
    username = "Guest"
    if token:
        try:
            # Decode token to identify user for frontend scoping
            decoded = decode_token(token)
            username = decoded.get("sub", "Guest")
        except Exception as e:
            print(f"Token decode error: {e}")
            
    return render_template("chat.html", username=username)

# -------------------- CHATBOT API (BACKEND PROXY) --------------------
@app.route("/chatbot", methods=["POST"])
@jwt_required()
def chatbot():
    data = request.get_json()
    message = data.get("message", "")
    user_msg = data.get("message", "")
    history = data.get("history", [])
    metadata = data.get("metadata", {})

    if not user_msg:
        return jsonify({"reply": "Please type your message."})

    username = get_jwt_identity()
    # Pass history and metadata to the AI function
    ai_reply = generate_response(user_msg, profile=username, history=history, metadata=metadata)

    return jsonify({"reply": ai_reply})

# -------------------- LOGOUT --------------------
@app.route("/logout")
def logout():
    return redirect("/login")

# -------------------- RUN --------------------
def open_browser():
      webbrowser.open_new("http://127.0.0.1:5000")

if __name__ == "__main__":
    print("\n" + "="*50)
    print(" ACCESS THE APP HERE: http://127.0.0.1:5000 ")
    print("="*50 + "\n")
    
    # Schedule browser to open after 1.5 seconds, but only in the main process
    # to avoid opening it twice (once for main, once for reloader) or on every reload.
    if not os.environ.get("WERKZEUG_RUN_MAIN"):
        Timer(1.5, open_browser).start()
    
    app.run(debug=True)
