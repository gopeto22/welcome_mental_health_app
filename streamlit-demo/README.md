# 🚀 Streamlit Clinician Demo

A simplified demo app that reproduces the Tamil Mind Mate mobile prototype for easy clinician testing.

## ✨ Features

- **SUDS Entry Screen** - Distress level slider (0-10)
- **Chat Interface** - Real-time conversation with AI assistant
- **Safety Plan** - UK 3-step escalation (auto-triggers at SUDS=10 or crisis keywords)
- **Grounding Exercises** - 3 exercises with audio playback
  - Paced Breathing (2-3 min)
  - 5-4-3-2-1 Grounding (3-4 min)
  - General Grounding (2-3 min)
- **Bilingual Support** - 🇬🇧 English ↔ தமிழ் Tamil
- **Session Tracking** - Conversation history and session metadata

## 🎯 Why Streamlit?

**Advantages over mobile prototype:**
- ✅ **No build step** - Pure Python, instant updates
- ✅ **Easy deployment** - `streamlit run app.py` (one command)
- ✅ **Desktop-friendly** - Better for clinician testing on laptops
- ✅ **Built-in audio player** - No custom audio handling needed
- ✅ **Session state** - Persistent across interactions
- ✅ **Same backend** - Uses existing Groq + Google Cloud APIs

**What's the same:**
- Identical conversation logic (role-prefixed messages)
- Same safety detection (SUDS + crisis keywords)
- Same exercises with validated audio files
- Same UK safety plan (3 steps)
- Same translations (English/Tamil)

## 🚀 Quick Start

### Prerequisites

1. **Backend services must be running:**
   ```bash
   # Terminal 1: Speech Service
   cd services/speech-service
   source venv/bin/activate
   uvicorn app.main:app --port 8002 --reload
   
   # Terminal 2: Reasoning Service
   cd services/reasoning-service
   source venv/bin/activate
   uvicorn app.main:app --port 8003 --reload
   ```

2. **Audio files must exist:**
   ```bash
   # Check audio files are present
   ls ../frontend/public/audio/exercises/
   # Should see: breathing_en.mp3, breathing_ta.mp3, focus_en.mp3, focus_ta.mp3, general_en.mp3, general_ta.mp3
   ```

### Installation

```bash
cd streamlit-demo

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Run the App

```bash
streamlit run app.py
```

The app will open in your browser at **http://localhost:8501**

## 📋 Testing Protocol

### Test 1: Basic Conversation (3 min)
1. Start app
2. Set SUDS = 5
3. Click "Start Session"
4. Send: "I had a nightmare"
5. **Verify**: Response mentions nightmare (contextual)
6. Send: "I feel worried"
7. **Verify**: Response references previous message (context retained)

### Test 2: Safety Plan Trigger (2 min)
1. Restart app
2. Set SUDS = 10
3. Click "Start Session"
4. **Verify**: UK 3-step safety plan displays immediately
5. Click "Try a grounding exercise"
6. **Verify**: Chat interface appears

### Test 3: Grounding Exercises (5 min)
1. In sidebar, expand "Paced Breathing"
2. Click play on audio player
3. **Verify**: Audio plays for ~2-3 minutes
4. Toggle language to தமிழ் (top of sidebar)
5. Expand "சுவாச பயிற்சி" (Paced Breathing in Tamil)
6. Click play
7. **Verify**: Tamil audio plays

### Test 4: Crisis Keywords (2 min)
1. Start new session (SUDS = 5)
2. Send: "I want to hurt myself"
3. **Verify**: Safety plan displays immediately
4. **Verify**: Response includes helpline numbers

### Test 5: Language Switching (2 min)
1. Start session in English
2. Have conversation (2-3 messages)
3. Toggle to தமிழ் in sidebar
4. **Verify**: UI text updates to Tamil
5. **Verify**: Conversation history preserved
6. Send Tamil message
7. **Verify**: Response in Tamil context

## 🎨 Customization

### Change Translations

Edit `TRANSLATIONS` dict in `app.py`:
```python
TRANSLATIONS = {
    "en-GB": {
        "title": "Your Title Here",
        ...
    }
}
```

### Modify Exercise List

Edit `EXERCISES` dict in `app.py`:
```python
EXERCISES = {
    "breathing": {
        "en-GB": {"name": "...", "duration": "...", "audio": "..."},
        ...
    }
}
```

### Adjust Safety Plan Steps

Edit `render_safety_plan()` function in `app.py`

### Change API Endpoints

Edit constants at top of `app.py`:
```python
SPEECH_SERVICE_URL = "http://localhost:8002"
REASONING_SERVICE_URL = "http://localhost:8003"
```

## 📊 Session Tracking

The app tracks:
- **Session ID** - Unique identifier (format: `streamlit-YYYYMMDD-HHMMSS`)
- **Initial SUDS** - Distress level at session start
- **Message count** - Total messages exchanged
- **Conversation history** - Full transcript with roles

View in sidebar under "Session Info"

## 🐛 Troubleshooting

### "API Error: Connection refused"
**Problem**: Backend services not running  
**Solution**: Start speech-service (port 8002) and reasoning-service (port 8003)

### "Audio file not found"
**Problem**: Audio files missing from frontend/public/audio/exercises/  
**Solution**: Check audio files exist with correct names:
```bash
ls ../frontend/public/audio/exercises/
```

### "Module 'streamlit' not found"
**Problem**: Dependencies not installed  
**Solution**: 
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Safety plan not triggering
**Problem**: SUDS threshold or crisis detection logic  
**Solution**: Check `check_safety_trigger()` function and backend `/respond` API response

### Language toggle not working
**Problem**: Streamlit state update  
**Solution**: App uses `st.rerun()` to refresh - check console for errors

## 🚀 Deployment Options

### Option 1: Streamlit Cloud (Free)
1. Push to GitHub
2. Connect at https://share.streamlit.io
3. Deploy (includes free hosting)
4. Share public URL with clinicians

**Note**: Requires backend services accessible from internet (use ngrok or deploy backend separately)

### Option 2: Local Network
```bash
# Get your IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Run with external access
streamlit run app.py --server.address=0.0.0.0

