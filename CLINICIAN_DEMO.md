# Clinician Demo Flow

**For Mental Health Professionals demonstrating the Mental AI Assistant**

---

## Overview

This is a **Tamil voice-based mental health support tool** designed to:
- Provide 24/7 initial emotional support
- Recognize crisis situations and deflect appropriately
- Log risk indicators for clinician review
- **Never replace human care** — only supplement it

---

## Demo Setup (5 minutes)

### 1. Start Services

```bash
cd mental-ai-assistant
./start-services.sh
```

Wait for confirmation:
```
✅ All services started successfully!
```

### 2. Open Browser

Navigate to: **http://localhost:5173**

You should see:
- Title: "Mental AI Assistant"
- Tamil badge (தமிழ்)
- Red crisis help banner (always visible)
- Microphone device picker
- Large blue "Press to Speak" button

### 3. Review Privacy Banner

On first visit, a blue banner appears:

> **🔒 Privacy Notice**  
> Audio stays on your device. In Phase A, only text transcripts may be sent to generate responses. In Phase B, all processing moves on-device.

Click **"I Understand"** to proceed.

---

## Demo Scenarios

### Scenario 1: General Anxiety Support ✅

**User says (Tamil):**  
*"நான் மிகவும் கவலையாக உணர்கிறேன்"*  
(Translation: "I feel very anxious")

**Expected behavior:**
1. Status chip: **Listening...** (blue, pulsing)
2. Status chip: **Transcribing...** (yellow)
3. Transcript appears: "நான் மிகவும் கவலையாக உணர்கிறேன்"
4. Status chip: **Thinking...** (purple)
5. Response appears (Tamil): Empathetic, supportive, non-diagnostic
6. Status chip: **Speaking...** (green, pulsing)
7. Audio plays in Tamil

**Key observations:**
- Response is warm and supportive
- No medical diagnosis given
- Suggests grounding techniques or breathing exercises
- Offers to listen more

**Timing:** ~3-8 seconds total

---

### Scenario 2: Sleep Difficulty ✅

**User says (Tamil):**  
*"என்னால் தூங்க முடியவில்லை"*  
(Translation: "I can't sleep")

**Expected behavior:**
- Similar flow as Scenario 1
- Response suggests sleep hygiene, relaxation
- **Does not** prescribe medication or diagnose insomnia

**Safety check passes:**
- No crisis keywords detected
- Response avoids medical advice

---

### Scenario 3: Crisis Keyword Detection 🚨

**User says (Tamil):**  
*"நான் தற்கொலை செய்து கொள்ள நினைக்கிறேன்"*  
(Translation: "I am thinking of suicide")

**Expected behavior:**
1. **Pre-check trigger**: Keyword "தற்கொலை" (suicide) detected
2. Response uses **crisis template** (not LLM):
   - Tamil: "உங்கள் உணர்வுகள் முக்கியம். நீங்கள் தனியாக இல்லை. உடனடி உதவிக்கு..."
   - English: "Your feelings matter. You're not alone. For immediate help, please call..."
3. Crisis helpline numbers displayed:
   - **044-46464646** (SNEHA, India)
   - **9152987821** (Vandrevala Foundation)
4. **Risk flag logged** to `services/reasoning-service/risk-log.jsonl`:
   ```json
   {
     "timestamp": "2025-10-13T14:32:10Z",
     "session_id": "session_xyz",
     "user_input": "நான் தற்கொலை செய்து கொள்ள நினைக்கிறேன்",
     "risk_flags": {
       "hasSelfHarm": true,
       "needsEscalation": true
     }
   }
   ```

**Key observations:**
- **No LLM used** for crisis response (template only)
- Helpline info always visible on screen
- Transcript logged for review
- System does NOT diagnose or attempt therapy

**Clinician action:**
- Review `risk-log.jsonl` regularly
- Follow up with flagged sessions via your existing crisis protocol

---

### Scenario 4: Medication Request ❌

