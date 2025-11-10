#!/bin/bash
# Quick Deployment with Ngrok - Expose Local Services to Streamlit Cloud

set -e

echo "🚀 Tamil Mind Mate - Quick Cloud Deployment with Local Services"
echo "================================================================"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "📦 Installing ngrok..."
    brew install ngrok/ngrok/ngrok
    echo ""
fi

echo "✅ Ngrok installed"
echo ""

# Check if services are running
echo "🔍 Checking local services..."

if ! curl -sf http://localhost:8002/health > /dev/null; then
    echo "❌ Speech service not running on port 8002"
    echo "   Start it: cd services/speech-service && ./start.sh"
    exit 1
fi
echo "   ✅ Speech service running"

if ! curl -sf http://localhost:8003/health > /dev/null; then
    echo "❌ Reasoning service not running on port 8003"
    echo "   Start it: cd services/reasoning-service && ./start.sh"
    exit 1
fi
echo "   ✅ Reasoning service running"

echo ""
echo "🌐 Creating ngrok tunnels..."
echo ""

# Kill any existing ngrok processes
pkill -f ngrok || true
sleep 2

# Start ngrok for speech service
ngrok http 8002 --log=stdout > /tmp/ngrok-speech.log 2>&1 &
SPEECH_PID=$!
echo "   Started ngrok for speech service (PID: $SPEECH_PID)"

# Start ngrok for reasoning service  
ngrok http 8003 --log=stdout > /tmp/ngrok-reasoning.log 2>&1 &
REASONING_PID=$!
echo "   Started ngrok for reasoning service (PID: $REASONING_PID)"

# Wait for ngrok to start
echo ""
echo "⏳ Waiting for ngrok tunnels to initialize..."
sleep 5

# Get ngrok URLs
echo ""
echo "🔗 Fetching tunnel URLs..."

SPEECH_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)
REASONING_URL=$(curl -s http://localhost:4041/api/tunnels | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$SPEECH_URL" ] || [ -z "$REASONING_URL" ]; then
    echo "❌ Failed to get ngrok URLs"
    echo "   Try manually: ngrok http 8002 (in one terminal)"
    echo "                ngrok http 8003 (in another terminal)"
    exit 1
fi

echo ""
echo "================================================================"
echo "✅ Ngrok Tunnels Active!"
echo "================================================================"
echo ""
echo "🔗 Service URLs:"
echo "   Speech Service:    $SPEECH_URL"
echo "   Reasoning Service: $REASONING_URL"
echo ""
echo "================================================================"
echo "📋 COPY THESE FOR STREAMLIT CLOUD"
echo "================================================================"
echo ""
echo "In Streamlit Cloud app settings, add these environment variables:"
echo ""
echo "DEMO_MODE=false"
echo "SPEECH_SERVICE_URL=$SPEECH_URL"
echo "REASONING_SERVICE_URL=$REASONING_URL"
echo ""
echo "================================================================"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Keep this terminal open (tunnels active)"
echo "   - Keep backend services running"
echo "   - Ngrok free tier: URLs change on restart"
echo "   - For permanent deployment, use Railway/Render"
echo ""
echo "🛑 To stop tunnels:"
echo "   Press Ctrl+C or run: pkill -f ngrok"
echo ""
echo "📊 Monitor tunnels:"
echo "   Speech:    http://localhost:4040"
echo "   Reasoning: http://localhost:4041"
echo ""

# Wait for user interrupt
echo "Press Ctrl+C to stop tunnels..."
wait
