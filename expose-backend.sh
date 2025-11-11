#!/bin/bash
# Quick script to expose local backend services for clinician testing
# Run this when a clinician requests to test with real AI

set -e

echo "🚀 Exposing Local Backend for Real AI Testing"
echo "=============================================="
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed"
    echo ""
    echo "Install ngrok:"
    echo "  brew install ngrok"
    echo ""
    echo "Then configure your auth token:"
    echo "  ngrok authtoken YOUR_TOKEN"
    exit 1
fi

echo "✅ ngrok found"
echo ""

# Check if backend services are running
echo "🔍 Checking backend services..."

if ! curl -sf http://localhost:8002/health > /dev/null 2>&1; then
    echo "❌ Speech service not running on port 8002"
    echo "   Start it: cd services/speech-service && ./start.sh"
    exit 1
fi
echo "   ✅ Speech service (8002)"

if ! curl -sf http://localhost:8003/health > /dev/null 2>&1; then
    echo "❌ Reasoning service not running on port 8003"
    echo "   Start it: cd services/reasoning-service && ./start.sh"
    exit 1
fi
echo "   ✅ Reasoning service (8003)"

echo ""
echo "🌐 Starting ngrok tunnels..."
echo ""

# Start ngrok for reasoning service (primary service)
ngrok http 8003 > /dev/null &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Get the public URL
REASONING_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; print([t['public_url'] for t in json.load(sys.stdin)['tunnels'] if 'https' in t['public_url']][0])" 2>/dev/null)

if [ -z "$REASONING_URL" ]; then
    echo "❌ Failed to get ngrok URL"
    kill $NGROK_PID 2>/dev/null || true
    exit 1
fi

echo "=============================================="
echo "✅ Backend Exposed!"
echo "=============================================="
echo ""
echo "🔗 Reasoning Service URL:"
echo "   $REASONING_URL"
echo ""
echo "📝 Update Streamlit Cloud Environment Variables:"
echo "   1. Go to: https://share.streamlit.io/"
echo "   2. Click on your app"
echo "   3. Settings → Environment variables"
echo "   4. Update these variables:"
echo ""
echo "      DEMO_MODE=false"
echo "      REASONING_SERVICE_URL=$REASONING_URL"
echo "      SPEECH_SERVICE_URL=$REASONING_URL"
echo ""
echo "   5. Save (app will auto-redeploy in 2 minutes)"
echo ""
echo "⚠️  Note: Keep this terminal open while clinicians are testing!"
echo "   Press Ctrl+C to stop when done."
echo ""
echo "💡 When finished testing:"
echo "   1. Set DEMO_MODE=true in Streamlit Cloud"
echo "   2. Remove the URL environment variables"
echo "   3. Press Ctrl+C here to stop ngrok"
echo ""
echo "=============================================="

# Keep script running
trap "echo ''; echo '🛑 Stopping ngrok...'; kill $NGROK_PID 2>/dev/null || true; exit 0" INT
wait $NGROK_PID
