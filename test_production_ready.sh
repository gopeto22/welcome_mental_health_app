#!/bin/bash

echo "🧪 Testing Production Readiness..."
echo ""

# Test 1: Health Checks
echo "1️⃣ Testing Service Health..."
SPEECH_HEALTH=$(curl -s http://localhost:8002/health | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['status'])" 2>/dev/null || echo "fail")
REASONING_HEALTH=$(curl -s http://localhost:8003/health | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['status'])" 2>/dev/null || echo "fail")

if [ "$SPEECH_HEALTH" = "ok" ]; then
    echo "   ✅ Speech Service: HEALTHY"
else
    echo "   ❌ Speech Service: DOWN"
fi

if [ "$REASONING_HEALTH" = "ok" ]; then
    echo "   ✅ Reasoning Service: HEALTHY"
else
    echo "   ❌ Reasoning Service: DOWN"
fi

# Test 2: Groq API (LLM)
echo ""
echo "2️⃣ Testing Groq LLM API..."
LLM_RESPONSE=$(curl -s -X POST http://localhost:8003/respond \
  -H "Content-Type: application/json" \
  -d '{"session_id":"prod-test","transcript_window":["I am feeling stressed"],"locale":"en-GB"}' \
  | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['reply_text'][:50])" 2>/dev/null)

if [ -n "$LLM_RESPONSE" ]; then
    echo "   ✅ Groq API: WORKING"
    echo "   Response: $LLM_RESPONSE..."
else
    echo "   ❌ Groq API: FAILED"
fi

# Test 3: Google Cloud TTS
echo ""
echo "3️⃣ Testing Google Cloud TTS..."
TTS_RESPONSE=$(curl -s -X POST http://localhost:8002/tts/speak \
  -H "Content-Type: application/json" \
  -d '{"text":"Production test","voice":"ta-IN"}' \
  | python3 -c "import sys, json; data=json.load(sys.stdin); print('cached=' + str(data['cached']))" 2>/dev/null)

if [ -n "$TTS_RESPONSE" ]; then
    echo "   ✅ Google TTS: WORKING"
    echo "   Status: $TTS_RESPONSE"
else
    echo "   ❌ Google TTS: FAILED"
fi

# Test 4: Check API keys
echo ""
echo "4️⃣ Checking API Configuration..."
if grep -q "gsk_" services/speech-service/.env 2>/dev/null; then
    echo "   ✅ Groq API key: CONFIGURED"
else
    echo "   ❌ Groq API key: MISSING"
fi

if [ -f ".config/tamil-tts-dev-95fbbcc7ba1b.json" ]; then
    echo "   ✅ Google credentials: FOUND"
else
    echo "   ❌ Google credentials: MISSING"
fi

# Test 5: Cache statistics
echo ""
echo "5️⃣ Cache Statistics..."
CACHE_COUNT=$(ls -1 services/speech-service/audio_cache/*.mp3 2>/dev/null | wc -l)
echo "   📊 Cached TTS files: $CACHE_COUNT"
echo "   💰 Estimated cost: \$0.0$(echo "scale=3; $CACHE_COUNT * 0.0004" | bc)"

echo ""
echo "✅ Production Readiness Test Complete!"
echo ""
echo "🔗 Frontend: http://localhost:8081"
echo "🎤 Speech Service: http://localhost:8002"
echo "🤖 Reasoning Service: http://localhost:8003"

