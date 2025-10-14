#!/bin/bash

# Mental AI Assistant - Quick Start Script
# Starts all 3 backend services in the background

set -e

echo "🚀 Starting Mental AI Assistant Services..."
echo ""

# Check if we're in the right directory
if [ ! -d "services" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

# Create logs directory
mkdir -p logs

# Function to check if port is available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $1 is already in use. Skipping service on this port."
        return 1
    fi
    return 0
}

# Start Media Service
if check_port 8001; then
    echo "▶️  Starting Media Service (port 8001)..."
    cd services/media-service
    ./start.sh > ../../logs/media.log 2>&1 &
    MEDIA_PID=$!
    echo "   PID: $MEDIA_PID"
    cd ../..
fi

# Start Speech Service
if check_port 8002; then
    echo "▶️  Starting Speech Service (port 8002)..."
    cd services/speech-service
    ./start.sh > ../../logs/speech.log 2>&1 &
    SPEECH_PID=$!
    echo "   PID: $SPEECH_PID"
    cd ../..
fi

# Start Reasoning Service
if check_port 8003; then
    echo "▶️  Starting Reasoning Service (port 8003)..."
    cd services/reasoning-service
    ./start.sh > ../../logs/reasoning.log 2>&1 &
    REASONING_PID=$!
    echo "   PID: $REASONING_PID"
    cd ../..
fi

# Wait for services to start
echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Health checks
echo ""
echo "🏥 Health Checks:"

check_health() {
    local name=$1
    local url=$2
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo "   ✅ $name: OK"
        return 0
    else
        echo "   ❌ $name: FAILED"
        return 1
    fi
}

check_health "Media Service    " "http://localhost:8001/health"
check_health "Speech Service   " "http://localhost:8002/health"
check_health "Reasoning Service" "http://localhost:8003/health"

echo ""
echo "✨ All services are running!"
echo ""
echo "📊 Next steps:"
echo "   1. Run benchmark: python3 benchmark.py"
echo "   2. Start frontend: cd frontend && npm run dev"
echo ""
echo "🛑 To stop services: ./stop-services.sh"
