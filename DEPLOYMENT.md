# Deployment Guide - EduGenie AI

This guide covers deploying EduGenie AI to a VPS using Docker and setting up the vector database.

## Prerequisites

- A VPS with Docker and Docker Compose installed
- A domain name (optional, but recommended)
- Docker Hub account (for storing images, optional)

## Step 1: Understanding ChromaDB

EduGenie AI uses **ChromaDB** for vector storage - a free, open-source vector database that runs locally. No API keys or cloud accounts required!

ChromaDB will automatically start with docker-compose and persist data in a Docker volume.

## Step 2: Configure GitHub Secrets

For CI/CD deployment, add these secrets to your GitHub repository:

1. Go to Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub password or access token

## Step 3: Build and Push Docker Image

### Option A: Using GitHub Actions (Recommended)

Simply push to the `main` or `master` branch, and GitHub Actions will automatically build and push the image.

### Option B: Manual Build

```bash
# Build the image
docker build -t yourusername/edugenie-ai:latest .

# Push to Docker Hub
docker login
docker push yourusername/edugenie-ai:latest
```

## Step 4: Deploy to VPS

### 1. SSH into your VPS

```bash
ssh user@your-vps-ip
```

### 2. Install Docker and Docker Compose

```bash
# Update package list
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add your user to docker group
sudo usermod -aG docker $USER
```

### 3. Create deployment directory

```bash
mkdir -p ~/edugenie-ai
cd ~/edugenie-ai
```

### 4. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    image: yourusername/edugenie-ai:latest
    container_name: edugenie-ai
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    depends_on:
      - chromadb
    networks:
      - edugenie-network

  chromadb:
    image: chromadb/chroma:latest
    container_name: edugenie-chromadb
    ports:
      - "8000:8000"
    volumes:
      - chroma-data:/chroma/chroma
    environment:
      - IS_PERSISTENT=TRUE
      - ANONYMIZED_TELEMETRY=FALSE
    restart: unless-stopped
    networks:
      - edugenie-network

volumes:
  chroma-data:
    driver: local

networks:
  edugenie-network:
    driver: bridge
```

### 5. Pull and run the container

```bash
docker-compose pull
docker-compose up -d
```

### 6. Verify deployment

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Test health endpoint
curl http://localhost/health
```

## Step 5: Configure Environment Variables (Client-Side)

Since this is a Vite app, environment variables need to be baked into the build. Update your `.env` file before building:

```bash
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# ChromaDB Vector Database (runs locally, no API key needed!)
VITE_CHROMA_URL=http://chromadb:8000
VITE_CHROMA_COLLECTION=edugenie-ai

# Hugging Face API Key
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Ollama Configuration (if using local AI)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
OLLAMA_VISION_MODEL=llava
```

**Important:** Rebuild the Docker image after updating environment variables.

## Step 6: Set Up SSL (Optional but Recommended)

### Using Certbot with Nginx

1. Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx -y
```

2. Update docker-compose.yml to expose port 443:
```yaml
ports:
  - "80:80"
  - "443:443"
volumes:
  - ./ssl:/etc/nginx/ssl
```

3. Get SSL certificate:
```bash
sudo certbot --nginx -d yourdomain.com
```

## Step 7: Update and Redeploy

To update the application:

```bash
cd ~/edugenie-ai
docker-compose pull
docker-compose up -d
```

## Monitoring and Maintenance

### View logs
```bash
docker-compose logs -f
```

### Restart the application
```bash
docker-compose restart
```

### Stop the application
```bash
docker-compose down
```

### Update Docker image
```bash
docker-compose pull
docker-compose up -d
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs

# Check if port 80 is already in use
sudo netstat -tulpn | grep :80
```

### Application not accessible
```bash
# Check firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Vector database connection issues
```bash
# Check if ChromaDB is running
docker-compose ps chromadb

# View ChromaDB logs
docker-compose logs chromadb

# Test ChromaDB health
curl http://localhost:8000/api/v1/heartbeat
```

## Using Vector Database Features

The vector database is integrated and ready to use. Example usage:

```typescript
import { initializeVectorDb } from './services/vectorDb';

// Initialize
const vectorDb = await initializeVectorDb();

// Add documents
await vectorDb.addDocuments([
  { id: '1', content: 'Study material about React hooks', metadata: { topic: 'react' } },
  { id: '2', content: 'Guide to async/await in JavaScript', metadata: { topic: 'javascript' } }
]);

// Search
const results = await vectorDb.similaritySearch('How do I use hooks?', 5);
console.log(results);
```

## Cost Optimization

- **ChromaDB**: 100% free, runs on your VPS
- **VPS**: Use providers like DigitalOcean ($5/month), Linode, or Hetzner
- **Docker Hub**: Free for public repositories
- **Total Cost**: As low as $5/month for everything!

## Security Best Practices

1. Never commit `.env` files to Git
2. Use environment variables for all secrets
3. Keep Docker images updated
4. Use SSL/TLS for production
5. Implement rate limiting on your VPS
6. Regular backups of your vector database

## Support

For issues or questions:
- Check the logs: `docker-compose logs -f`
- Review the README.md
- Open an issue on GitHub
