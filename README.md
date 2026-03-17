# Digital Escape Planner (v2.0)

A Full-Stack AI Emotion Support Platform.

## Architecture
- **Frontend**: React (Vite) + Tailwind CSS + Face-API.js
- **Backend**: Flask REST API + MongoDB + Google Gemini AI
- **Database**: MongoDB (Local or Atlas)

## Prerequisites
- Python 3.10+
- Node.js 18+ (Required for Frontend)
- MongoDB running locally or `MONGO_URI` in `data/secrets.json`

## Setup Instructions

### 1. Backend Setup
1. Open a terminal in the root folder.
2. Install dependencies (if not already installed):
   ```bash
   pip install flask flask-cors flask-bcrypt flask-jwt-extended pymongo google-genai
   ```
3. Run the Backend Server:
   ```bash
   python backend/run.py
   ```
   *Server runs on http://127.0.0.1:5001*

### 2. Frontend Setup
1. Open a **new** terminal.
2. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
3. Install Node.js dependencies:
   ```bash
   npm install
   ```
4. Start the React App:
   ```bash
   npm run dev
   ```
5. Click the link shown (usually `http://localhost:5173`).

## Features
- **Real-time Emotion Detection**: Uses your webcam to detect sadness, anger, or stress.
- **AI Chat**: Responds empathetically based on your emotions.
- **Secure Auth**: Login and Sign up with JWT encryption.
