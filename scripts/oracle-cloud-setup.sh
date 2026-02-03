#!/bin/bash

# Oracle Cloud Free Tier - Automated Setup Script
# This script sets up EduGenie AI on Oracle Cloud's always-free tier

set -e

echo "========================================="
echo "EduGenie AI - Oracle Cloud Setup"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run as root${NC}"
   exit 1
fi

echo -e "${GREEN}Step 1: Updating system...${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "${GREEN}Step 2: Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${YELLOW}Docker installed. You may need to log out and back in.${NC}"
else
    echo "Docker already installed"
fi

echo -e "${GREEN}Step 3: Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    sudo apt install docker-compose -y
else
    echo "Docker Compose already installed"
fi

echo -e "${GREEN}Step 4: Installing Git...${NC}"
if ! command -v git &> /dev/null; then
    sudo apt install git -y
else
    echo "Git already installed"
fi

echo -e "${GREEN}Step 5: Configuring firewall...${NC}"
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8000/tcp
echo "y" | sudo ufw enable || true

echo -e "${GREEN}Step 6: Cloning repository...${NC}"
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/EduGenie-AI.git): " REPO_URL

if [ -d "EduGenie-AI" ]; then
    echo -e "${YELLOW}Directory exists. Pulling latest changes...${NC}"
    cd EduGenie-AI
    git pull
else
    git clone $REPO_URL
    cd EduGenie-AI
fi

echo -e "${GREEN}Step 7: Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env file and add your API keys:${NC}"
    echo "nano .env"
    echo ""
    echo "Press Enter when ready to continue..."
    read
    nano .env
else
    echo ".env file already exists"
fi

echo -e "${GREEN}Step 8: Starting services...${NC}"
docker-compose up -d

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Installation Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "Your app is now running at:"
echo -e "${GREEN}http://$(curl -s ifconfig.me)${NC}"
echo ""
echo -e "ChromaDB is running at:"
echo -e "${GREEN}http://$(curl -s ifconfig.me):8000${NC}"
echo ""
echo -e "Useful commands:"
echo -e "  ${YELLOW}docker-compose logs -f${NC}     - View logs"
echo -e "  ${YELLOW}docker-compose restart${NC}     - Restart services"
echo -e "  ${YELLOW}docker-compose down${NC}        - Stop services"
echo -e "  ${YELLOW}docker-compose up -d${NC}       - Start services"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Point your domain to: $(curl -s ifconfig.me)"
echo -e "2. Set up SSL with: sudo certbot --nginx -d yourdomain.com"
echo ""
