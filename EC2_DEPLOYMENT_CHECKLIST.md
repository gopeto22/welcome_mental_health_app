# AWS EC2 Deployment - Quick Checklist

## ✅ Ready to Deploy

I've created everything you need to deploy your backend to AWS EC2!

---

## 📦 What's Been Created

✅ **Dockerfile.reasoning** - Docker container for reasoning service  
✅ **Dockerfile.speech** - Docker container for speech service  
✅ **docker-compose.yml** - Orchestrates all services + nginx  
✅ **nginx.conf** - Reverse proxy with CORS configured  
✅ **deploy-ec2.sh** - One-command deployment script  
✅ **AWS_EC2_DEPLOYMENT.md** - Complete step-by-step guide  
✅ **.dockerignore** - Optimizes Docker builds  

---

## 🚀 Deployment Steps (45 minutes total)

### Step 1: Launch EC2 Instance (15 min)
- [ ] Go to AWS Console: https://console.aws.amazon.com/ec2/
- [ ] Click **"Launch Instance"**
- [ ] Name: `tamil-mind-mate-backend`
- [ ] AMI: **Ubuntu Server 22.04 LTS**
- [ ] Instance type: **t3.micro** (1 GB RAM)
- [ ] Create key pair: `tamil-mind-mate-key.pem`
- [ ] **Save the .pem file!**
- [ ] Security group: Allow ports 22, 80, 8002, 8003
- [ ] Storage: **20 GB**
- [ ] Click **"Launch instance"**
- [ ] Note the **Public IP address**

### Step 2: Prepare Files (5 min)
```bash
cd /Users/Joro/Downloads/tamil-mind-mate-main

# Move SSH key
mkdir -p ~/.ssh
mv ~/Downloads/tamil-mind-mate-key.pem ~/.ssh/
chmod 400 ~/.ssh/tamil-mind-mate-key.pem

# Create deployment package
mkdir -p deploy-package
cp .env docker-compose.yml Dockerfile.* nginx.conf deploy-ec2.sh deploy-package/
cp -r services protocols deploy-package/
[ -f config/gcp-credentials.json ] && mkdir -p deploy-package/config && cp config/gcp-credentials.json deploy-package/config/
tar -czf deploy-package.tar.gz deploy-package/
```

### Step 3: Upload to EC2 (5 min)
```bash
# Replace with YOUR EC2 IP
export EC2_IP="3.83.123.456"

# Upload package
scp -i ~/.ssh/tamil-mind-mate-key.pem \
    deploy-package.tar.gz \
    ubuntu@$EC2_IP:~/
```

### Step 4: Deploy on EC2 (10 min)
```bash
# SSH into EC2
ssh -i ~/.ssh/tamil-mind-mate-key.pem ubuntu@$EC2_IP

# Extract and deploy
tar -xzf deploy-package.tar.gz
cd deploy-package
chmod +x deploy-ec2.sh
sudo ./deploy-ec2.sh

# Note the backend URL displayed
# Exit SSH
exit
```

### Step 5: Update Vercel (5 min)
- [ ] Go to: https://vercel.com/gopeto22s-projects
- [ ] Select: **welcome-mental-health-app**
- [ ] Click: **Settings** → **Environment Variables**
- [ ] Update:
  ```
  VITE_REASONING_SERVICE_URL = http://YOUR_EC2_IP
  VITE_SPEECH_SERVICE_URL = http://YOUR_EC2_IP
  VITE_DEMO_MODE = false
  ```
- [ ] Click: **Deployments** → **...** → **Redeploy**

### Step 6: Test (5 min)
```bash
# Test backend
curl http://YOUR_EC2_IP/health

# Test Vercel frontend
# Open: https://welcome-mental-health-app-git-main-gopeto22s-projects.vercel.app/mobile
# Try: "I had a nightmare"
# Verify: Real AI response (not demo)
```

---

## 💰 Cost & Credits

**Instance Cost:**
- **t3.micro:** $0.0104/hour = **$7.50/month**
- **Your $150 credits:** **20 months free!** 🎉

**Additional Costs:**
- Storage (20 GB): ~$2/month
- Data transfer: ~$1/month (for your usage)
- **Total:** ~$10.50/month = **14 months with credits**

---

## 🎯 What You Get

✅ **Backend running 24/7** - No need to keep your Mac on  
✅ **Persistent URL** - Share one URL with all clinicians  
✅ **Professional setup** - Nginx, Docker, health checks  
✅ **Auto-restart** - Services restart if they crash  
✅ **Easy updates** - Upload new code and redeploy  
✅ **Cost-effective** - 14-20 months free with credits  

---

## 📝 Management Commands

### View Logs
```bash
ssh -i ~/.ssh/tamil-mind-mate-key.pem ubuntu@$EC2_IP
sudo docker-compose logs -f
```

### Restart Services
```bash
ssh -i ~/.ssh/tamil-mind-mate-key.pem ubuntu@$EC2_IP
sudo docker-compose restart
```

### Update Code
```bash
# On Mac: create new package
cd /Users/Joro/Downloads/tamil-mind-mate-main
tar -czf deploy-package.tar.gz deploy-package/

# Upload
scp -i ~/.ssh/tamil-mind-mate-key.pem deploy-package.tar.gz ubuntu@$EC2_IP:~/

# Deploy
ssh -i ~/.ssh/tamil-mind-mate-key.pem ubuntu@$EC2_IP
cd deploy-package && sudo ./deploy-ec2.sh
```

---

## 🆘 Troubleshooting

### Can't SSH into EC2
```bash
# Check key permissions
chmod 400 ~/.ssh/tamil-mind-mate-key.pem

# Check security group allows SSH from your IP
# AWS Console → EC2 → Security Groups → Edit inbound rules
```

### Services won't start
```bash
# SSH into EC2
ssh -i ~/.ssh/tamil-mind-mate-key.pem ubuntu@$EC2_IP

# Check logs
sudo docker-compose logs

# Verify .env has Groq key
cat .env | grep GROQ_API_KEY

# Rebuild
sudo docker-compose down
sudo docker-compose build --no-cache
sudo docker-compose up -d
```

### Vercel can't connect to EC2
```bash
# Check security group allows port 80 from anywhere
# Test from your Mac:
curl http://YOUR_EC2_IP/health

# Check nginx CORS
sudo docker-compose logs nginx
```

---

## 📚 Complete Documentation

**Detailed guide:** `AWS_EC2_DEPLOYMENT.md`  
**Deployment script:** `deploy-ec2.sh`  
**Docker config:** `docker-compose.yml`  

---

## 🎉 Ready to Deploy?

**Follow the checklist above** or read the full guide in `AWS_EC2_DEPLOYMENT.md`.

**Estimated time:** 45 minutes  
**Result:** Professional backend running 24/7 on AWS

**Questions?** Just ask - I'm here to help! 🚀
