# 🎉 EC2 Deployment Complete!

**Status**: ✅ **LIVE AND HEALTHY**

## Deployment Details

### EC2 Instance
- **Instance ID**: i-0f7b53d5f4c2a86a6
- **Public IP**: 13.40.70.207
- **DNS**: ec2-13-40-70-207.eu-west-2.compute.amazonaws.com
- **Region**: EU West 2 (London)
- **Type**: t3.micro (2 vCPUs, 1 GB RAM)
- **OS**: Ubuntu 22.04 LTS
- **Cost**: $7.50/month (~20 months free with $150 credits)

### Backend Services Status
All services are **running and healthy**:

1. **Reasoning Service** ✅
   - Port: 8003
   - Status: Healthy
   - API: Groq Llama-3.3-70B
   
2. **Speech Service** ✅
   - Port: 8002
   - Status: Healthy
   - APIs: Groq Whisper + Google TTS

3. **Nginx Proxy** ✅
   - Port: 80 (HTTP)
   - Status: Running
   - CORS: Configured for Vercel

### Backend URL
```
http://13.40.70.207
```

### API Endpoints
- `GET  /health` - Health check (returns: `{"status":"ok","service":"reasoning"}`)
- `POST /respond` - AI reasoning (Groq Llama-3.3-70B)
- `POST /stt` - Speech-to-text (Groq Whisper)
- `POST /tts` - Text-to-speech (Google Cloud TTS)

---

## Next Steps: Connect Vercel Frontend

### 1. Update Vercel Environment Variables

Go to: https://vercel.com/gopeto22s-projects/welcome-mental-health-app

Navigate: **Settings → Environment Variables**

Update these 3 variables:

| Variable Name | New Value | 
|--------------|-----------|
| `VITE_REASONING_SERVICE_URL` | `http://13.40.70.207` |
| `VITE_SPEECH_SERVICE_URL` | `http://13.40.70.207` |
| `VITE_DEMO_MODE` | `false` |

**Important**: 
- Use `http://` (not `https://`)
- No trailing slash
- Set all 3 environments: Production, Preview, Development

### 2. Redeploy Vercel

After updating environment variables:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **"..."** menu → **"Redeploy"**
4. Wait 2-3 minutes for build

### 3. Test End-to-End

Open: https://welcome-mental-health-app-git-main-gopeto22s-projects.vercel.app/mobile

Test flow:
1. Open browser console (F12)
2. Set SUDS level to 7
3. Click "Let's Start"
4. Type: "I feel anxious today"
5. Submit

**Expected result**:
- Console shows XHR to `http://13.40.70.207/respond`
- Real AI response (not demo message)
- No CORS errors
- Response time < 10 seconds

---

## Issues Fixed During Deployment

### Issue 1: Incorrect Import Paths ✅
**Error**: `Could not import module 'main'`
**Fix**: Changed Dockerfile CMD from `main:app` to `app.main:app`

### Issue 2: httpx Version Incompatibility ✅
**Error**: `TypeError: Client.__init__() got an unexpected keyword argument 'proxies'`
**Fix**: Downgraded httpx from 0.27.2 to 0.26.0 (Groq 0.11.0 compatibility)

### Issue 3: GCP Credentials Path ✅
**Error**: `File /Users/Joro/Downloads/... was not found`
**Fix**: Updated `.env` to use container path `/app/config/gcp-credentials.json`

### Issue 4: Nginx Configuration ✅
**Error**: `"add_header" directive is not allowed here`
**Fix**: Simplified CORS headers configuration

### Issue 5: Security Group ✅
**Error**: Connection timeout on port 80
**Fix**: Added inbound rule for HTTP (port 80) from 0.0.0.0/0

---

## Management Commands

### SSH Access
```bash
ssh -i ~/.ssh/tamil-mind-mate-key.pem ubuntu@13.40.70.207
```

### Check Services
```bash
cd deploy-package
sudo docker-compose ps
```

### View Logs
```bash
# All services
sudo docker-compose logs --tail=50

# Specific service
sudo docker-compose logs reasoning-service --tail=50
sudo docker-compose logs speech-service --tail=50
sudo docker-compose logs nginx --tail=50
```

### Restart Services
```bash
# All services
sudo docker-compose restart

# Specific service
sudo docker-compose restart reasoning-service
```

### Stop Services
```bash
sudo docker-compose down
```

### Start Services
```bash
sudo docker-compose up -d
```

### Update Code
```bash
# From local machine:
scp -i ~/.ssh/tamil-mind-mate-key.pem <file> ubuntu@13.40.70.207:~/deploy-package/

# On EC2:
cd deploy-package
sudo docker-compose build --no-cache
sudo docker-compose up -d
```

---

## Cost Monitoring

### Current Costs
- **EC2 t3.micro**: $7.50/month
- **Bandwidth**: ~$0.09/GB (first 100GB/month free)
- **EBS Storage**: Included in EC2 cost

### Total: ~$7.50/month = 20 months free with $150 credits

### Set Up Billing Alert
1. Go to: https://console.aws.amazon.com/billing/
2. Navigate: **Budgets → Create budget**
3. Set alert at **$20/month**
4. Add email notification

---

## Security Recommendations

### Current Setup ✅
- SSH key-based authentication (no passwords)
- Security group restricts SSH to your IP
- Nginx rate limiting (10 req/s)
- CORS restricted to Vercel domain
- Environment variables in Docker (not hardcoded)

### Additional Improvements (Optional)
1. **HTTPS**: Add SSL certificate with Let's Encrypt
2. **Domain**: Point custom domain to EC2 IP
3. **Firewall**: Use `ufw` on Ubuntu
4. **Monitoring**: Set up CloudWatch alarms
5. **Backups**: Enable EBS snapshots
6. **Auto-scaling**: Add auto-scaling group (when traffic grows)

---

## Troubleshooting

### Services Not Starting
```bash
sudo docker-compose logs --tail=100
```

### Connection Refused
- Check security group allows port 80
- Verify services are running: `sudo docker-compose ps`

### CORS Errors
- Verify nginx.conf has correct Vercel URL
- Check browser console for specific error

### Out of Memory
- Monitor: `free -h`
- Restart services: `sudo docker-compose restart`
- Consider upgrading to t3.small (2GB RAM) if persistent

### Groq API Errors
- Check API key in `.env`
- Verify rate limits: https://console.groq.com
- Check logs: `sudo docker-compose logs reasoning-service`

---

## Success Metrics

✅ **Deployment**: 3/3 containers healthy  
✅ **API**: Health endpoint responding  
✅ **Security**: Port 80 open, SSH restricted  
✅ **Configuration**: CORS, rate limiting, logging  
✅ **Cost**: Within free tier budget  

**Next**: Update Vercel and test end-to-end!

---

*Deployment completed: November 11, 2025*  
*Backend URL: http://13.40.70.207*  
*Estimated uptime with credits: 20 months*
