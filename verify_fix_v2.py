import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

try:
    print("Attempting to import main...")
    import main
    print("Successfully imported main.")
    print("JWTManager is available in main:", hasattr(main, 'JWTManager'))
except Exception as e:
    print(f"Failed to import main: {e}")
    import traceback
    traceback.print_exc()

try:
    print("Attempting to import safety_ai_gemini...")
    import safety_ai_gemini
    print("Successfully imported safety_ai_gemini.")
    print("google.genai imported:", 'google.genai' in sys.modules)
except Exception as e:
    print(f"Failed to import safety_ai_gemini: {e}")
    import traceback
    traceback.print_exc()
