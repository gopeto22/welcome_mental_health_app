# Deploy React Mobile App to Vercel

This guide helps you deploy the full React mobile app (from `frontend/`) which matches your local design exactly.

## 🎯 What You Get

**React app looks EXACTLY like local**:
- ✅ Same mobile design and UI
- ✅ Same conversation interface
- ✅ Same exercises and grounding features
- ✅ Professional React/TypeScript architecture

**BUT requires backend**:
- ❌ Cannot run in standalone demo mode (needs services)
- ✅ Works great when you expose backend via ngrok
- ⚡ Best for showcasing the real experience

## 📊 Comparison

| Feature | Streamlit (Current) | React App (This Guide) |
|---------|-------------------|----------------------|
| Design | Simplified web UI | ✅ **Exact local design** |
| Demo Mode | ✅ Works standalone | ❌ Needs backend |
| Setup Time | ✅ 5 minutes | ⏱️ 10 minutes |
| Maintenance | ✅ Zero | ⚠️ Need to run ngrok |
| Mobile UI | Basic | ✅ **Professional** |
| For Clinicians | Good for testing | ✅ **Best experience** |

## 🚀 Deploy to Vercel (Free)

### Step 1: Push to GitHub (Already Done ✅)

Your code is at: `https://github.com/gopeto22/welcome_mental_health_app`

### Step 2: Sign Up for Vercel

1. Go to: https://vercel.com/signup
2. Sign in with GitHub
3. Authorize Vercel to access your repositories

### Step 3: Deploy

1. **New Project**: Click "Add New..." → "Project"

2. **Import Repository**: 
   - Select: `gopeto22/welcome_mental_health_app`
   - Click "Import"

3. **Configure Project**:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Environment Variables** (leave empty for now):
   ```
   # Leave blank - we'll add backend URLs when needed
   VITE_REASONING_SERVICE_URL=
   VITE_SPEECH_SERVICE_URL=
   ```

5. **Deploy**: Click "Deploy"

Wait 2-3 minutes. You'll get a URL like:
```
https://welcome-mental-health-app-gopeto.vercel.app
```

### Step 4: Add Mobile Route

Access your app at:
```
https://your-app.vercel.app/mobile
```

## 🔄 Using With Backend

The React app needs backend services to work. Here's how:

### Option 1: On-Demand (Recommended)

**When clinician requests testing**:

1. Start backend locally:
   ```bash
   cd services/reasoning-service && ./start.sh &
   cd services/speech-service && ./start.sh &
   ```

2. Expose with ngrok:
   ```bash
   ./expose-backend.sh
   ```
   Get URL: `https://abc123.ngrok.io`

3. Update Vercel environment variables:
   - Go to: https://vercel.com/gopeto22/welcome-mental-health-app/settings/environment-variables
   - Add:
     ```
     VITE_REASONING_SERVICE_URL=https://abc123.ngrok.io
     VITE_SPEECH_SERVICE_URL=https://abc123.ngrok.io
     ```
   - Redeploy (Vercel does this automatically)

4. Notify clinician: App is ready at `https://your-app.vercel.app/mobile`

5. After testing: Remove environment variables, stop ngrok

### Option 2: Always On (Advanced)

Deploy backend services to Railway/Render for permanent URLs. See `CLINICIAN_TESTING_GUIDE.md` for details.

## 📧 Share With Clinicians

### If Using React App

```
Subject: Tamil Mind Mate - Full Mobile App Ready

Hi [Clinician Name],

The full mobile app is now live for testing:
🔗 https://your-app.vercel.app/mobile

This is the actual mobile interface (not a simplified demo).

**Features**:
- Full conversational AI interface
- 3 grounding exercises with audio
- UK 3-step safety plan  
- English ↔ Tamil support
- SUDS distress tracking

**Note**: This version requires my backend to be running. 
I've enabled it for today's testing session.

Available for the next [X hours].

Best,
[Your Name]
```

## 🎯 Recommendation

**Use BOTH deployments**:

1. **Streamlit** (mentalhealthassist.streamlit.app):
   - For 24/7 demo testing
   - Quick clinician feedback
   - No backend needed
   - Simple interface

2. **Vercel React App** (your-app.vercel.app/mobile):
   - For showcasing real experience
   - When you can run backend
   - Professional mobile design
   - Best represents final product

**Workflow**:
- Week 1-2: Share Streamlit for initial feedback
- Week 3: Schedule sessions with React app + backend for real testing
- Ongoing: Keep both available based on clinician preference

## 🐛 Troubleshooting

### App shows "Cannot connect to backend"

**Fix**: Backend not running or env vars not set
```bash
# Check backend is running
curl http://localhost:8003/health

# Check ngrok is active
curl http://localhost:4040/api/tunnels

# Update Vercel env vars with ngrok URL
```

### Audio doesn't play

**Fix**: Audio files should be in `frontend/public/audio/exercises/`
```bash
ls -la frontend/public/audio/exercises/
# Should show: breathing_en.mp3, focus_en.mp3, general_en.mp3, etc.
```

### Mobile view looks broken

**Fix**: Access the `/mobile` route specifically
```
❌ https://your-app.vercel.app
✅ https://your-app.vercel.app/mobile
```

### Build fails on Vercel

**Fix**: Check build logs, usually Node.js version mismatch
- Vercel Settings → General → Node.js Version
- Set to: `18.x` or `20.x`

## 📝 Quick Reference

**Streamlit Demo**: mentalhealthassist.streamlit.app
- ✅ Always available
- 🎭 Demo mode (simulated AI)
- 🖥️ Simple web interface

**React Mobile App**: your-app.vercel.app/mobile  
- ⚡ Requires backend
- 🤖 Real AI (when backend enabled)
- 📱 Professional mobile design

**Backend Control**: `./expose-backend.sh`
- Exposes local services via ngrok
- Update Vercel env vars with URL
- Keep terminal open during testing

---

**Ready to deploy? Just follow Steps 1-4 above!**
