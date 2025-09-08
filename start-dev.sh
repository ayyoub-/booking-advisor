#!/bin/bash

# Script to start both backend and frontend development servers

echo "🚀 Starting Booking Advisor Development Environment..."

# Check if Python is available
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed or not in PATH"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    exit 1
fi

# Install backend dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Install frontend dependencies if needed
if [ ! -d "hotel-advisor/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd hotel-advisor
    npm install
    cd ..
fi

# Install Python dependencies if needed
if [ ! -d "booking-reviews-scraper/venv" ]; then
    echo "🐍 Setting up Python virtual environment..."
    cd booking-reviews-scraper
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Start backend server in background
echo "🔧 Starting backend server on port 3001..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend development server
echo "🎨 Starting frontend development server on port 5173..."
cd hotel-advisor
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ Development environment started!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
