# AWS EC2 Deployment Guide - Tamil Mind Mate Backend

## 🎯 Overview

Deploy your backend services to AWS EC2 for **permanent, always-available** hosting.

**Benefits:**
- ✅ **Persistent URL** - No more changing ngrok URLs
- ✅ **24/7 Availability** - Always accessible for clinicians
- ✅ **Professional Setup** - Production-ready with Nginx reverse proxy
- ✅ **Cost-Effective** - $7.50-15/month (10-20 months FREE with your $150 credits)
- ✅ **Easy Management** - One-command deployment and updates

---

## 💰 Cost Breakdown

| Instance Type | RAM | vCPUs | Cost/Hour | Cost/Month | Months with $150 |
|---------------|-----|-------|-----------|------------|------------------|
| **t3.micro** (Recommended) | 1 GB | 2 | $0.0104 | $7.50 | **20 months** |
| **t3.small** | 2 GB | 2 | $0.0208 | $15.00 | **10 months** |
| **t3.medium** | 4 GB | 2 | $0.0416 | $30.00 | **5 months** |

**Recommendation:** Start with `t3.micro` - it's sufficient for your use case and maximizes your credit duration.

---

## 📋 Prerequisites

Before starting, gather:

1. ✅ **AWS Account** with $150 credits
2. ✅ **Groq API Key** (you already have this)
3. ✅ **Google Cloud credentials** (optional, for TTS)
4. ✅ **SSH key pair** (we'll create this)

---

## 🚀 Deployment Steps

### Step 1: Launch EC2 Instance (15 minutes)

#### 1.1 Sign in to AWS Console
- Go to: https://console.aws.amazon.com/
- Navigate to: **EC2 Dashboard**

#### 1.2 Launch Instance
Click **"Launch Instance"** and configure:

**Name:**
```
tamil-mind-mate-backend
```

**Application and OS Images (AMI):**
- Select: **Ubuntu Server 22.04 LTS** (Free tier eligible)
- Architecture: **64-bit (x86)**

**Instance Type:**
- Select: **t3.micro** (1 GB RAM, 2 vCPU)
- ✅ Free tier eligible

**Key Pair (login):**
- Click: **"Create new key pair"**
- Key pair name: `tamil-mind-mate-key`
- Key pair type: **RSA**
- Private key format: **`.pem`** (for Mac/Linux)
- Click: **"Create key pair"**
- ⚠️ **Save the downloaded file** - you'll need it for SSH access

**Network Settings:**
Click **"Edit"** and configure:

- **Auto-assign public IP:** Enabled
- **Firewall (security groups):** Create new security group

**Security group name:**
```
tamil-mind-mate-backend-sg
```

**Security group rules:**

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | My IP | SSH access |
| HTTP | TCP | 80 | Anywhere (0.0.0.0/0) | API access |
| Custom TCP | TCP | 8002 | Anywhere (0.0.0.0/0) | Speech Service (optional) |
| Custom TCP | TCP | 8003 | Anywhere (0.0.0.0/0) | Reasoning Service (optional) |

⚠️ **Important:** For production, change "My IP" to your actual IP address for SSH.

**Configure Storage:**
- Size: **20 GB** (enough for Docker images and logs)
- Volume type: **gp3** (General Purpose SSD)

**Advanced Details:**
- Leave as default

#### 1.3 Launch
- Click **"Launch instance"**
- Wait ~2 minutes for instance to start
- Note the **Public IPv4 address** (e.g., `3.83.123.456`)

---

### Step 2: Prepare Local Files (5 minutes)

#### 2.1 Move SSH Key
```bash
# Move the downloaded key to a secure location
mkdir -p ~/.ssh
mv ~/Downloads/tamil-mind-mate-key.pem ~/.ssh/
chmod 400 ~/.ssh/tamil-mind-mate-key.pem
```

#### 2.2 Create Deployment Package
```bash
cd /Users/Joro/Downloads/tamil-mind-mate-main

# Create a clean deployment directory
mkdir -p deploy-package
cd deploy-package

# Copy necessary files
cp ../.env .
cp ../docker-compose.yml .
cp ../Dockerfile.reasoning .
cp ../Dockerfile.speech .
cp ../nginx.conf .
cp ../deploy-ec2.sh .

# Copy services
cp -r ../services .

# Copy protocols
cp -r ../protocols .

# Copy config (GCP credentials if you have them)
mkdir -p config
if [ -f ../config/gcp-credentials.json ]; then
    cp ../config/gcp-credentials.json config/
fi

# Create logs directory
mkdir -p logs

# Create tarball
cd ..
tar -czf deploy-package.tar.gz deploy-package/

echo "✅ Deployment package created: deploy-package.tar.gz"
```

#### 2.3 Verify .env File
```bash
# Make sure .env has your Groq API key
cat deploy-package/.env | grep GROQ_API_KEY
```

Should show:
```
GROQ_API_KEY=gsk_...your_actual_key...
```

---

### Step 3: Upload to EC2 (5 minutes)

#### 3.1 Connect to EC2
```bash
# Replace with YOUR public IP from Step 1.3
export EC2_IP="3.83.123.456"

# Test SSH connection
ssh -i ~/.ssh/tamil-mind-mate-key.pem ubuntu@$EC2_IP

# If successful, you'll see Ubuntu welcome message
# Type 'exit' to disconnect for now
```

#### 3.2 Upload Deployment Package
```bash
# Upload the tarball
scp -i ~/.ssh/tamil-mind-mate-key.pem \
    deploy-package.tar.gz \
    ubuntu@$EC2_IP:~/

echo "✅ Files uploaded to EC2"
```

---

### Step 4: Deploy on EC2 (10 minutes)

#### 4.1 SSH into EC2
```bash
ssh -i ~/.ssh/tamil-mind-mate-key.pem ubuntu@$EC2_IP
```

#### 4.2 Extract and Deploy
```bash
# Extract the package
tar -xzf deploy-package.tar.gz
cd deploy-package

# Run the deployment script
chmod +x deploy-ec2.sh
sudo ./deploy-ec2.sh
```

**The script will:**
1. ✅ Install Docker and Docker Compose
2. ✅ Verify all required files
3. ✅ Build Docker images
4. ✅ Start services with Nginx
5. ✅ Display your backend URL

**Expected output:**
```
================================================
✅ Deployment Complete!
================================================

📊 Service Status:
NAME                COMMAND                  SERVICE             STATUS
nginx-proxy         "/docker-entrypoint.…"   nginx               running
reasoning-service   "uvicorn main:app --…"   reasoning-service   running (healthy)
speech-service      "uvicorn main:app --…"   speech-service      running (healthy)

🌐 Your Backend URL:
   http://3.83.123.456

🔗 API Endpoints:
   Health:    http://3.83.123.456/health
   Respond:   http://3.83.123.456/respond
   STT:       http://3.83.123.456/stt
   TTS:       http://3.83.123.456/tts
```

#### 4.3 Test Services
```bash
# Test health endpoint
curl http://localhost/health

# Should return: {"status": "healthy", ...}
```

#### 4.4 Exit SSH
```bash
exit
```

---

### Step 5: Update Vercel Frontend (5 minutes)

#### 5.1 Go to Vercel Dashboard
- URL: https://vercel.com/gopeto22s-projects
- Select: **welcome-mental-health-app**

#### 5.2 Update Environment Variables
- Click: **Settings** → **Environment Variables**
- Update/Add these variables:

```
VITE_REASONING_SERVICE_URL = http://YOUR_EC2_IP
VITE_SPEECH_SERVICE_URL = http://YOUR_EC2_IP
VITE_DEMO_MODE = false
```

⚠️ Replace `YOUR_EC2_IP` with your actual EC2 public IP

**Example:**
```
VITE_REASONING_SERVICE_URL = http://3.83.123.456
VITE_SPEECH_SERVICE_URL = http://3.83.123.456
VITE_DEMO_MODE = false
```

#### 5.3 Redeploy
- Go to: **Deployments** tab
- Click: **...** menu on latest deployment
- Click: **Redeploy**
- Wait: ~2 minutes

---

### Step 6: Test End-to-End (5 minutes)

#### 6.1 Test Backend Directly
```bash
# From your Mac, test the backend
curl -X POST http://YOUR_EC2_IP/respond \
  -H "Content-Type: application/json" \
  -d '{
    "transcript_window": ["I feel anxious"],
    "suds_level": 7
  }'
```

Should return a JSON response with AI-generated reply.

#### 6.2 Test Vercel Frontend
1. Open: https://welcome-mental-health-app-git-main-gopeto22s-projects.vercel.app/mobile
2. Set SUDS to 5
3. Click **"Let's Start"**
4. Type: "I had a nightmare last night"
5. Verify: Real AI response (not demo response)
6. Check console for "Demo mode" message - should be absent

#### 6.3 Test Voice Mode (if GCP credentials configured)
1. Click microphone icon
2. Speak: "I feel worried"
3. Verify: Speech-to-text works
4. Verify: AI responds with voice

---

## 🎉 Success! Your Backend is Live

**What you now have:**
- ✅ Backend running 24/7 on AWS EC2
- ✅ Persistent URL (doesn't change)
- ✅ Professional Nginx reverse proxy
- ✅ CORS configured for Vercel frontend
- ✅ Rate limiting and security headers
- ✅ Health checks and auto-restart
- ✅ Centralized logging

**Share with clinicians:**
```
https://welcome-mental-health-app-git-main-gopeto22s-projects.vercel.app/mobile
```

---

## 🔧 Management Commands

### View Logs
```bash
# SSH into EC2
ssh -i ~/.ssh/tamil-mind-mate-key.pem ubuntu@$EC2_IP

# View all logs
sudo docker-compose logs -f

# View specific service
sudo docker-compose logs -f reasoning-service
sudo docker-compose logs -f speech-service
sudo docker-compose logs -f nginx
```

### Restart Services
```bash
# Restart all services
sudo docker-compose restart

# Restart specific service
sudo docker-compose restart reasoning-service
```

### Update Code
```bash
# On your Mac: prepare new package
cd /Users/Joro/Downloads/tamil-mind-mate-main
tar -czf deploy-package.tar.gz deploy-package/

# Upload to EC2
scp -i ~/.ssh/tamil-mind-mate-key.pem \
    deploy-package.tar.gz \
    ubuntu@$EC2_IP:~/

# SSH and redeploy
ssh -i ~/.ssh/tamil-mind-mate-key.pem ubuntu@$EC2_IP
tar -xzf deploy-package.tar.gz
cd deploy-package
sudo ./deploy-ec2.sh
```

### Check System Resources
```bash
# CPU and memory usage
sudo docker stats

# Disk usage
df -h
```

### Stop Services
```bash
sudo docker-compose down
```

### Start Services
```bash
sudo docker-compose up -d
```

---

## 🔒 Security Recommendations

### 1. Enable HTTPS (Optional but Recommended)

**Option A: Use Cloudflare (Free & Easy)**
1. Sign up: https://cloudflare.com
2. Add your domain (or get a free subdomain)
3. Point DNS to your EC2 IP
4. Enable Cloudflare proxy (orange cloud)
5. Automatic HTTPS enabled!

**Option B: Let's Encrypt (Free but requires domain)**
1. Get a domain name (e.g., from Namecheap)
2. Point domain to EC2 IP
3. Install certbot on EC2
4. Update nginx.conf with SSL

### 2. Restrict SSH Access
```bash
# In AWS Console → EC2 → Security Groups
# Edit inbound rule for SSH (port 22)
# Change Source from "Anywhere" to "My IP"
```

### 3. Enable AWS CloudWatch (Optional)
- Monitor CPU, memory, network usage
- Set up alerts for high usage
- Free tier: 10 metrics

### 4. Create AWS Budget Alert
1. Go to: AWS Billing Dashboard
2. Click: "Budgets"
3. Create budget: $20/month
4. Get email alerts at 80% usage

---

## 💡 Troubleshooting

### Services won't start
```bash
# Check Docker logs
sudo docker-compose logs

# Common issue: .env not loaded
cat .env | grep GROQ_API_KEY

# Rebuild and restart
sudo docker-compose down
sudo docker-compose build --no-cache
sudo docker-compose up -d
```

### Can't connect from Vercel
```bash
# Check security group allows port 80 from anywhere
# Test from your Mac:
curl http://YOUR_EC2_IP/health

# Check nginx logs
sudo docker-compose logs nginx
```

### Out of disk space
```bash
# Clean up Docker
sudo docker system prune -a

# Check disk usage
df -h
```

### High costs (unlikely with $150 credits)
```bash
# Check instance type
# Downgrade from t3.small to t3.micro if needed
```

---

## 📊 Monitoring

### Check Service Health
```bash
# From anywhere
curl http://YOUR_EC2_IP/health

# Should return:
# {"status": "healthy", "services": ["reasoning", "speech"]}
```

### View Real-Time Stats
```bash
# SSH into EC2
ssh -i ~/.ssh/tamil-mind-mate-key.pem ubuntu@$EC2_IP

# Container stats
sudo docker stats

# System resources
htop  # (install with: sudo apt install htop)
```

---

## 🎯 Next Steps After Deployment

1. **Test with clinicians:**
   - Share Vercel URL
   - Conduct first real AI testing session
   - Gather feedback

2. **Monitor usage:**
   - Check AWS billing dashboard weekly
   - Track Groq API usage
   - Monitor EC2 performance

3. **Optional enhancements:**
   - Add HTTPS with Cloudflare
   - Set up AWS CloudWatch alerts
   - Configure automated backups

4. **Documentation:**
   - Share Vercel URL with clinicians
   - Update README with deployment info
   - Document any custom configurations

---

## 📞 Support Resources

**AWS Documentation:**
- EC2 Getting Started: https://docs.aws.amazon.com/ec2/
- Security Groups: https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html

**Docker Documentation:**
- Docker Compose: https://docs.docker.com/compose/

**Billing:**
- AWS Billing Dashboard: https://console.aws.amazon.com/billing/
- Cost Explorer: https://console.aws.amazon.com/cost-management/

---

## 🎉 Summary

**Time to deploy:** ~45 minutes  
**Monthly cost:** $7.50 (t3.micro) = **20 months FREE with your credits**  
**Result:** Professional, always-available backend for clinician testing

**Your architecture:**
```
Internet
    ↓
Vercel Frontend (React Mobile App)
    ↓ HTTPS
AWS EC2 (Ubuntu)
    ├── Nginx (Reverse Proxy + CORS)
    ├── Reasoning Service (Docker)
    ├── Speech Service (Docker)
    └── Auto-restart + Health Checks
    ↓
Groq API (Llama-3.3-70B)
Google Cloud TTS (Tamil voice)
```

**You're ready to share with clinicians! 🚀**
