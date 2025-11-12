# Mixed Content Fix - Using Vercel API Routes

## Problem
HTTPS pages (Vercel) cannot call HTTP backends (EC2) - browsers block "mixed content"

## Solution
Use Vercel serverless functions as HTTPS proxy to HTTP backend

## What Changed

### Created Vercel API Routes (frontend/api/):
- `/api/health.ts` - Health check proxy
- `/api/respond.ts` - Reasoning API proxy
- `/api/stt.ts` - Speech-to-text proxy  
- `/api/tts.ts` - Text-to-speech proxy

These functions run on Vercel's servers and proxy requests to EC2 backend.

### Updated Environment Variables

**OLD (doesn't work - mixed content)**:
```
VITE_REASONING_SERVICE_URL=http://13.40.70.207
VITE_SPEECH_SERVICE_URL=http://13.40.70.207
```

**NEW (works - all HTTPS)**:
```
VITE_REASONING_SERVICE_URL=https://welcome-mental-health-app.vercel.app/api
VITE_SPEECH_SERVICE_URL=https://welcome-mental-health-app.vercel.app/api
VITE_DEMO_MODE=false
```

## Request Flow

**Before**:
```
Browser (HTTPS) ❌ → EC2 (HTTP) - BLOCKED
```

**After**:
```
Browser (HTTPS) ✅ → Vercel API (HTTPS) ✅ → EC2 (HTTP) ✅
```

## Next Steps

1. Commit and push API routes to GitHub
2. Update Vercel environment variables (see above)
3. Redeploy Vercel
4. Test app - should work now!

## Alternative: Enable HTTPS on EC2 (Future)

For better performance, you can add HTTPS to EC2:
1. Get a free domain (Freenom, etc.) or use AWS domain
2. Point domain to EC2 IP
3. Install Let's Encrypt SSL certificate
4. Update nginx to serve HTTPS

This removes the proxy layer and gives better performance.