# Share with clinicians on same WiFi
http://YOUR_IP:8501
```

### Option 3: Docker (Production)
```bash
# Create Dockerfile (see below)
docker build -t tamil-mind-mate-demo .
docker run -p 8501:8501 tamil-mind-mate-demo
```

## 📝 Development Tips

### Auto-reload on Code Changes
Streamlit auto-reloads when you save `app.py` - just edit and save!

### Debug Mode
Add to code:
```python
import streamlit as st
st.write("Debug:", st.session_state)  # View all session state
```

### Performance Profiling
```bash
streamlit run app.py --server.runOnSave=true --logger.level=debug
```

### Testing Without Backend
Mock the API call:
```python
def call_reasoning_api(user_input, history):
    # Return mock response for testing
    return {
        "reply_text": f"Echo: {user_input}",
        "risk_flags": {"needs_escalation": False}
    }
```

## 📦 File Structure

```
streamlit-demo/
├── app.py                 # Main Streamlit app (450 lines)
├── requirements.txt       # Python dependencies
├── README.md             # This file
└── venv/                 # Virtual environment (created by you)
```

## 🎯 Next Steps

### For Immediate Clinician Testing:
1. ✅ Run the app: `streamlit run app.py`
2. ✅ Test locally (5-10 minutes using protocol above)
3. ✅ Share on local network with clinicians

### For Production Deployment:
1. Deploy backend to cloud (Railway/Render/Azure)
2. Deploy Streamlit app to Streamlit Cloud (free)
3. Share public URL with clinicians

### For Further Development:
1. Add post-exercise SUDS check
2. Add session export (download transcript)
3. Add analytics (session duration, message count, exercise usage)
4. Add admin panel (view all sessions)

## 🤝 Support

**Questions?**
- Check backend logs: `tail -f ../logs/reasoning.log`
- Check Streamlit logs: Console output where you ran `streamlit run`
- Verify services: `curl http://localhost:8002/health`

**Issues?**
- Safety plan not showing → Check SUDS=10 or crisis keywords
- Audio not playing → Verify file paths in `get_audio_path()`
- API timeouts → Increase timeout in `call_reasoning_api()`

---

**Built**: November 10, 2025  
**Version**: 1.0.0  
**Python**: 3.11+  
**Streamlit**: 1.28+  
**Backend**: Groq API + Google Cloud TTS
