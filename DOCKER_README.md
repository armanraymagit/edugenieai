# Docker & DevOps Setup

## Quick Start with Docker

### Local Development

```bash
# Build the Docker image
docker build -t edugenie-ai .

# Run the container
docker run -p 80:80 edugenie-ai

# Or use Docker Compose
docker-compose up
```

Access the application at http://localhost

### Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete VPS deployment instructions.

## Vector Database Integration

EduGenie AI now includes LangChain integration with Pinecone for semantic search and document storage.

### Setup

1. Create a free Pinecone account at https://www.pinecone.io/
2. Create an index named `edugenie-ai` with 1536 dimensions
3. Add your API key to `.env`:

```bash
VITE_PINECONE_API_KEY=your_api_key_here
VITE_PINECONE_INDEX_NAME=edugenie-ai
```

### Usage Example

```typescript
import { initializeVectorDb } from './services/vectorDb';

// Initialize the vector database
const vectorDb = await initializeVectorDb();

// Store study materials
await vectorDb.addDocuments([
  {
    content: 'React hooks allow you to use state in functional components',
    metadata: { topic: 'react', difficulty: 'intermediate' }
  }
]);

// Search for relevant content
const results = await vectorDb.similaritySearch('how to use state in react', 3);
```

## CI/CD Pipeline

The project includes a GitHub Actions workflow that:
- Builds the application
- Runs tests
- Creates a Docker image
- Pushes to Docker Hub

### Setup GitHub Actions

1. Add secrets to your repository:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub token

2. Push to `main` branch to trigger the workflow

## Architecture

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Nginx (Port 80)│
│   Proxy Server  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│   React + Vite  │─────▶│  Gemini API  │
│   Application   │      └──────────────┘
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Pinecone     │
│  Vector Store   │
└─────────────────┘
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `VITE_PINECONE_API_KEY` | Pinecone API key | Optional |
| `VITE_PINECONE_INDEX_NAME` | Pinecone index name | Optional |
| `HUGGINGFACE_API_KEY` | HuggingFace API key | Optional |
| `OLLAMA_BASE_URL` | Ollama server URL | Optional |

## Files Added

- `Dockerfile` - Multi-stage build for production
- `nginx.conf` - Nginx proxy configuration
- `docker-compose.yml` - Container orchestration
- `.dockerignore` - Docker build exclusions
- `.github/workflows/deploy.yml` - CI/CD pipeline
- `services/vectorDb.ts` - Vector database service
- `DEPLOYMENT.md` - Deployment guide

## Development vs Production

### Development
```bash
npm run dev
```

### Production (Docker)
```bash
docker-compose up -d
```

## Troubleshooting

### Docker build fails
- Ensure all dependencies are in `package.json`
- Check that `.dockerignore` isn't excluding necessary files

### Nginx routing issues
- Verify `nginx.conf` is correctly configured
- Check container logs: `docker-compose logs -f`

### Vector database connection
- Verify API key is correct
- Ensure index exists in Pinecone dashboard
- Check network connectivity
