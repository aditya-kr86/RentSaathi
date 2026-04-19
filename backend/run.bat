@echo off
REM RentPartner Backend Startup Script for Windows

echo 🚀 Starting RentPartner Backend...

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install/Update dependencies
echo 📥 Installing dependencies...
pip install -q -r requirements.txt

REM Run the server
echo ✅ Starting FastAPI server on http://localhost:8000
echo 📖 API docs available at http://localhost:8000/docs
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause
