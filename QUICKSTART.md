# Quick Start Guide - EduGenie AI with Vector Database

This guide will help you get EduGenie AI up and running with Docker, Nginx proxy, and ChromaDB vector database.

## 🚀 Quick Start (3 Steps)

### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone and navigate to the project
cd EduGenie-AI

# 2. Start everything with one command
docker-compose up -d

# 3. Access the app
# App: http://localhost
# ChromaDB: http://localhost:8000
```

That's it! The app and vector database are now running.

### Option 2: Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start ChromaDB (in a separate terminal)
docker run -p 8000:8000 chromadb/chroma:latest

# 3. Start the dev server
npm run dev
```

## 📦 What's Included

### Infrastructure
- ✅ **Dockerfile** - Multi-stage build for production
- ✅ **Nginx Proxy** - Optimized reverse proxy with caching
- ✅ **Docker Compose** - One-command deployment
- ✅ **ChromaDB** - Free, local vector database (no API keys!)
- ✅ **CI/CD** - GitHub Actions workflow

### Features
- ✅ Vector database integration for semantic search
- ✅ Persistent data storage
- ✅ Health check endpoints
- ✅ Gzip compression
- ✅ Security headers

## 🔧 Configuration

### Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional - ChromaDB (defaults shown)
VITE_CHROMA_URL=http://localhost:8000
VITE_CHROMA_COLLECTION=edugenie-ai

# Optional - Other AI services
HUGGINGFACE_API_KEY=your_key_here
OLLAMA_BASE_URL=http://localhost:11434
```

## 🗄️ Using the Vector Database

### Basic Usage

```typescript
import { initializeVectorDb } from './services/vectorDb';

// Initialize
const vectorDb = await initializeVectorDb();

// Add study materials
await vectorDb.addDocuments([
  {
    id: '1',
    content: 'React hooks allow you to use state in functional components',
    metadata: { topic: 'react', difficulty: 'intermediate' }
  },
  {
    id: '2',
    content: 'Async/await makes asynchronous code look synchronous',
    metadata: { topic: 'javascript', difficulty: 'advanced' }
  }
]);

// Search for similar content
const results = await vectorDb.similaritySearch('how to use state in react', 3);
console.log(results);
// Returns: [{ id, content, metadata, distance }]

// Get stats
const stats = await vectorDb.getStats();
console.log(`Total documents: ${stats.count}`);
```

### Advanced Usage

```typescript
// Search with distance threshold (lower = more similar)
const preciseResults = await vectorDb.similaritySearchWithThreshold(
  'react state management',
  5,
  0.3  // Only return very similar results
);

// Delete specific documents
await vectorDb.deleteDocuments(['1', '2']);

// Clear all documents
await vectorDb.clearCollection();
```

## 🐳 Docker Commands

### Development

```bash
# Build the image
docker build -t edugenie-ai .

# Run locally
docker run -p 80:80 edugenie-ai

# View logs
docker logs -f edugenie-ai
```

### Production (Docker Compose)

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart
docker-compose restart

# Update and restart
docker-compose pull
docker-compose up -d
```

### ChromaDB Management

```bash
# Access ChromaDB directly
curl http://localhost:8000/api/v1/heartbeat

# View collections
curl http://localhost:8000/api/v1/collections

# Backup data (the volume persists data)
docker-compose down
docker run --rm -v edugenie-ai_chroma-data:/data -v $(pwd):/backup ubuntu tar czf /backup/chroma-backup.tar.gz /data
```

## 🌐 VPS Deployment

### Prerequisites
- VPS with Docker installed
- Domain name (optional)
- SSH access

### Steps

1. **SSH into your VPS**
```bash
ssh user@your-vps-ip
```

2. **Install Docker**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose -y
```

3. **Clone or upload your code**
```bash
git clone https://github.com/yourusername/EduGenie-AI.git
cd EduGenie-AI
```

4. **Configure environment**
```bash
cp .env.example .env
nano .env  # Add your API keys
```

5. **Deploy**
```bash
docker-compose up -d
```

6. **Configure firewall**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### SSL Setup (Optional)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is configured automatically
```

## 📊 Monitoring

### Health Checks

```bash
# App health
curl http://localhost/health

# ChromaDB health
curl http://localhost:8000/api/v1/heartbeat
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f chromadb
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Find what's using port 80
sudo lsof -i :80

# Or use a different port in docker-compose.yml
ports:
  - "8080:80"  # Access via http://localhost:8080
```

### ChromaDB Connection Failed

```bash
# Check if ChromaDB is running
docker ps | grep chroma

# Restart ChromaDB
docker-compose restart chromadb

# Check logs
docker-compose logs chromadb
```

### Build Fails

```bash
# Clear Docker cache
docker builder prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Vector Database Not Persisting

```bash
# Check volume exists
docker volume ls | grep chroma

# Inspect volume
docker volume inspect edugenie-ai_chroma-data
```

## 🚀 Performance Tips

1. **Enable Gzip** - Already configured in nginx.conf
2. **Use CDN** - For static assets in production
3. **Optimize Images** - Compress before uploading
4. **Code Splitting** - Consider dynamic imports for large components
5. **Cache Headers** - Already configured for static assets

## 📈 Scaling

### Horizontal Scaling

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      replicas: 3
    # Add load balancer
```

### Database Scaling

ChromaDB supports:
- Persistent storage (already configured)
- Backup/restore
- Migration to cloud-hosted ChromaDB

## 🔐 Security Best Practices

1. ✅ Never commit `.env` files
2. ✅ Use environment variables for secrets
3. ✅ Keep Docker images updated
4. ✅ Use SSL/TLS in production
5. ✅ Implement rate limiting
6. ✅ Regular backups

## 📚 Additional Resources

- [ChromaDB Documentation](https://docs.trychroma.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [GitHub Actions](https://docs.github.com/en/actions)

## 🆘 Getting Help

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Review the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
3. Check [DOCKER_README.md](./DOCKER_README.md)
4. Open an issue on GitHub

## 🎉 Next Steps

- [ ] Set up CI/CD with GitHub Actions
- [ ] Configure SSL for production
- [ ] Implement vector search in your app
- [ ] Set up monitoring and alerts
- [ ] Create backups schedule
