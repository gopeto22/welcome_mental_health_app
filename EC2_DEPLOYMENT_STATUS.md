# EC2 Deployment - In Progress

## ✅ What We've Done

### 1. Fixed SSH Key ✅
- Renamed: `tamil-mind-mate-key.pem.pem` → `tamil-mind-mate-key.pem`
- Moved to: `~/.ssh/`
- Set permissions: `chmod 400`

### 2. Created .env File ✅
- Groq API Key: Configured
- Environment: Production
- Location: `/Users/Joro/Downloads/tamil-mind-mate-main/.env`

### 3. Prepared Deployment Package ✅
- Created: `deploy-package.tar.gz` (71 MB)
- Includes:
  - Docker configuration files
  - Backend services (reasoning + speech)
  - Protocol definitions
  - Google Cloud credentials
  - Deployment script

### 4. Uploaded to EC2 ✅
- Instance: `i-0f7b53d5f4c2a86a6`
- Public IP: **13.40.70.207**
- Region: EU West 2 (London)
- Upload: Successful (3 seconds at 19.2 MB/s)

### 5. Deployment Started ✅
- Status: **IN PROGRESS** 🔄
- Current Step: Installing Docker and Docker Compose
- Expected Duration: 5-10 minutes
- Script: `deploy-ec2.sh`

---

## 🔄 Deployment Progress

The script is currently:
1. ✅ Installing Docker
2. 🔄 Installing Docker Compose
3. ⏳ Building Docker images
4. ⏳ Starting services
5. ⏳ Running health checks

**Estimated completion:** ~5-10 minutes from now

---

## 📋 Your EC2 Instance Details

```
Instance ID:     i-0f7b53d5f4c2a86a6
Public IP:       13.40.70.207
Public DNS:      ec2-13-40-70-207.eu-west-2.compute.amazonaws.com
Instance Type:   t3.micro (2 vCPUs, 1 GB RAM)
Region:          EU West 2 (London)
AMI:             Ubuntu 22.04 LTS
Storage:         20 GB
Status:          Running ✅
```

---

## 🌐 Your Backend URLs (once deployment completes)

```
Health Check:   http://13.40.70.207/health
Respond API:    http://13.40.70.207/respond
Speech-to-Text: http://13.40.70.207/stt
Text-to-Speech: http://13.40.70.207/tts
```

---

## 📝 Next Steps (after deployment completes)

### 1. Test Backend
```bash
# Test health endpoint
curl http://13.40.70.207/health

# Expected: {"status": "healthy", ...}
```

### 2. Update Vercel
Go to: https://vercel.com/gopeto22s-projects/welcome-mental-health-app

**Settings → Environment Variables:**
```
VITE_REASONING_SERVICE_URL = http://13.40.70.207
VITE_SPEECH_SERVICE_URL = http://13.40.70.207
VITE_DEMO_MODE = false
```

**Then:** Deployments → Redeploy

### 3. Test Vercel Frontend
Open: https://welcome-mental-health-app-git-main-gopeto22s-projects.vercel.app/mobile

Test with: "I had a nightmare last night"

Should get: Real AI response (not demo)

---

## 💰 Cost Tracking

**Your Instance Cost:**
- **t3.micro:** $0.0104/hour = $7.50/month
- **Storage:** 20 GB = $2/month
- **Data transfer:** ~$1/month
- **Total:** ~$10.50/month

**With $150 Credits:**
- Duration: **14-20 months FREE** 🎉
- Monthly burn: ~$10.50
- Credits remaining after 1 month: ~$139.50

---

## 🔧 Management Commands

### View Logs (after deployment)
```bash
ssh -i ~/.ssh/tamil-mind-mate-key.pem ubuntu@13.40.70.207
sudo docker-compose logs -f
```

### Restart Services
```bash
ssh -i ~/.ssh/tamil-mind-mate-key.pem ubuntu@13.40.70.207
cd deploy-package
sudo docker-compose restart
```

### Check Status
```bash
ssh -i ~/.ssh/tamil-mind-mate-key.pem ubuntu@13.40.70.207
cd deploy-package
sudo docker-compose ps
```

---

## 🆘 If Deployment Fails

### Check Logs
```bash
ssh -i ~/.ssh/tamil-mind-mate-key.pem ubuntu@13.40.70.207
cd deploy-package
sudo docker-compose logs
```

### Common Issues

**1. Port Already in Use**
```bash
sudo docker-compose down
sudo docker-compose up -d
```

**2. Out of Memory**
- Might need to upgrade to t3.small (2 GB RAM)
- Still only $15/month = 10 months with credits

**3. Build Errors**
```bash
sudo docker-compose build --no-cache
sudo docker-compose up -d
```

---

## ✅ Deployment Checklist

- [x] SSH key configured
- [x] .env file created with Groq API key
- [x] GCP credentials included
- [x] Deployment package created (71 MB)
- [x] Package uploaded to EC2
- [x] Deployment script started
- [ ] Docker installation complete
- [ ] Images built successfully
- [ ] Services running and healthy
- [ ] Health endpoint responding
- [ ] Vercel updated
- [ ] End-to-end test passed

---

## 📞 Support

**Stuck? Check:**
1. Terminal output for error messages
2. Docker logs: `sudo docker-compose logs`
3. Instance status in AWS Console
4. Security group allows ports 80, 8002, 8003

---

**Monitoring deployment... Expected completion in ~5-10 minutes** ⏱️
