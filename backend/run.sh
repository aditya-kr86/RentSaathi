#!/bin/bash

# RentSaathi Backend Startup Script

echo "🚀 Starting RentSaathi Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/Update dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Run the server
echo "✅ Starting FastAPI server on http://localhost:8000"
echo "📖 API docs available at http://localhost:8000/docs"
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
