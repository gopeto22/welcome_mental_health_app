# Vercel Update Checklist

## Step 1: Go to Vercel Dashboard
🔗 https://vercel.com/gopeto22s-projects/welcome-mental-health-app

## Step 2: Navigate to Settings
Click: **Settings** → **Environment Variables**

## Step 3: Update These 3 Variables

### Variable 1: VITE_REASONING_SERVICE_URL
- **Current value**: (demo mode or localhost)
- **New value**: `http://13.40.70.207`
- **Environments**: ✅ Production ✅ Preview ✅ Development

### Variable 2: VITE_SPEECH_SERVICE_URL
- **Current value**: (demo mode or localhost)
- **New value**: `http://13.40.70.207`
- **Environments**: ✅ Production ✅ Preview ✅ Development

### Variable 3: VITE_DEMO_MODE
- **Current value**: `true`
- **New value**: `false`
- **Environments**: ✅ Production ✅ Preview ✅ Development

## Step 4: Save Changes
Click **"Save"** for each variable

## Step 5: Redeploy
1. Go to **Deployments** tab
2. Find latest deployment
3. Click **"..."** → **"Redeploy"**
4. ⏱️ Wait 2-3 minutes

## Step 6: Test
🔗 https://welcome-mental-health-app-git-main-gopeto22s-projects.vercel.app/mobile

### Test Checklist:
- [ ] Open browser console (F12)
- [ ] Set SUDS to 7
- [ ] Click "Let's Start"
- [ ] Type message: "I feel anxious"
- [ ] Submit
- [ ] ✅ Check console shows: `POST http://13.40.70.207/respond`
- [ ] ✅ Verify real AI response (not demo)
- [ ] ✅ No CORS errors
- [ ] ✅ Response < 10 seconds

## Success Indicators:
✅ Network tab shows requests to `13.40.70.207`  
✅ Responses contain real AI-generated text  
✅ Audio exercises work  
✅ No console errors  

## If Issues:
1. Check browser console for errors
2. Verify EC2 backend still healthy: `curl http://13.40.70.207/health`
3. Check Vercel build logs for environment variable issues
4. Ensure no typos in URLs (no trailing slashes!)

---

**Backend URL**: http://13.40.70.207  
**Frontend URL**: https://welcome-mental-health-app-git-main-gopeto22s-projects.vercel.app
