#!/bin/bash
# AWS EC2 Deployment Script for Tamil Mind Mate Backend
# This script sets up Docker, deploys services, and configures everything

set -e

echo "🚀 Tamil Mind Mate - AWS EC2 Backend Deployment"
echo "================================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if running on Ubuntu/Amazon Linux
if ! command -v apt-get &> /dev/null && ! command -v yum &> /dev/null; then
    print_error "This script requires Ubuntu or Amazon Linux"
    exit 1
fi

print_info "Step 1: Installing Docker and Docker Compose..."

# Install Docker
if ! command -v docker &> /dev/null; then
    if command -v apt-get &> /dev/null; then
        # Ubuntu
        sudo apt-get update
        sudo apt-get install -y ca-certificates curl gnupg
        sudo install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        sudo chmod a+r /etc/apt/keyrings/docker.gpg
        echo \
          "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
          "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
          sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    else
        # Amazon Linux
        sudo yum update -y
        sudo yum install -y docker
        sudo service docker start
        sudo usermod -a -G docker ec2-user
    fi
    print_success "Docker installed"
else
    print_success "Docker already installed"
fi

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose (standalone)
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed"
else
    print_success "Docker Compose already installed"
fi

print_info "Step 2: Checking required files..."

# Check for required files
REQUIRED_FILES=(".env" "docker-compose.yml" "Dockerfile.reasoning" "Dockerfile.speech" "nginx.conf")
MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    print_error "Missing required files:"
    for file in "${MISSING_FILES[@]}"; do
        echo "  - $file"
    done
    echo ""
    echo "Please ensure all files are uploaded to this directory."
    exit 1
fi

print_success "All required files present"

print_info "Step 3: Checking environment variables..."

# Check .env file
if ! grep -q "GROQ_API_KEY" .env || [ -z "$(grep GROQ_API_KEY .env | cut -d '=' -f2)" ]; then
    print_error "GROQ_API_KEY not found in .env file"
    echo ""
    echo "Please add your Groq API key to .env:"
    echo "  GROQ_API_KEY=your_actual_key_here"
    exit 1
fi

print_success "Environment variables configured"

print_info "Step 4: Checking Google Cloud credentials (optional)..."

if [ ! -f "config/gcp-credentials.json" ]; then
    print_info "No Google Cloud credentials found - TTS will be limited"
    echo "  To enable Google TTS, upload gcp-credentials.json to config/"
else
    print_success "Google Cloud credentials found"
fi

print_info "Step 5: Building Docker images..."

# Build images
sudo docker-compose build --no-cache

print_success "Docker images built"

print_info "Step 6: Starting services..."

# Stop any existing containers
sudo docker-compose down

# Start services
sudo docker-compose up -d

print_success "Services started"

print_info "Step 7: Waiting for services to be healthy..."

# Wait for services to be ready
sleep 10

# Check health
MAX_RETRIES=12
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost/health > /dev/null 2>&1; then
        print_success "Services are healthy!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Waiting for services... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 5
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    print_error "Services failed to start properly"
    echo ""
    echo "Check logs:"
    echo "  sudo docker-compose logs reasoning-service"
    echo "  sudo docker-compose logs speech-service"
    exit 1
fi

# Get public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo "UNKNOWN")

echo ""
echo "================================================"
print_success "Deployment Complete!"
echo "================================================"
echo ""
echo "📊 Service Status:"
sudo docker-compose ps
echo ""
echo "🌐 Your Backend URL:"
echo "   http://$PUBLIC_IP"
echo ""
echo "🔗 API Endpoints:"
echo "   Health:    http://$PUBLIC_IP/health"
echo "   Respond:   http://$PUBLIC_IP/respond"
echo "   STT:       http://$PUBLIC_IP/stt"
echo "   TTS:       http://$PUBLIC_IP/tts"
echo ""
echo "📝 Next Steps:"
echo "   1. Test health endpoint:"
echo "      curl http://$PUBLIC_IP/health"
echo ""
echo "   2. Update Vercel environment variables:"
echo "      VITE_REASONING_SERVICE_URL=http://$PUBLIC_IP"
echo "      VITE_SPEECH_SERVICE_URL=http://$PUBLIC_IP"
echo "      VITE_DEMO_MODE=false"
echo ""
echo "   3. Redeploy Vercel frontend"
echo ""
echo "🔧 Useful Commands:"
echo "   View logs:       sudo docker-compose logs -f"
echo "   Restart:         sudo docker-compose restart"
echo "   Stop:            sudo docker-compose down"
echo "   Update & Restart: ./deploy-ec2.sh"
echo ""
echo "💰 Cost Estimate:"
echo "   t3.micro (1GB RAM): ~$0.0104/hour = ~$7.50/month"
echo "   t3.small (2GB RAM): ~$0.0208/hour = ~$15/month"
echo "   With $150 credits: 10-20 months free!"
echo ""
print_success "Backend is now live and ready for clinicians! 🎉"
