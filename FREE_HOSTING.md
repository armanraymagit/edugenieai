# Free VPS & Hosting Options for EduGenie AI

This guide covers **100% FREE** deployment options for EduGenie AI.

## 🆓 Free Hosting Options

### Option 1: Vercel (Recommended - Easiest)

**Free Tier:**
- ✅ Unlimited deployments
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ Serverless functions
- ✅ Custom domains

**Setup:**

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

That's it! Your app is live.

**Or use GitHub integration:**
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Import your repository
4. Deploy automatically on every push

### Option 2: Netlify

**Free Tier:**
- ✅ 100GB bandwidth/month
- ✅ Automatic SSL
- ✅ Continuous deployment
- ✅ Custom domains

**Setup:**

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build and deploy:
```bash
npm run build
netlify deploy --prod
```

**Or use drag-and-drop:**
1. Go to [netlify.com](https://netlify.com)
2. Drag your `dist` folder
3. Done!

### Option 3: GitHub Pages

**Free Tier:**
- ✅ Unlimited bandwidth
- ✅ Automatic SSL
- ✅ Custom domains
- ✅ Direct from repository

**Setup:**

See `.github/workflows/github-pages.yml` (created below)

Push to main branch → Automatic deployment to `https://yourusername.github.io/EduGenie-AI`

### Option 4: Railway (Free Tier with Docker)

**Free Tier:**
- ✅ $5 credit/month (enough for small apps)
- ✅ Docker support
- ✅ Automatic SSL
- ✅ PostgreSQL included

**Setup:**

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. New Project → Deploy from GitHub
4. Select your repository
5. Railway auto-detects Dockerfile and deploys

**For ChromaDB:**
Railway can run both containers! See `railway.json` below.

### Option 5: Oracle Cloud (Always Free VPS)

**Always Free Tier:**
- ✅ 2 AMD VMs (1/8 OCPU, 1GB RAM each)
- ✅ OR 4 ARM VMs (1 OCPU, 6GB RAM each) - **Best option!**
- ✅ 200GB block storage
- ✅ 10TB bandwidth/month
- ✅ Forever free (no credit card expiry)

**This is a REAL VPS, not just hosting!**

**Setup:**

1. Sign up at [oracle.com/cloud/free](https://www.oracle.com/cloud/free/)
2. Create a Compute Instance (ARM - Ampere A1)
3. Follow the VPS deployment guide below

### Option 6: Render

**Free Tier:**
- ✅ Static sites (unlimited)
- ✅ Web services (750 hours/month)
- ✅ Automatic SSL
- ✅ Docker support

**Setup:**

1. Go to [render.com](https://render.com)
2. New → Static Site
3. Connect GitHub repository
4. Build command: `npm run build`
5. Publish directory: `dist`

## 🎯 Recommended Setup (100% Free)

**Best combination for EduGenie AI:**

1. **Frontend**: Vercel or Netlify (static hosting)
2. **Vector Database**: Railway (free tier) or self-host on Oracle Cloud
3. **CI/CD**: GitHub Actions (included)

**Total Cost: $0/month** 🎉

## 📋 Configuration Files

### For Vercel

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### For Netlify

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### For Railway

Create `railway.json`:
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 🚀 Oracle Cloud Free VPS Setup (Detailed)

### Step 1: Create Account

1. Go to [oracle.com/cloud/free](https://www.oracle.com/cloud/free/)
2. Sign up (requires credit card for verification, but won't be charged)
3. Choose your home region (can't change later!)

### Step 2: Create VM Instance

1. Go to **Compute** → **Instances**
2. Click **Create Instance**
3. Configure:
   - **Name**: edugenie-ai
   - **Image**: Ubuntu 22.04
   - **Shape**: Ampere (ARM) - VM.Standard.A1.Flex
   - **OCPUs**: 1-4 (free tier allows up to 4)
   - **Memory**: 6-24GB (free tier allows up to 24GB total)
   - **Boot Volume**: 50GB (free tier allows up to 200GB)

4. **Networking**:
   - Create new VCN
   - Assign public IP

5. **SSH Keys**:
   - Generate or upload your SSH key
   - Download private key

6. Click **Create**

### Step 3: Configure Firewall

1. Go to **Networking** → **Virtual Cloud Networks**
2. Click your VCN → **Security Lists** → **Default Security List**
3. Add **Ingress Rules**:
   - Port 80 (HTTP)
   - Port 443 (HTTPS)
   - Port 8000 (ChromaDB) - optional, for external access

### Step 4: Connect and Deploy

```bash
# SSH into your instance
ssh -i /path/to/private-key ubuntu@<public-ip>

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo apt install docker-compose -y

# Clone your repository
git clone https://github.com/yourusername/EduGenie-AI.git
cd EduGenie-AI

# Create .env file
nano .env
# Add your API keys

# Start everything
docker-compose up -d

# Configure Ubuntu firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Step 5: Access Your App

Your app is now live at: `http://<your-public-ip>`

### Step 6: Add Domain (Optional)

1. Point your domain A record to the public IP
2. Install Certbot for SSL:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

## 💡 ChromaDB Hosting Options

### Option A: Railway (Free Tier)

1. Create new project on Railway
2. Add **Docker** service
3. Use this `Dockerfile.chroma`:
```dockerfile
FROM chromadb/chroma:latest
EXPOSE 8000
```
4. Deploy
5. Get the public URL
6. Update your app's `VITE_CHROMA_URL` to Railway URL

### Option B: Fly.io (Free Tier)

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Create fly.toml for ChromaDB
cat > fly.toml << EOF
app = "edugenie-chromadb"

[build]
  image = "chromadb/chroma:latest"

[[services]]
  internal_port = 8000
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]
  
  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
EOF

# Deploy
flyctl launch
flyctl deploy
```

### Option C: Self-host on Oracle Cloud

Already included in the docker-compose setup above!

## 📊 Comparison Table

| Option | Frontend | Backend/Docker | Database | SSL | Custom Domain | Best For |
|--------|----------|----------------|----------|-----|---------------|----------|
| **Vercel** | ✅ Free | ❌ | ❌ | ✅ | ✅ | Static sites |
| **Netlify** | ✅ Free | ❌ | ❌ | ✅ | ✅ | Static sites |
| **GitHub Pages** | ✅ Free | ❌ | ❌ | ✅ | ✅ | Open source |
| **Railway** | ✅ Free | ✅ $5 credit | ✅ $5 credit | ✅ | ✅ | Full stack |
| **Render** | ✅ Free | ✅ 750h | ❌ | ✅ | ✅ | Web apps |
| **Oracle Cloud** | ✅ Free | ✅ Free | ✅ Free | ✅ | ✅ | **Everything!** |
| **Fly.io** | ✅ Free | ✅ Free (3 VMs) | ✅ Free | ✅ | ✅ | Docker apps |

## 🏆 Recommended: Oracle Cloud

**Why Oracle Cloud is the best free option:**

1. **True VPS** - Full control, not just hosting
2. **Generous specs** - Up to 4 CPUs, 24GB RAM (ARM)
3. **Forever free** - No time limit, no credit card expiry
4. **Full Docker support** - Run anything
5. **200GB storage** - Plenty of space
6. **10TB bandwidth** - More than enough

**Perfect for EduGenie AI because:**
- ✅ Run both app and ChromaDB
- ✅ No vendor lock-in
- ✅ Full customization
- ✅ Production-ready performance

## 🎯 Quick Deploy Commands

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod
```

### Railway
```bash
# Just connect GitHub repo via web UI
# Railway auto-deploys on push
```

### Oracle Cloud
```bash
# After VM setup:
git clone <your-repo>
cd EduGenie-AI
docker-compose up -d
```

## 🔧 Environment Variables

For **Vercel/Netlify** (static hosting), add environment variables in their dashboard:
- `VITE_GEMINI_API_KEY`
- `VITE_CHROMA_URL` (if using external ChromaDB)
- `VITE_HUGGINGFACE_API_KEY`

For **Railway/Oracle Cloud** (Docker), use `.env` file as usual.

## 📚 Next Steps

1. Choose your hosting option
2. Follow the setup guide above
3. Deploy your app
4. Update DNS (if using custom domain)
5. Enjoy your free deployment! 🎉

## 🆘 Troubleshooting

### Vercel/Netlify: Environment variables not working
- Prefix with `VITE_` for Vite apps
- Rebuild after adding variables

### Railway: Out of credits
- Upgrade to hobby plan ($5/month)
- Or switch to Oracle Cloud (free forever)

### Oracle Cloud: Can't create ARM instance
- ARM instances are in high demand
- Try different regions
- Or use AMD instances (less powerful but still free)

### ChromaDB connection failed
- Check if ChromaDB service is running
- Verify `VITE_CHROMA_URL` is correct
- Check firewall rules

## 💰 Total Cost: $0/month

With Oracle Cloud or the right combination of free tiers, you can run EduGenie AI **completely free** forever! 🎉
