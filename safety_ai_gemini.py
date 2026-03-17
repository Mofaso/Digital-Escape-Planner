from google import genai
from google.genai import types
import traceback
import json
import os

# Global config placeholder
client = None
_api_key = None

def configure_genai(api_key):
    global client
    if api_key:
        client = genai.Client(api_key=api_key)

def load_kb():
    # Robust path finding
    base_dir = os.path.dirname(os.path.abspath(__file__))
    potential_paths = [
        os.path.join(base_dir, "backend", "data", "safety_knowledge.json"),
        os.path.join(base_dir, "data", "safety_knowledge.json"),
        "backend/data/safety_knowledge.json",
        "data/safety_knowledge.json"
    ]

    for path in potential_paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading KB from {path}: {e}")
    
    print("WARNING: safety_knowledge.json not found in any expected location.")
    return {"scenarios": []}


def match_scenarios(user_text, kb):
    text = user_text.lower()
    matches = []
    
    if not kb or "scenarios" not in kb:
        return []

    for sc in kb["scenarios"]:
        score = sum(tag.lower() in text for tag in sc.get("tags", []))
        if score > 0:
            sc["_score"] = score
            matches.append(sc)

    matches.sort(
        key=lambda s: (
            s["_score"],
            {"critical": 3, "high": 2, "medium": 1, "low": 0}.get(
                s["priority_level"], 0
            ),
        ),
        reverse=True,
    )

    return matches[:3]


def generate_response(user_text, profile=None, history=None, metadata=None, configure_only=False, api_key=None):
    global client
    if configure_only:
        if api_key:
            start_config(api_key)
        return
    
    # If passed api_key directly
    if api_key:
        start_config(api_key)
        
    kb = load_kb()
    scenarios = match_scenarios(user_text, kb)

    # Build context
    context = ""
    for sc in scenarios:
        context += f"\n### {sc['title']} ({sc['priority_level']})\n"
        context += "Immediate Steps:\n" + "\n".join(f"- {s}" for s in sc["steps_immediate"]) + "\n"
        context += "Planning Steps:\n" + "\n".join(f"- {s}" for s in sc["steps_planning"]) + "\n"
        context += "Warnings:\n" + "\n".join(f"- {w}" for w in sc["warnings"]) + "\n\n"

    system_instruction = """
You are a certified AI specializing in personal safety, emergency awareness and ethical escape planning.

CRITICAL PROTOCOL (RESPONSE SYSTEM):

1.  **Phase 1: Visual Emotion Analysis (New Priority)**
    - Check 'User Metadata' for 'emotion'.
    - If emotion is 'sad', 'stress', 'fearful', or 'angry' (and confidence is high), IMMEDIATE ACTION REQUIRED.
    - **Triggered Response**: If you see a [SYSTEM_TRIGGER_EMOTION_DETECTED] message, ignore the text content and address the emotion directly.
    - "I notice you seem [emotion]. I am here with you. Would you like to share what is causing this feeling?"

2.  **Phase 2: Emotional Support**
    - If the user is distressed, scared, or panicking, your FIRST response must be purely comforting and grounding.
    - Acknowledge their feelings. "I hear you, and I am here with you."
    - Do NOT give complex instructions yet.

3.  **Phase 3: Problem Classification & Action**
    - Analyze the user's input to classify the problem:
      - **Safety Concern**: Immediate physical danger (stalking, domestic violence). -> ACTIVATING EMERGENCY PROTOCOLS.
      - **Academic/Work Stress**: burnout, failure, deadlines. -> BREAK DOWN TASKS + ENCOURAGEMENT.
      - **Emotional Distress**: loneliness, anxiety, grief. -> GROUNDING ALGORITHMS + LISTENING.
      - **Decision Uncertainty**: confused about a choice. -> DECISION MATRIX SUPPORT.

4.  **Phase 4: Step-by-Step Guidance**
    - Only when the user seems calm or asks for next steps.
    - Provide instructions ONE at a time.
    - Use simple, non-technical language.

General Rules:
- Give legal, safe, practical advice only.
- If user is in danger, advise contacting emergency services.
- Never give harmful, illegal or violent instructions.
"""

    # Format history
    history_text = ""
    if history:
        for msg in history:
            role = "User" if msg.get("role") == "user" else "AI"
            content = msg.get("text", "")
            if isinstance(content, str):
                history_text += f"{role}: {content}\n"

    user_prompt = f"""
Chat History:
{history_text}

User Situation: "{user_text}"

User Metadata:
{json.dumps(metadata, indent=2) if metadata else "None"}

Relevant safety context:
{context if context else "No exact match. Use general safety logic."}

User Profile:
{profile if profile else "None"}
"""

    # Auto-reconnect if client is lost but key exists
    if client is None and _api_key:
        configure_genai(_api_key)

    if client is None:
         return "I'm not connected to my brain (Client not initialized). Please check API Key configuration."

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction
            )
        )
        return response.text
    except Exception as e:
        print(f"------------ GEMINI API ERROR ------------")
        traceback.print_exc()
        print(f"----------------------------------------")
        return f"⚠️ CONNECTION DIAGNOSTIC: {str(e)}\n\n(Please check your API Key permissions or Quota)"

def start_config(key):
    configure_genai(key)

def configure_genai(key):
    global client, _api_key
    _api_key = key
    try:
        client = genai.Client(api_key=key)
    except Exception as e:
        print(f"Gemini Client Init Failed: {e}")
        client = None

