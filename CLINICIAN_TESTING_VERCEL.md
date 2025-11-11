# Clinician Testing Guide - Vercel Deployment

## 🎯 Overview

You have **two deployment options** for clinician testing:

1. **Demo Mode** (Default) - Works immediately, no setup needed
2. **Real AI Mode** - Connect to your local backend for full functionality

---

## 📱 Current Deployment URLs

- **React Mobile App (Vercel)**: https://welcome-mental-health-app-git-main-gopeto22s-projects.vercel.app/mobile
- **Streamlit Demo**: https://mentalhealthassist.streamlit.app

---

## 🎭 Option 1: Demo Mode (Current State)

**Perfect for:**
- Quick demonstrations
- Testing UI/UX with clinicians
- No technical setup needed
- Available 24/7

**Status:** ✅ Already deployed and working

**Test it now:**
```bash
# Just share this URL with clinicians:
https://welcome-mental-health-app-git-main-gopeto22s-projects.vercel.app/mobile
```

**Features:**
- ✅ Full mobile interface (exact local design)
- ✅ Contextual demo responses (trauma-aware)
- ✅ Audio exercises (breathing, grounding)
- ✅ Tamil language toggle
- ✅ SUDS rating system
- ⚠️ Simulated AI responses (not real Groq/Llama)

---

## 🤖 Option 2: Real AI Mode (On-Demand)

**Perfect for:**
- Clinical validation sessions
- Testing actual AI reasoning
- Demonstrating full capabilities
- Voice-to-voice conversations

**When to use:** Only when clinicians need to test real AI behavior

### Setup Process (5 minutes)

#### Step 1: Check ngrok Installation

```bash
# Check if ngrok is installed
ngrok version

# If not installed:
brew install ngrok

# Sign up and authenticate
# 1. Go to: https://dashboard.ngrok.com/signup
# 2. Get auth token: https://dashboard.ngrok.com/get-started/your-authtoken
# 3. Configure:
ngrok config add-authtoken YOUR_TOKEN
```

#### Step 2: Start Backend Services

```bash
cd /Users/Joro/Downloads/tamil-mind-mate-main

# Start all backend services
./start-services.sh
```

**Expected output:**
```
✅ Speech service running on port 8002
✅ Reasoning service running on port 8003
```

#### Step 3: Expose Backend via ngrok

```bash
# Run the exposure script
./expose-backend-vercel.sh
```

**The script will:**
1. ✅ Verify backend services are running
2. 🌐 Start ngrok tunnel (creates public HTTPS URL)
3. 📋 Display the backend URL (e.g., `https://abc123.ngrok.io`)
4. 📝 Show instructions for updating Vercel

**Example output:**
```
============================================
✅ Backend Exposed Successfully!
============================================

🔗 Backend URL (ready to use):
   https://abc123-def456.ngrok.io

📝 Now Update Vercel Environment Variables...
```

#### Step 4: Update Vercel Configuration

1. **Go to Vercel Dashboard:**
   - URL: https://vercel.com/gopeto22s-projects
   - Select: `welcome-mental-health-app`

2. **Navigate to Settings:**
   - Click: `Settings` tab
   - Click: `Environment Variables`

3. **Add/Update Variables:**
   ```
   VITE_REASONING_SERVICE_URL = https://abc123-def456.ngrok.io
   VITE_SPEECH_SERVICE_URL    = https://abc123-def456.ngrok.io
   VITE_DEMO_MODE             = false
   ```
   ⚠️ Replace with YOUR actual ngrok URL from Step 3

4. **Redeploy:**
   - Go to: `Deployments` tab
   - Click: `...` menu on latest deployment
   - Click: `Redeploy`
   - Wait: ~2 minutes

5. **Verify:**
   ```bash
   # The app should now use real AI
   # Open: https://welcome-mental-health-app-git-main-gopeto22s-projects.vercel.app/mobile
   ```

#### Step 5: Conduct Testing Session

**Share with clinicians:**
- URL: https://welcome-mental-health-app-git-main-gopeto22s-projects.vercel.app/mobile
- Mode: Real AI (connected to Groq Llama-3.3-70B)
- Duration: Keep `expose-backend-vercel.sh` running during entire session

**Features now available:**
- ✅ Real AI reasoning (context-aware responses)
- ✅ Voice-to-voice mode (if speech service working)
- ✅ Safety protocol enforcement
- ✅ Grounding exercises with proper triggers
- ✅ Tamil language support

#### Step 6: End Testing Session

**When clinicians finish:**

1. **Stop ngrok (in terminal):**
   ```bash
   # Press Ctrl+C in the terminal running expose-backend-vercel.sh
   ```

2. **Revert Vercel to Demo Mode:**
   - Go to: Vercel → Settings → Environment Variables
   - Update:
     ```
     VITE_DEMO_MODE = true
     ```
   - Remove (or set to empty):
     ```
     VITE_REASONING_SERVICE_URL = 
     VITE_SPEECH_SERVICE_URL = 
     ```
   - Redeploy

3. **Stop local services (optional):**
   ```bash
   ./stop-services.sh
   ```

---

## 📊 Comparison: Demo vs Real AI

