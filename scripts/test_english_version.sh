#!/bin/bash

echo "🧪 Testing English Version of Tamil Mind Mate..."
echo "================================================"
echo ""

# Test 1: Service Health Check
echo "Test 1: Service Health Check"
echo "----------------------------"
curl -s http://localhost:8003/health | jq '.'
echo ""
echo ""

# Test 2: Anxiety Response (Benign - Should NOT trigger crisis)
echo "Test 2: Anxiety Response (Benign)"
echo "-----------------------------------"
ANXIETY_RESPONSE=$(curl -s -X POST http://localhost:8003/respond \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test_anxiety_en",
    "transcript_window": ["I'\''m feeling really anxious right now"],
    "locale": "en-US"
  }')

echo "$ANXIETY_RESPONSE" | jq -r '.reply_text' | head -n 10
echo ""
NEEDS_ESC=$(echo "$ANXIETY_RESPONSE" | jq -r '.risk_flags.needs_escalation')
if [ "$NEEDS_ESC" == "false" ]; then
  echo "✅ PASS: Anxiety correctly classified as non-crisis"
else
  echo "❌ FAIL: Anxiety incorrectly flagged as crisis"
fi
echo ""
echo ""

# Test 3: Crisis Detection (Should trigger crisis template)
echo "Test 3: Crisis Detection - Explicit Self-Harm"
echo "----------------------------------------------"
CRISIS_RESPONSE=$(curl -s -X POST http://localhost:8003/respond \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test_crisis_en",
    "transcript_window": ["I want to end it all"],
    "locale": "en-US"
  }')

echo "$CRISIS_RESPONSE" | jq -r '.reply_text'
echo ""
NEEDS_ESC=$(echo "$CRISIS_RESPONSE" | jq -r '.risk_flags.needs_escalation')
HAS_HELPLINE=$(echo "$CRISIS_RESPONSE" | jq -r '.reply_text' | grep -c "044-46464646")
if [ "$NEEDS_ESC" == "true" ] && [ "$HAS_HELPLINE" -gt 0 ]; then
  echo "✅ PASS: Crisis correctly detected and helpline provided"
else
  echo "❌ FAIL: Crisis detection or helpline signposting failed"
fi
echo ""
echo ""

# Test 4: Abuse Disclosure (Should give supportive response, NOT crisis)
echo "Test 4: Abuse Disclosure - Supportive Response"
echo "-----------------------------------------------"
ABUSE_RESPONSE=$(curl -s -X POST http://localhost:8003/respond \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test_abuse_en",
    "transcript_window": ["My father beats me"],
    "locale": "en-US"
  }')

echo "$ABUSE_RESPONSE" | jq -r '.reply_text'
echo ""
NEEDS_ESC=$(echo "$ABUSE_RESPONSE" | jq -r '.risk_flags.needs_escalation')
HAS_181=$(echo "$ABUSE_RESPONSE" | jq -r '.reply_text' | grep -c "181")
if [ "$NEEDS_ESC" == "false" ] && [ "$HAS_181" -gt 0 ]; then
  echo "✅ PASS: Abuse disclosure correctly classified as supportive (not crisis)"
  echo "✅ PASS: Women's Helpline 181 provided"
else
  echo "❌ FAIL: Abuse disclosure incorrectly flagged as crisis or missing 181 helpline"
fi
echo ""
echo ""

# Test 5: Grounding Exercise Request
echo "Test 5: Grounding Exercise for Panic Attack"
echo "--------------------------------------------"
PANIC_RESPONSE=$(curl -s -X POST http://localhost:8003/respond \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test_panic_en",
    "transcript_window": ["I'\''m having a panic attack and can'\''t breathe"],
    "locale": "en-US"
  }')

echo "$PANIC_RESPONSE" | jq -r '.reply_text' | head -n 10
echo ""
NEEDS_ESC=$(echo "$PANIC_RESPONSE" | jq -r '.risk_flags.needs_escalation')
if [ "$NEEDS_ESC" == "false" ]; then
  echo "✅ PASS: Panic attack correctly handled as non-crisis"
else
  echo "❌ FAIL: Panic attack incorrectly flagged as crisis"
fi
echo ""
echo ""

# Test 6: Uncertain Intent (Should ask C-SSRS clarifying question)
echo "Test 6: Uncertain Intent - C-SSRS Clarification"
echo "------------------------------------------------"
UNCERTAIN_RESPONSE=$(curl -s -X POST http://localhost:8003/respond \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test_uncertain_en",
    "transcript_window": ["I can'\''t take it anymore"],
    "locale": "en-US"
  }')

echo "$UNCERTAIN_RESPONSE" | jq -r '.reply_text'
echo ""
HAS_CLARIFICATION=$(echo "$UNCERTAIN_RESPONSE" | jq -r '.reply_text' | grep -ic "understand you correctly")
if [ "$HAS_CLARIFICATION" -gt 0 ]; then
  echo "✅ PASS: Uncertain intent triggers C-SSRS clarification question"
else
  echo "❌ FAIL: Missing C-SSRS clarification for uncertain intent"
fi
echo ""
echo ""

# Test 7: Check Response Tone (Should be warm, not formal)
echo "Test 7: Response Tone Check"
echo "---------------------------"
echo "Checking for warm, compassionate language..."
WARM_PHRASES=$(echo "$ANXIETY_RESPONSE" | jq -r '.reply_text' | grep -Eic "I hear|sounds|feel|together|help")
FORMAL_PHRASES=$(echo "$ANXIETY_RESPONSE" | jq -r '.reply_text' | grep -Eic "acknowledge|protocol|intervention|symptoms")

if [ "$WARM_PHRASES" -gt 0 ]; then
  echo "✅ PASS: Warm language detected ($WARM_PHRASES warm phrases)"
else
  echo "⚠️  WARNING: Limited warm language in responses"
fi

if [ "$FORMAL_PHRASES" -gt 0 ]; then
  echo "⚠️  WARNING: Formal/clinical language detected ($FORMAL_PHRASES formal phrases)"
else
  echo "✅ PASS: No formal/clinical language detected"
fi
echo ""
echo ""

# Summary
echo "================================================"
echo "✅ English Version Testing Complete!"
echo "================================================"
echo ""
echo "Next Steps:"
echo "1. Open http://localhost:8082 in your browser"
echo "2. Click '🇬🇧 English' button in the header"
echo "3. Test the quick test buttons for manual validation"
echo "4. Share link with clinicians for feedback"
echo ""
echo "Feedback checklist: See ENGLISH_VERSION_IMPLEMENTATION.md"
