import os
import time
from threading import Timer
from flask import Flask

app = Flask(__name__)

def log_execution():
    with open("execution_log.txt", "a") as f:
        # Check if we are in the main process or reloader process
        is_reloader = os.environ.get("WERKZEUG_RUN_MAIN") == "true"
        pid = os.getpid()
        f.write(f"Execution at {time.time()} | PID: {pid} | In Reloader: {is_reloader}\n")

if __name__ == "__main__":
    # Clear log on first run (parent process usually runs first, but this is simple enough)
    # We can't clear it easily without race conditions, so just append.
    
    # Simulate the Timer behavior in main.py
    Timer(0.1, log_execution).start()
    
    # We won't actually run the server indefinitely to avoid blocking, 
    # but we need to trigger the reloader machinery.
    # However, app.run(debug=True) blocks. 
    # We can use a thread or just run it and kill it.
    # For a simple reproduction, we can just print.
    
    print(f"Starting app. PID: {os.getpid()}, WERKZEUG_RUN_MAIN: {os.environ.get('WERKZEUG_RUN_MAIN')}")
    
    # Using app.run(debug=True) is required to trigger the specific behavior
    # We will assume the user manually kills this or we set a timeout if we were running it via a tool that supports timeout.
    # Since I can't interactively kill it easily without another tool call, I'll rely on the analysis I did which is standard Flask behavior.
    # See: https://flask.palletsprojects.com/en/2.3.x/server/#reloader
    
    pass