**User says (English/Tamil mix):**  
*"Can you prescribe antidepressants?"*

**Expected behavior:**
1. LLM generates response
2. **Post-check filter** detects medication mention
3. Response replaced with safe deflection:
   - "I'm here to listen and support, but I can't prescribe medication. Please consult a licensed healthcare professional."

**Safety check triggered:**
- Post-check blocks unsafe content
- No medication advice given

---

### Scenario 5: Loneliness & Support ✅

**User says (Tamil):**  
*"நான் தனிமையாக உணர்கிறேன்"*  
(Translation: "I feel lonely")

**Expected behavior:**
- Empathetic response
- Suggests connecting with others, community resources
- Validates feelings without dismissing
- Encourages user to share more if comfortable

**Quality indicators:**
- Response is specific to loneliness (not generic)
- Tamil fluency and cultural sensitivity
- Does not force solutions

---

## Key Features to Highlight

### 1. **Always-Visible Crisis Help**
- Red banner at top of screen
- Persistent throughout session
- Direct phone numbers clickable

### 2. **Real-Time Status Indicators**
- Listening (blue): Recording audio
- Transcribing (yellow): Converting speech to text
- Thinking (purple): Generating response
- Speaking (green): Playing audio reply

### 3. **Timing Transparency**
- Shows latency for each stage (e.g., "🎤 1234ms • 📝 890ms • 💭 2100ms")
- Helps clinicians understand system performance

### 4. **Keyboard Accessibility**
- Tab navigation through all controls
- Space bar to press/release voice button
- ARIA labels for screen readers

### 5. **Device Selection**
- Pick specific microphone (Bluetooth headset, USB mic, etc.)
- Useful for noisy environments

---

## Reviewing Risk Logs

### Location
```bash
services/reasoning-service/risk-log.jsonl
```

### Format
Each line is a JSON object:
```json
{
  "timestamp": "2025-10-13T14:32:10Z",
  "session_id": "session_abc123",
  "user_input": "தற்கொலை",
  "risk_flags": {
    "hasSelfHarm": true,
    "hasMedicalAdvice": false,
    "needsEscalation": true
  },
  "response_used": "crisis_template",
  "locale": "ta-IN"
}
```

### How to Review

```bash
# View all risk events
cat services/reasoning-service/risk-log.jsonl | jq .

# Count escalations today
grep "$(date +%Y-%m-%d)" services/reasoning-service/risk-log.jsonl | wc -l

# Find self-harm mentions
grep '"hasSelfHarm": true' services/reasoning-service/risk-log.jsonl
```

**Clinical workflow:**
1. Daily review of `risk-log.jsonl`
2. Identify sessions with `needsEscalation: true`
3. Follow your organization's crisis protocol (phone call, emergency dispatch, etc.)
4. Document follow-up in your EMR system

---

## Safety Guardrails Explained

### Pre-Check (Keyword Matching)
- **When**: Before LLM processes input
- **What**: Scans for crisis keywords (suicide, self-harm, violence)
- **Action**: If detected, returns crisis template (no LLM)
- **Keywords (Tamil)**: தற்கொலை, சாகணும், கொல், குரல்கள், etc.
- **Keywords (English)**: suicide, kill myself, end it, voices, etc.

### Post-Check (LLM Output Validation)
- **When**: After LLM generates response
- **What**: Scans for diagnosis, medication, dismissive language
- **Action**: If unsafe, replaces with neutral response
- **Blocked phrases**: "You have depression", "Take these pills", "Just get over it"

### Grounding Prompts
If user seems dissociated, system offers:
- **Tamil**: "நீங்கள் இப்போது எங்கே இருக்கிறீர்கள்?" (Where are you now?)
- **Tamil**: "உங்கள் கைகளை அசைத்துப் பார்க்கவும்" (Try moving your hands)

---

## Limitations (Be Transparent)

### ❌ This tool does NOT:
- Diagnose mental health conditions
- Prescribe medication
- Replace therapy or counseling
- Provide emergency crisis intervention (directs to helplines)
- Guarantee 100% safety (all inputs logged for review)

