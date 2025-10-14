#!/bin/bash

# Mental AI Assistant - Stop Services Script
# Stops all backend services started by start-services.sh

echo "🛑 Stopping Mental AI Assistant Services..."

if [ -f "logs/pids.txt" ]; then
    while IFS= read -r pid; do
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            echo "   Stopping process $pid..."
            kill "$pid"
        fi
    done < logs/pids.txt
    
    rm logs/pids.txt
    echo "✅ All services stopped."
else
    echo "⚠️  No PID file found. Services may not be running."
    echo "   Trying to kill by port..."
    
    # Fallback: kill by port
    for port in 8001 8002 8003; do
        pid=$(lsof -ti:$port)
        if [ -n "$pid" ]; then
            echo "   Stopping service on port $port (PID: $pid)..."
            kill $pid
        fi
    done
fi

echo ""
echo "✨ Cleanup complete."
