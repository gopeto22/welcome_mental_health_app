# Tamil Mind Mate - Streamlit Demo

A web-based demo of the Tamil Mind Mate mental health support assistant for clinician testing.

## 🎯 Two Testing Modes

### 1. **Demo Mode** (Default - Always Available)
- ✅ Works 24/7 without any setup
- ✅ Simulated therapeutic responses
- ✅ All features working (exercises, safety plan, bilingual)
- ✅ Perfect for initial testing and feedback
- 🎭 Uses pre-programmed contextual responses

### 2. **Real AI Mode** (On Request)
- 🤖 Live Groq AI (Llama-3.3-70B) with real therapeutic reasoning
- 🎙️ Google Cloud TTS for audio generation
- ⚡ Requires local backend running + ngrok exposure
- 📞 Request this when you want to test full AI capabilities

## Quick Deploy to Streamlit Cloud

1. **Go to**: https://share.streamlit.io/

2. **Sign in** with GitHub

3. **Click "New app"**

4. **Fill in**:
   - Repository: `gopeto22/welcome_mental_health_app`
   - Branch: `main`
   - Main file: `streamlit-demo/app.py`

5. **Deploy** - App will be live in 2-3 minutes at your custom URL

**Default mode**: Demo mode (no backend needed)

## 🔄 Switching to Real AI (For Maintainers)

When a clinician requests real AI testing:

1. **Start backend services**:
   ```bash
   cd services/reasoning-service && ./start.sh &
   cd services/speech-service && ./start.sh &
   ```

2. **Expose with ngrok**:
   ```bash
   ./expose-backend.sh
   ```
   
   This will give you a public URL like: `https://abc123.ngrok.io`

3. **Update Streamlit Cloud**:
   - Go to your app settings
   - Environment variables:
     ```
     DEMO_MODE=false
     REASONING_SERVICE_URL=https://abc123.ngrok.io
     SPEECH_SERVICE_URL=https://abc123.ngrok.io
     ```
   - Save (auto-redeploys in 2 minutes)

4. **Notify clinician**: App now uses real AI

5. **When done**:
   - Set `DEMO_MODE=true` in Streamlit Cloud
   - Press Ctrl+C in the ngrok terminal
   - App switches back to demo mode

## For Clinicians

### Testing in Demo Mode
Please test and provide feedback on:
- ✅ Conversation flow and naturalness
- ✅ Response appropriateness and empathy
- ✅ Exercise effectiveness
- ✅ Safety plan timing and content
- ✅ Language support quality (English ↔ Tamil)
- ✅ Overall user experience

### Requesting Real AI Mode
If you'd like to test with the full AI backend:
1. Contact the maintainer
2. They'll enable real AI mode temporarily
3. You'll be notified when it's ready (takes ~5 minutes)
4. Test the live AI responses and provide feedback

**Note**: Demo mode is sufficient for most testing - real AI is for validation of actual model quality.
