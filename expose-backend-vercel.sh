#!/bin/bash
# Expose local backend services to Vercel deployment for clinician testing
# Run this when clinicians need to test with real AI

set -e

echo "🚀 Exposing Local Backend for Vercel Frontend"
echo "=============================================="
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed"
    echo ""
    echo "Install ngrok:"
    echo "  brew install ngrok"
    echo ""
    echo "Sign up and get auth token:"
    echo "  1. Go to: https://dashboard.ngrok.com/signup"
    echo "  2. Get your auth token from: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "  3. Configure: ngrok config add-authtoken YOUR_TOKEN"
    echo ""
    exit 1
fi

echo "✅ ngrok found"
echo ""

# Check if backend services are running
echo "🔍 Checking backend services..."

if ! curl -sf http://localhost:8002/health > /dev/null 2>&1; then
    echo "❌ Speech service not running on port 8002"
    echo ""
    echo "Start backend services first:"
    echo "  ./start-services.sh"
    echo ""
    exit 1
fi
echo "   ✅ Speech service (8002)"

if ! curl -sf http://localhost:8003/health > /dev/null 2>&1; then
    echo "❌ Reasoning service not running on port 8003"
    echo ""
    echo "Start backend services first:"
    echo "  ./start-services.sh"
    echo ""
    exit 1
fi
echo "   ✅ Reasoning service (8003)"

echo ""
echo "🌐 Starting ngrok tunnel..."
echo ""

# Start ngrok for reasoning service (port 8003)
# Both frontend services will use this URL
ngrok http 8003 > /dev/null &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Get the public HTTPS URL
BACKEND_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; tunnels = json.load(sys.stdin).get('tunnels', []); https_tunnels = [t['public_url'] for t in tunnels if 'https' in t['public_url']]; print(https_tunnels[0] if https_tunnels else '')" 2>/dev/null)

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Failed to get ngrok URL"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check if ngrok is properly authenticated"
    echo "  2. Try: curl http://localhost:4040/api/tunnels"
    echo ""
    kill $NGROK_PID 2>/dev/null || true
    exit 1
fi

echo "=============================================="
echo "✅ Backend Exposed Successfully!"
echo "=============================================="
echo ""
echo "🔗 Backend URL (ready to use):"
echo "   $BACKEND_URL"
echo ""
echo "📝 Now Update Vercel Environment Variables:"
echo ""
echo "   1. Go to: https://vercel.com/gopeto22s-projects"
echo "   2. Select your project: welcome-mental-health-app"
echo "   3. Click: Settings → Environment Variables"
echo "   4. Update/Add these variables:"
echo ""
echo "      VITE_REASONING_SERVICE_URL=$BACKEND_URL"
echo "      VITE_SPEECH_SERVICE_URL=$BACKEND_URL"
echo "      VITE_DEMO_MODE=false"
echo ""
echo "   5. Click 'Save'"
echo "   6. Go to: Deployments tab"
echo "   7. Click '...' menu → Redeploy"
echo "   8. Wait ~2 minutes for deployment"
echo ""
echo "🎯 Your Vercel App:"
echo "   https://welcome-mental-health-app-git-main-gopeto22s-projects.vercel.app/mobile"
echo ""
echo "⚠️  IMPORTANT: Keep this terminal open while testing!"
echo "   Clinicians need this running to access real AI."
echo "   Press Ctrl+C when done."
echo ""
echo "💡 To Stop Testing Session:"
echo "   1. Press Ctrl+C here to stop ngrok"
echo "   2. In Vercel, set: VITE_DEMO_MODE=true"
echo "   3. Remove the URL environment variables"
echo "   4. Redeploy (returns to demo mode)"
echo ""
echo "🔒 Security Note:"
echo "   ngrok URLs are public but temporary (expire when stopped)"
echo "   Free tier: 1 tunnel, 40 connections/min"
echo ""
echo "=============================================="
echo "✅ Ready for clinician testing!"
echo "=============================================="

# Keep script running
trap "echo ''; echo '🛑 Stopping ngrok tunnel...'; kill $NGROK_PID 2>/dev/null || true; echo '✅ Backend exposure stopped'; exit 0" INT
wait $NGROK_PID
