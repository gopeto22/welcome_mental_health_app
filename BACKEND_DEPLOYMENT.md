# Backend Services Deployment for Streamlit Cloud

This guide shows how to deploy the backend services (Speech + Reasoning) so your Streamlit app can connect to them.

## 🎯 Architecture

```
Streamlit Cloud (Frontend)
    ↓
Railway/Render (Backend Services)
    ├── Speech Service (Port 8002)
    └── Reasoning Service (Port 8003)
```

## Option 1: Railway (Recommended - Free Tier)

### Setup Railway Account
1. Go to https://railway.app/
2. Sign up with GitHub (free)
3. Get $5 credit + 500 hours/month free

### Deploy Speech Service

1. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose: `sahanbull/welcome_mental_health_app`

2. **Configure Speech Service**
   - Root Directory: `services/speech-service`
   - Build Command: (auto-detected from Dockerfile)
   - Start Command: (auto-detected)

3. **Add Environment Variables**
   ```
   GROQ_API_KEY=your_groq_api_key
   GOOGLE_APPLICATION_CREDENTIALS=/app/gcp-key.json
   PORT=8002
   ```

4. **Add GCP Credentials**
   - Copy your `gcp-key.json` content
   - Add as file in Railway: Settings → Variables → Add File
   - Path: `/app/gcp-key.json`

5. **Generate Domain**
   - Settings → Generate Domain
   - Note the URL: `https://speech-service-xxx.railway.app`

### Deploy Reasoning Service

1. **Add Service to Same Project**
   - In your project, click "New Service"
   - Select same GitHub repo

2. **Configure Reasoning Service**
   - Root Directory: `services/reasoning-service`
   - Build Command: (auto-detected)
   - Start Command: (auto-detected)

3. **Add Environment Variables**
   ```
   GROQ_API_KEY=your_groq_api_key
   PORT=8003
   ```

4. **Generate Domain**
   - Settings → Generate Domain
   - Note the URL: `https://reasoning-service-xxx.railway.app`

## Option 2: Render (Alternative - Free Tier)

### Setup Render Account
1. Go to https://render.com/
2. Sign up with GitHub (free)
3. 750 hours/month free

### Deploy Services

1. **New Web Service**
2. **Connect Repository**: `sahanbull/welcome_mental_health_app`
3. **Speech Service**:
   - Name: `speech-service`
   - Root Directory: `services/speech-service`
   - Environment: `Docker`
   - Plan: `Free`
   - Environment Variables: (same as Railway)

4. **Reasoning Service**:
   - Same process, use `services/reasoning-service`

## Option 3: Quick Test with Ngrok (Temporary)

For quick testing without cloud deployment:

```bash
# Install ngrok
brew install ngrok

# Expose speech service
ngrok http 8002

# In another terminal, expose reasoning service
ngrok http 8003
```

Note the URLs (e.g., `https://abc123.ngrok.io`)

## Update Streamlit App

Once services are deployed, update `streamlit-demo/app.py`:

```python
# Replace these with your deployed URLs
SPEECH_SERVICE_URL = os.getenv("SPEECH_SERVICE_URL", "https://speech-service-xxx.railway.app")
REASONING_SERVICE_URL = os.getenv("REASONING_SERVICE_URL", "https://reasoning-service-xxx.railway.app")

# Disable demo mode
DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"
```

## Update Streamlit Cloud Settings

In Streamlit Cloud app settings, add environment variables:

```
DEMO_MODE=false
SPEECH_SERVICE_URL=https://speech-service-xxx.railway.app
REASONING_SERVICE_URL=https://reasoning-service-xxx.railway.app
```

## Cost Estimate

### Railway (Recommended)
- **Free Tier**: $5 credit + 500 hours/month
- **Cost**: $0 for development/testing
- **Estimated**: 2 services × 200 hours = 400 hours/month (within free tier)

### Render
- **Free Tier**: 750 hours/month
- **Cost**: $0
- **Note**: Services spin down after 15 min inactivity (slower first load)

### Ngrok
- **Free**: Yes, but temporary URLs change
- **Best for**: Quick testing only

## Next Steps

1. Choose deployment platform (Railway recommended)
2. Deploy both services
3. Note the service URLs
4. Update Streamlit app configuration
5. Push changes to GitHub
6. Streamlit Cloud will auto-redeploy

Your Streamlit app will then have FULL functionality with real backend services!