| Feature | Demo Mode | Real AI Mode |
|---------|-----------|--------------|
| **Setup** | None (works immediately) | 5 min (ngrok + Vercel update) |
| **Availability** | 24/7 | Only when your Mac is running |
| **Cost** | Free | Free (ngrok free tier) |
| **Responses** | Simulated (contextual) | Real AI (Groq Llama-3.3-70B) |
| **Voice Mode** | Not available | Full voice-to-voice |
| **Safety Protocol** | Basic rules | Full clinical protocol |
| **Context Memory** | Limited | Full conversation history |
| **Best For** | UI/UX demos | Clinical validation |

---

## 🔒 Security & Limitations

### ngrok Free Tier
- ✅ 1 simultaneous tunnel
- ✅ 40 connections/minute
- ⚠️ URL changes each time (not persistent)
- ⚠️ Public but hard to guess URL

### Your Local Backend
- Must be running on your Mac during testing
- Uses your Groq API credits
- Keeps your Mac awake during sessions

### Recommendations
1. **Schedule testing sessions** (don't leave ngrok running 24/7)
2. **Use demo mode** for general access
3. **Enable real AI** only for scheduled clinician sessions
4. **Monitor Groq usage** via dashboard

---

## 🚀 Alternative: Free Backend Hosting Options

If you want **persistent backend hosting** (not local), here are options:

### Option A: Railway (Recommended)
- **Free Tier:** $5 free credits/month
- **Pros:** Postgres, persistent URLs, auto-deploy from GitHub
- **Setup:** 15-20 minutes
- **Cost after free tier:** ~$10-20/month

### Option B: Render
- **Free Tier:** Yes (with limitations)
- **Pros:** Easy setup, persistent URLs
- **Cons:** Services sleep after 15min inactivity
- **Setup:** 15-20 minutes

### Option C: Google Cloud Run
- **Free Tier:** 2 million requests/month
- **Pros:** Scales to zero (only pay for usage)
- **Cons:** More complex setup, cold starts
- **Setup:** 30-45 minutes

### My Recommendation:
**Stick with local + ngrok for now** because:
1. ✅ Everything already works locally
2. ✅ Zero cost (ngrok free tier)
3. ✅ No new deployment complexity
4. ✅ Perfect for controlled testing sessions
5. ✅ Can switch to hosted later if needed

---

## 📝 Quick Reference Commands

```bash
# Check backend status
curl http://localhost:8002/health
curl http://localhost:8003/health

# Start backend services
./start-services.sh

# Expose backend for Vercel
./expose-backend-vercel.sh

# Stop backend services
./stop-services.sh

# Check ngrok tunnels
curl http://localhost:4040/api/tunnels | python3 -m json.tool
```

---

## 🎯 Recommended Testing Workflow

### For Regular Demos (Clinician Outreach)
```
1. Share Vercel URL (demo mode already active)
2. No setup needed
3. Available 24/7
```

### For Clinical Validation Sessions
```
1. Schedule session with clinician
2. 10 minutes before: ./start-services.sh
3. Run: ./expose-backend-vercel.sh
4. Update Vercel environment variables
5. Share Vercel URL with clinician
6. Conduct testing session
7. After session: Press Ctrl+C to stop ngrok
8. Revert Vercel to demo mode
```

---

## 🆘 Troubleshooting

### Backend won't expose
```bash
# Check if services are running
curl http://localhost:8002/health
curl http://localhost:8003/health

# If not running, start them:
./start-services.sh
```

### ngrok authentication error
```bash
# Sign up: https://dashboard.ngrok.com/signup
# Get token: https://dashboard.ngrok.com/get-started/your-authtoken
# Configure:
ngrok config add-authtoken YOUR_TOKEN
```

### Vercel deployment not updating
1. Check environment variables are saved
2. Manually trigger redeploy (Deployments → ... → Redeploy)
3. Wait 2-3 minutes for build to complete
4. Clear browser cache and reload

### "Demo mode" still showing after update
1. Verify `VITE_DEMO_MODE=false` in Vercel
2. Verify URLs are set correctly (no trailing slash)
3. Hard refresh browser (Cmd+Shift+R)
4. Check browser console for errors

---

## 📞 Support

If you encounter issues:

1. **Check logs:**
   ```bash
   tail -f logs/speech.log
   tail -f logs/reasoning.log
   ```

2. **Verify environment:**
   ```bash
   # Check .env file has Groq API key
   cat .env | grep GROQ_API_KEY
   ```

3. **Test local backend directly:**
   ```bash
   curl -X POST http://localhost:8003/respond \
     -H "Content-Type: application/json" \
     -d '{"transcript_window":["I feel anxious"], "suds_level":5}'
   ```

---

## ✅ Summary

**Current Status:**
- ✅ Vercel frontend deployed (demo mode)
- ✅ Local backend working
- ✅ ngrok exposure script ready

**For Clinician Testing:**
1. **Quick demos:** Use demo mode (already live)
2. **Real AI testing:** Run `./expose-backend-vercel.sh` and update Vercel
3. **After testing:** Stop ngrok, revert to demo mode

**Next Steps:**
- Test the demo mode URL with clinicians
- Schedule first real AI testing session
- Consider paid hosting if you need 24/7 real AI access

---

**Last Updated:** November 11, 2025
