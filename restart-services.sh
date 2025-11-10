#!/bin/bash

echo "🔄 Restarting Tamil Mind Mate Services..."
echo ""

# Kill all existing services
echo "1️⃣ Stopping existing services..."
pkill -f "uvicorn.*speech-service" 2>/dev/null
pkill -f "uvicorn.*reasoning-service" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 3

# Start Speech Service
echo "2️⃣ Starting Speech Service (port 8002)..."
cd services/speech-service
source venv/bin/activate
nohup uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload >> ../../logs/speech.log 2>&1 &
SPEECH_PID=$!
cd ../..

# Start Reasoning Service
echo "3️⃣ Starting Reasoning Service (port 8003)..."
cd services/reasoning-service
source venv/bin/activate
nohup uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload >> ../../logs/reasoning.log 2>&1 &
REASONING_PID=$!
cd ../..

# Start Frontend
echo "4️⃣ Starting Frontend (port 8081)..."
cd frontend
nohup npm run dev >> ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

echo ""
echo "✅ Service Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Speech Service
if curl -s http://localhost:8002/health > /dev/null 2>&1; then
    echo "✅ Speech Service: RUNNING (PID: $SPEECH_PID)"
else
    echo "❌ Speech Service: FAILED"
fi

# Check Reasoning Service
if curl -s http://localhost:8003/health > /dev/null 2>&1; then
    echo "✅ Reasoning Service: RUNNING (PID: $REASONING_PID)"
else
    echo "❌ Reasoning Service: FAILED"
fi

# Check Frontend
if curl -s http://localhost:8081 > /dev/null 2>&1; then
    echo "✅ Frontend: RUNNING (PID: $FRONTEND_PID)"
else
    echo "❌ Frontend: FAILED"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Open in browser: http://localhost:8081"
echo ""
echo "📋 To view logs:"
echo "   tail -f logs/speech.log"
echo "   tail -f logs/reasoning.log"
echo "   tail -f logs/frontend.log"
echo ""
echo "🛑 To stop all services:"
echo "   ./stop-services.sh"
echo ""
