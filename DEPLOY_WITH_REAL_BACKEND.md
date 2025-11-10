# 🚀 Deploy FULL Version to Streamlit Cloud (With Real AI)

## Goal
Deploy your Streamlit app with **REAL backend services** so it works exactly like your local version - with actual Groq AI responses and Google TTS audio generation.

## ⚡ Quick Option: Ngrok (Test in 5 Minutes)

This exposes your local services to Streamlit Cloud temporarily.

### Step 1: Run Ngrok Script

```bash
cd /Users/Joro/Downloads/tamil-mind-mate-main
./expose-services-ngrok.sh
```

This will:
- ✅ Check services are running
- ✅ Create ngrok tunnels
- ✅ Display URLs to copy

### Step 2: Copy the URLs

You'll see output like:
```
Speech Service:    https://abc123.ngrok.io
Reasoning Service: https://def456.ngrok.io
```

###Step 3: Update Streamlit Cloud

1. Go to https://share.streamlit.io/
2. Find your app
3. Click "Settings" → "Environment variables"
4. Update/Add:
   ```
   DEMO_MODE=false
   SPEECH_SERVICE_URL=https://abc123.ngrok.io
   REASONING_SERVICE_URL=https://def456.ngrok.io
   ```
5. Save (app will automatically redeploy)

### Step 4: Test

Wait 2-3 minutes for redeploy, then test your app:
- ✅ Real AI responses (not demo)
- ✅ Contextual conversation
- ✅ Audio exercises working
- ✅ Safety detection working

### ⚠️ Ngrok Limitations
- URLs change when you restart ngrok
- Must keep your computer on
- Must keep services running
- Must keep terminal open

**For production, use Railway/Render (see below)**

---

## 🏗️ Permanent Option: Railway (Free Tier)

Deploy backend services to cloud for permanent URLs.

### Step 1: Create Railway Account

1. Go to https://railway.app/
2. Sign up with GitHub (free)
3. You get: $5 credit + 500 hours/month free

### Step 2: Prepare Environment Files

Check your API keys:

```bash
# Check speech service .env
cat services/speech-service/.env | grep GROQ_API_KEY

# Check reasoning service .env
cat services/reasoning-service/.env | grep GROQ_API_KEY
```

### Step 3: Deploy Speech Service

1. **Railway Dashboard** → "New Project"
2. **"Deploy from GitHub repo"**
3. Select: `sahanbull/welcome_mental_health_app`
4. **Settings**:
   - Name: `speech-service`
   - Root Directory: `services/speech-service`
   - Builder: `Dockerfile`

5. **Add Variables** (Settings → Variables):
   ```
   GROQ_API_KEY=your_groq_key_here
   PORT=8002
   ```

6. **Add GCP Key** (if you have Google Cloud TTS):
   - Settings → Variables → "RAW Editor"
   - Add:
   ```json
   GOOGLE_APPLICATION_CREDENTIALS=/app/gcp-key.json
   ```
   - Then add file content (copy from your `gcp-key.json`)

7. **Generate Domain**:
   - Settings → "Generate Domain"
   - Note URL: `https://speech-service-production-xxxx.up.railway.app`

### Step 4: Deploy Reasoning Service

1. **Same Project** → "New Service"
2. Select same repo
3. **Settings**:
   - Name: `reasoning-service`
   - Root Directory: `services/reasoning-service`
   - Builder: `Dockerfile`

4. **Add Variables**:
   ```
   GROQ_API_KEY=your_groq_key_here
   PORT=8003
   ```

5. **Generate Domain**:
   - Note URL: `https://reasoning-service-production-xxxx.up.railway.app`

### Step 5: Update Streamlit Cloud

1. Go to your Streamlit Cloud dashboard
2. Settings → Environment variables
3. Add:
   ```
   DEMO_MODE=false
   SPEECH_SERVICE_URL=https://speech-service-production-xxxx.up.railway.app
   REASONING_SERVICE_URL=https://reasoning-service-production-xxxx.up.railway.app
   ```
4. Save (auto-redeploys)

### Step 6: Test Production App

Your app now has:
- ✅ Real Groq LLM responses
- ✅ Google Cloud TTS (if configured)
- ✅ Permanent URLs (no restart needed)
- ✅ Always available
- ✅ Fast response times

---

## 📊 Cost Comparison

### Ngrok (Quick Test)
- **Cost**: Free
- **Setup**: 5 minutes
- **Pros**: Instant, no cloud setup
- **Cons**: Temporary, requires computer on

### Railway (Production)
- **Cost**: Free tier (500 hrs/month)
- **Setup**: 20 minutes
- **Pros**: Permanent, always available
- **Cons**: Requires cloud setup

### Render (Alternative)
- **Cost**: Free tier (750 hrs/month)
- **Setup**: 20 minutes
- **Pros**: Similar to Railway
- **Cons**: Slower cold starts (free tier)

---

## 🎯 Recommended Approach

### For Right Now (Testing)
Use **Ngrok** - Get it working in 5 minutes

```bash
./expose-services-ngrok.sh
# Copy URLs
# Update Streamlit Cloud settings
# Test!
```

### For Production (Clinician Testing)
Use **Railway** - Spend 20 minutes for permanent deployment

Benefits:
- ✅ Always available
- ✅ No computer needed
- ✅ Professional URLs
- ✅ Reliable uptime

---

## 🧪 Testing Checklist

After deployment, test these features:

### 1. Real AI Responses
- Send: "I'm feeling really anxious"
- Expect: Contextual, varied response (not demo template)

### 2. Conversation Context
- Send message 1: "I'm worried about work"
- Send message 2: "What should I do?"
- Expect: Response references previous message

### 3. Audio Exercises
- Click "Paced Breathing"
- Expect: Audio plays (static MP3 from repo)

### 4. Safety Detection
- Send: "I want to hurt myself"
- Expect: Immediate safety plan display

### 5. Language Toggle
- Switch to Tamil
- Send message
- Expect: Response in Tamil (if supported by backend)

---

## 🐛 Troubleshooting

### Services Not Responding

**Check Service Health:**
```bash
# Ngrok URLs
curl https://your-ngrok-url.ngrok.io/health

# Railway URLs
curl https://your-service.up.railway.app/health
```

**Expected Response:**
```json
{"status":"ok","service":"speech-service"}
```

### Audio Not Working

Audio files are in the repo, should work regardless of backend.

Check:
1. Browser console for errors
2. Audio files present: `streamlit-demo/audio/*.mp3`
3. Try different browser

### Demo Mode Still Active

Check Streamlit Cloud environment variables:
- `DEMO_MODE` must be `false` (not `true`)
- URLs must be HTTPS (not http://)
- No trailing slashes in URLs

### Slow Responses

**Ngrok**: Normal (extra hop)
**Railway**: First request may be slow (cold start)
**Solution**: Use Railway with paid plan ($5/month for always-on)

---

## 📋 Current Status

Your app is configured to:
- ✅ Support both demo and real modes
- ✅ Use environment variables for URLs
- ✅ Include all audio files
- ✅ Work with local or cloud backends

Choose your deployment method and follow the steps above!

---

## 🆘 Need Help?

- **Ngrok Issues**: Check terminal output, ensure services running
- **Railway Issues**: Check deployment logs in Railway dashboard
- **Streamlit Issues**: Check app logs in Streamlit Cloud dashboard

Everything is ready for deployment! 🚀
