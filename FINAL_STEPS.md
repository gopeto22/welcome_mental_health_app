# ✅ FINAL DEPLOYMENT STEPS

## Status: API Proxies Deployed to GitHub ✅

Your code is now on GitHub and Vercel will auto-deploy!

---

## Step 1: Wait for Vercel Auto-Deploy (2-3 minutes)

Vercel detected your GitHub push and is building now.

Check: https://vercel.com/gopeto22s-projects/welcome-mental-health-app/deployments

Look for:
- **Building** → **Ready** status
- Latest commit: "Add Vercel API proxies to fix mixed content error"

---

## Step 2: Update Vercel Environment Variables

🔗 https://vercel.com/gopeto22s-projects/welcome-mental-health-app/settings/environment-variables

### Change These 3 Variables:

#### 1. VITE_REASONING_SERVICE_URL
**OLD**: `http://13.40.70.207`  
**NEW**: `https://welcome-mental-health-app.vercel.app/api`

#### 2. VITE_SPEECH_SERVICE_URL
**OLD**: `http://13.40.70.207`  
**NEW**: `https://welcome-mental-health-app.vercel.app/api`

#### 3. VITE_DEMO_MODE
**OLD**: `true` (or not set)  
**NEW**: `false`

**Important**:
- ✅ Use `https://` (not `http://`)
- ✅ End with `/api` (no trailing slash)
- ✅ Apply to all 3 environments: Production, Preview, Development

---

## Step 3: Redeploy After Env Var Update

After changing environment variables:

1. Go to **Deployments** tab
2. Find the latest deployment (the one that just finished)
3. Click **"..."** menu → **"Redeploy"**
4. ⏱️ Wait 2-3 minutes

**Why?** Environment variables only apply to NEW deployments, not existing ones.

---

## Step 4: Test Your App! 🎉

🔗 https://welcome-mental-health-app.vercel.app/mobile

### Test Checklist:

1. **Open the app**
2. **Open browser console** (F12 or Cmd+Option+I)
3. **Set SUDS level** to 7
4. **Click "Let's Start"**
5. **Type message**: "I feel very anxious today"
6. **Click Submit**

### ✅ Success Indicators:

**Console should show**:
```
✅ [Analytics] session_started
✅ Network requests to: https://welcome-mental-health-app.vercel.app/api/respond
✅ Real AI response (not demo message)
✅ NO "blocked" errors
✅ NO "mixed content" errors
✅ NO CORS errors
```

**UI should show**:
```
✅ Your message appears
✅ AI response appears (real, contextual)
✅ No error messages
✅ Response time < 10 seconds
```

---

## Step 5: Test Additional Features

### Test Speech-to-Text:
1. Click microphone icon
2. Speak: "I am feeling stressed"
3. Stop recording
4. ✅ Text should appear

### Test Text-to-Speech:
1. Click speaker icon on AI response
2. ✅ Audio should play

### Test Language Toggle:
1. Switch to Tamil
2. ✅ UI updates to Tamil
3. ✅ AI responds in Tamil

---

## Troubleshooting

### If you still see "blocked" errors:

**Problem**: Old environment variables still in use

**Solution**:
1. Verify you updated ALL 3 variables
2. Verify you redeployed AFTER updating
3. Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### If you see "404 Not Found" for /api/respond:

**Problem**: Vercel hasn't recognized the API routes yet

**Solution**:
1. Check deployment logs for errors
2. Verify `frontend/api/*.ts` files are in the repo
3. Wait another 2-3 minutes for full deployment

### If health checks fail:

**Problem**: EC2 backend might be down

**Solution**:
```bash
# Check EC2 is still running
curl http://13.40.70.207/health

# If no response, SSH to EC2 and restart
ssh -i ~/.ssh/tamil-mind-mate-key.pem ubuntu@13.40.70.207
cd deploy-package
sudo docker-compose ps
sudo docker-compose restart
```

---

## Architecture After Fix

```
┌─────────────────┐
│   Browser       │
│   (HTTPS)       │
└────────┬────────┘
         │ HTTPS ✅
         ↓
┌─────────────────┐
│  Vercel App     │
│  (Frontend)     │
└────────┬────────┘
         │ HTTPS ✅
         ↓
┌─────────────────┐
│  Vercel API     │
│  Proxy Routes   │ ← New! Solves mixed content
└────────┬────────┘
         │ HTTP (server-to-server, allowed)
         ↓
┌─────────────────┐
│  EC2 Backend    │
│  13.40.70.207   │
│  - Reasoning    │
│  - Speech       │
│  - Nginx        │
└─────────────────┘
```

**Before**: Browser → EC2 (❌ Mixed content error)  
**After**: Browser → Vercel API → EC2 (✅ All HTTPS to browser)

---

## Cost Summary

### Current Costs: $0/month 🎉

- **Vercel**: Free tier (includes API routes, unlimited)
- **EC2**: $7.50/month (20 months free with $150 credits)
- **Total**: Effectively free for ~20 months

### Set Billing Alert:
https://console.aws.amazon.com/billing/
- Create budget alert at $20/month
- Add email notification

---

## 🎉 Deployment Complete Checklist

- [x] EC2 backend deployed and healthy
- [x] API proxy routes created
- [x] Code committed and pushed to GitHub
- [x] Vercel auto-deployed from GitHub
- [ ] Environment variables updated in Vercel
- [ ] Redeployed after env var update
- [ ] End-to-end testing completed
- [ ] No mixed content errors
- [ ] Real AI responses working

---

## Next: Update Vercel Environment Variables Now!

Go to: https://vercel.com/gopeto22s-projects/welcome-mental-health-app/settings/environment-variables

Update the 3 variables listed above, then redeploy!

**You're almost done!** 🚀