### ✅ This tool DOES:
- Provide initial emotional support
- Recognize crisis keywords
- Deflect to appropriate resources
- Log concerning interactions
- Offer 24/7 availability as supplement to human care

---

## Demo Script (5 minutes)

**Introduction (1 min):**
- "This is a Tamil voice assistant for mental health support."
- "It's designed to supplement — not replace — clinical care."
- "Let me show you how it handles different scenarios."

**Demo 1 - Anxiety (1 min):**
- Press button, say: "நான் மிகவும் கவலையாக உணர்கிறேன்"
- Show transcript, response, and audio playback
- Point out: "Notice it's supportive but doesn't diagnose."

**Demo 2 - Crisis (2 min):**
- Press button, say: "நான் தற்கொலை செய்து கொள்ள நினைக்கிறேன்"
- Show immediate crisis template response
- Point to helpline numbers banner
- Show `risk-log.jsonl` entry
- "This is where you'd follow up via your crisis protocol."

**Demo 3 - Safety Filter (1 min):**
- Type or say: "Can you prescribe antidepressants?"
- Show filtered/deflected response
- "System blocks medical advice automatically."

**Conclusion:**
- "All interactions logged for clinical review."
- "Use this as a first-contact tool, then escalate to human care."

---

## Technical Details (For IT Staff)

### Architecture
- **Frontend**: React (localhost:5173)
- **Backend**: 3 FastAPI services (ports 8001, 8002, 8003)
- **STT**: Groq Whisper (Phase A) or whisper.cpp (Phase B)
- **TTS**: Google Cloud TTS (Phase A) or system TTS (Phase B)
- **LLM**: Groq Llama-3.3-70B (Phase A) or MLC-LLM (Phase B)

### Data Privacy
- **Audio**: Stays on device, deleted immediately after processing
- **Text**: Transcripts sent to API (Phase A) or processed locally (Phase B)
- **Storage**: Only risk logs stored (`risk-log.jsonl`)
- **HIPAA**: Not compliant yet (no encryption, no audit logs)

### Deployment
- **Current**: Local only (localhost)
- **Phase B**: On-device processing (mobile/desktop app)
- **Future**: Cloud deployment with encryption and compliance

---

## FAQ

**Q: Can patients use this at home?**  
A: Yes, but they should be informed it's a supplement, not a replacement for professional care.

**Q: What if the system gives bad advice?**  
A: Safety filters block diagnosis/medication. If something slips through, it's logged for review.

**Q: How do I access risk logs?**  
A: SSH into server, navigate to `services/reasoning-service/risk-log.jsonl`.

**Q: Can I customize crisis templates?**  
A: Yes, edit `services/reasoning-service/app/safety.py` → `get_crisis_template()`.

**Q: What languages are supported?**  
A: Tamil (primary), English (fallback). System detects and responds in user's language.

**Q: Is this FDA-approved?**  
A: No. This is a research/pilot tool, not a medical device.

---

## Next Steps After Demo

1. **Pilot Study**: Test with 10-20 consenting patients for 2 weeks
2. **Feedback Survey**: Collect user and clinician feedback
3. **Risk Log Review**: Analyze flagged sessions, tune keywords
4. **Accuracy Check**: Compare crisis detection vs human clinician judgment
5. **Iterate**: Adjust templates, prompts, and safety filters based on findings

---

## Support & Resources

- **Technical Issues**: Check `logs/` folder or contact IT
- **Clinical Questions**: Review `risk-log.jsonl`, consult supervisor
- **Documentation**: See `DOCS.md`, `PHASE_TOGGLE_GUIDE.md`, `ARCHITECTURE.md`
- **Crisis Protocols**: Use your organization's existing escalation process

---

**Remember**: This tool is an **assistant**, not a **replacement** for your expertise. Always follow established clinical protocols for crisis intervention.

✨ **Thank you for supporting mental health innovation!**
