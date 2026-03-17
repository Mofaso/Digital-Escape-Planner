@echo off
:: Navigate to frontend and start Vite in background
cd /d "E:\DigitalEscapePlanner\frontend"
start /B npm run dev > NUL 2>&1

:: Navigate to backend and start Flask in background
cd /d "E:\DigitalEscapePlanner"
start /B .venv\Scripts\python.exe -m backend.app > NUL 2>&1

echo Digital Escape Planner Servers Started Successfully!
