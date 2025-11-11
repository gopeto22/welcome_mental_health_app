# Clinician Testing - Quick Reference

## 📱 Deployment URL
Your app will be at: `https://[your-app-name].streamlit.app`

## 🎯 How It Works

### Default Mode: Demo (Always Available)
- ✅ Clinicians can test **24/7** without your involvement
- ✅ Simulated therapeutic responses (pre-programmed, contextual)
- ✅ All features working: exercises, safety plan, bilingual support
- 🎭 Shows "Demo Mode" indicator in app

### On-Demand: Real AI (When Requested)
- 🤖 Live Groq AI with Llama-3.3-70B model
- 🎙️ Google Cloud TTS for audio generation
- ⚡ Takes ~5 minutes to enable
- 🔗 Requires your computer running + ngrok

## 🚀 Deploy to Streamlit Cloud (First Time)

1. **Go to**: https://share.streamlit.io/
2. **Sign in** with GitHub
3. **New app**
4. **Fill in**:
   ```
   Repository: gopeto22/welcome_mental_health_app
   Branch: main
   Main file path: streamlit-demo/app.py
   ```
5. **Deploy** - Live in 2-3 minutes!

**Your URL**: Note it down and share with clinicians

## 🔄 When Clinician Requests Real AI

### Step 1: Start Backend Services
```bash
cd /Users/Joro/Downloads/tamil-mind-mate-main

# Start reasoning service
cd services/reasoning-service
./start.sh &
cd ../..

# Start speech service  
cd services/speech-service
./start.sh &
cd ../..
```

Verify they're running:
```bash
curl http://localhost:8002/health  # Should return {"status":"ok"...}
curl http://localhost:8003/health  # Should return {"status":"ok"...}
```

### Step 2: Expose with Ngrok
```bash
./expose-backend.sh
```

This will:
- ✅ Check services are running
- ✅ Start ngrok tunnel
- ✅ Display the public URL (e.g., `https://abc123.ngrok.io`)
- ⚠️ Keep terminal open (don't close!)

### Step 3: Update Streamlit Cloud

1. Go to: https://share.streamlit.io/
2. Find your app → Click on it
3. **Settings** → **Environment variables**
4. Click **Edit**
5. Add these variables:
   ```
   DEMO_MODE=false
   REASONING_SERVICE_URL=https://abc123.ngrok.io
   SPEECH_SERVICE_URL=https://abc123.ngrok.io
   ```
   (Replace `abc123.ngrok.io` with your actual ngrok URL from Step 2)
6. **Save**

App will automatically redeploy (takes ~2 minutes)

### Step 4: Notify Clinician
Send message:
```
✅ Real AI is now enabled! 

The app is now using live Groq AI with full therapeutic reasoning.
You can test it at the same URL: [your-app-url]

Look for "🤖 Real AI Mode" indicator at the top.

Take your time testing - I'll keep it running for [X hours/until Y time].
```

### Step 5: When Testing Complete

1. **Update Streamlit Cloud**:
   - Go to Settings → Environment variables
   - Set: `DEMO_MODE=true`
   - Remove or clear the URL variables
   - Save (redeploys in 2 minutes)

2. **Stop ngrok**:
   - Press `Ctrl+C` in the terminal running `expose-backend.sh`

3. **Stop backend services** (optional):
   ```bash
   pkill -f "uvicorn.*8002"  # Stop speech service
   pkill -f "uvicorn.*8003"  # Stop reasoning service
   ```

## 📧 Message Template for Clinicians

### Initial Share (Demo Mode)
```
Subject: Tamil Mind Mate - Demo Ready for Testing

Hi [Clinician Name],

The demo app is now live for testing:
🔗 [your-streamlit-url]

This is running in **demo mode** with simulated AI responses, 
which is sufficient for testing the overall experience, UI/UX, 
exercises, and safety features.

**Features to test:**
- AI conversation flow (demo responses)
- 3 grounding exercises with audio
- UK 3-step safety plan
- English ↔ Tamil language toggle
- Distress tracking (SUDS scale)

**Testing time**: 5-10 minutes

**Feedback needed**:
- Conversation naturalness
- Exercise effectiveness  
- Safety plan timing
- Language quality
- Overall experience

If you'd like to test with the **real AI backend** (live Groq model), 
just let me know and I can enable it temporarily.

Available 24/7 for testing!

Best,
[Your Name]
```

### When Enabling Real AI
```
Subject: Re: Tamil Mind Mate - Real AI Now Enabled

Hi [Clinician Name],

✅ I've enabled the **real AI backend** as requested.

Same URL: [your-streamlit-url]

You should now see "🤖 Real AI Mode" at the top of the app.

Key differences you'll notice:
- More varied, contextual responses
- Responses adapt to conversation history
- More natural therapeutic language
- Better crisis detection

This will stay enabled for [next 2 hours / until 5pm / etc].

Take your time testing and comparing vs. demo mode!

Best,
[Your Name]
```

### When Switching Back to Demo
```
Subject: Re: Tamil Mind Mate - Back to Demo Mode

Hi [Clinician Name],

Thanks for testing the real AI! I've switched the app back to 
**demo mode** so it can continue to be available 24/7 without 
my computer running.

The app is still accessible at the same URL for any additional 
testing you'd like to do.

Looking forward to your feedback!

Best,
[Your Name]
```

## ⚠️ Important Notes

1. **Ngrok Free Tier**: 
   - Only allows 1 tunnel
   - We use 1 tunnel and route both services through it
   - URL changes each time you restart ngrok

2. **Keep Terminal Open**: 
   - Don't close the terminal running `expose-backend.sh`
   - Your computer must stay on and connected to internet

3. **Demo Mode is Default**:
   - Clinicians can always test demo mode without bothering you
   - Only enable real AI when specifically requested

4. **Environment Variables**:
   - Remember to set `DEMO_MODE=true` after testing
   - Otherwise app will try to connect to non-existent backend

## 🐛 Troubleshooting

### Backend services won't start
```bash
# Check if ports are already in use
lsof -i :8002
lsof -i :8003

# Kill existing processes
pkill -f "uvicorn.*8002"
pkill -f "uvicorn.*8003"

# Try starting again
```

### Ngrok tunnel fails
```bash
# Check ngrok is installed
ngrok version

# Check auth token is set
ngrok config check

# If not, add your token
ngrok authtoken YOUR_TOKEN
```

### Streamlit app shows error after enabling real AI
- Check ngrok terminal is still running
- Verify URL in environment variables is correct (https://, not http://)
- Check backend services are healthy: `curl http://localhost:8003/health`

### App stuck on "Thinking..."
- Backend might have crashed - check `expose-backend.sh` terminal for errors
- Restart services and ngrok if needed

## 📊 Expected Usage Pattern

**Week 1-2**: Most testing in demo mode
- Clinicians test UI/UX, exercises, safety plan
- Get familiar with conversation flow
- Provide initial feedback

**Week 3**: Real AI testing sessions
- 2-3 scheduled sessions where you enable real AI
- Clinicians compare vs demo mode
- Validate actual AI quality

**Ongoing**: Demo mode by default
- Available 24/7 for ongoing testing
- Real AI on request only

---

**🎉 You're all set! Deploy to Streamlit Cloud and share the URL with clinicians.**
