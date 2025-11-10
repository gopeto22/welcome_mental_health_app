# Streamlit App Deployment Options

You have **3 deployment options** for the Streamlit demo app. Choose based on your needs:

## ✅ Option 1: Local Development (RECOMMENDED - Already Working!)

**Status**: ✅ **Currently running on your machine**

This is the simplest option and what you're using right now:

```bash
cd streamlit-demo
source venv/bin/activate
streamlit run app.py
```

**Access**: http://localhost:8501

**Pros**:
- ✅ Already working
- ✅ Fastest to start/restart
- ✅ Easy to modify code and see changes
- ✅ No Docker required

**Cons**:
- ❌ Only accessible from your computer
- ❌ Requires Python environment

**Best for**: Local testing and development

---

## 🌐 Option 2: Local Network Access (For Clinician Testing)

Share your **currently running** Streamlit app with others on your network:

### Quick Steps:

1. **Find your local IP**:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   # Look for something like: 192.168.1.100 or 10.97.97.57
   ```

2. **Stop current Streamlit** (Ctrl+C or find process):
   ```bash
   # Find the process
   lsof -i :8501
   # Kill it
   kill <PID>
   ```

3. **Restart with network access**:
   ```bash
   cd streamlit-demo
   source venv/bin/activate
   streamlit run app.py --server.address=0.0.0.0
   ```

4. **Share the URL** with clinicians:
   ```
   http://YOUR_LOCAL_IP:8501
   # Example: http://10.97.97.57:8501
   ```

**Pros**:
- ✅ Same simple setup
- ✅ Clinicians can test from their devices
- ✅ No Docker needed
- ✅ Still easy to modify code

**Cons**:
- ❌ Only works on same WiFi network
- ❌ Computer must stay on
- ❌ No persistent deployment

**Best for**: Clinician testing sessions on same network

---

## 🐳 Option 3: Docker Deployment (For Production)

Deploy in Docker containers for a more production-ready setup.

### Prerequisites:

1. **Install Docker Desktop**:
   - Download from: https://docs.docker.com/desktop/install/mac-install/
   - Start Docker Desktop app

2. **Verify installation**:
   ```bash
   docker --version
   docker ps  # Should show running containers
   ```

### Three Docker Approaches:

#### 3A. Streamlit Only (Use existing local services)

```bash
./deploy-streamlit-only.sh
```

This deploys **only** the Streamlit app in Docker while using your local backend services.

**Pros**:
- ✅ Isolated Streamlit environment
- ✅ Uses existing backend services
- ✅ Easy to restart

**Cons**:
- ❌ Still requires local services running
- ❌ More complex than Option 1

#### 3B. All Services (Recommended for production)

```bash
./deploy-simple.sh
```

This deploys **everything** in Docker: Streamlit + Speech + Reasoning services.

**Pros**:
- ✅ Complete isolation
- ✅ Production-ready
- ✅ Easy to deploy anywhere
- ✅ Automatic restart on failure

**Cons**:
- ❌ Requires Docker
- ❌ Takes more resources
- ❌ Slower to see code changes

#### 3C. Docker Compose (If you have Docker Compose v2)

```bash
./deploy-docker.sh
```

Uses docker-compose.yml for orchestration.

**Pros**:
- ✅ Standard deployment method
- ✅ Easy to manage all services
- ✅ Production-ready

**Cons**:
- ❌ Requires Docker Compose plugin
- ❌ Your Docker may not have this installed

---

## 📊 Comparison Table

| Feature | Local Dev | Network Access | Docker |
|---------|-----------|----------------|--------|
| Setup Time | ✅ Instant | ✅ 2 minutes | ⚠️ 10 minutes |
| Code Changes | ✅ Instant | ✅ Instant | ❌ Rebuild needed |
| Network Access | ❌ Localhost only | ✅ Local network | ✅ Anywhere |
| Requires Docker | ❌ No | ❌ No | ✅ Yes |
| Production Ready | ❌ No | ⚠️ Limited | ✅ Yes |
| Resource Usage | ✅ Low | ✅ Low | ⚠️ Medium |

---

## 🎯 Recommendations

### For Right Now (Today):
**Use Option 1** - Your app is already running! 
- Access: http://localhost:8501
- Test locally, modify code easily

### For Clinician Testing (This Week):
**Use Option 2** - Network access
```bash
streamlit run app.py --server.address=0.0.0.0
# Share: http://YOUR_IP:8501
```

### For Production Deployment (Later):
**Use Option 3B** - Full Docker deployment
```bash
# First, install Docker Desktop
# Then:
./deploy-simple.sh
```

---

## 🐛 Troubleshooting

### Docker Says "Not Running"

1. **Install Docker Desktop**: https://www.docker.com/products/docker-desktop/
2. **Start Docker Desktop app** from Applications
3. **Wait for whale icon** to be stable in menu bar
4. **Test**: `docker ps` should work

### Port Already in Use

```bash
# Find what's using port 8501
lsof -i :8501

# Kill it
kill <PID>

# Or use different port
streamlit run app.py --server.port=8502
```

### Can't Access from Other Devices

1. **Check firewall**: Allow port 8501
2. **Check WiFi**: Same network as clinician devices
3. **Test locally first**: http://localhost:8501 works?
4. **Try IP**: http://YOUR_IP:8501

### Backend Services Not Running

```bash
# Start services
cd services/reasoning-service && ./start.sh &
cd services/speech-service && ./start.sh &

# Check health
curl http://localhost:8002/health
curl http://localhost:8003/health
```

---

## 📝 Summary

**You're already deployed locally! (Option 1)** ✅

**Next steps:**
1. ✅ Test locally: http://localhost:8501
2. ✅ If satisfied, share on network (Option 2)
3. ✅ Later, deploy to production with Docker (Option 3)

**Current status**: Your Streamlit app is running and accessible at http://localhost:8501

No Docker needed for initial testing!
