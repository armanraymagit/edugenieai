# 🚀 Free Deployment - Quick Reference

## One-Click Deploy Options

### Vercel (Easiest)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/EduGenie-AI)

```bash
npm install -g vercel
vercel
```

### Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/EduGenie-AI)

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod
```

### Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/yourusername/EduGenie-AI)

Just connect your GitHub repo - Railway auto-deploys!

## Free VPS Options

### Oracle Cloud (Best - Forever Free!)
- **4 ARM CPUs + 24GB RAM** (free forever)
- **200GB storage + 10TB bandwidth**
- Run full Docker stack

```bash
# One-line setup on Oracle Cloud VM
curl -fsSL https://raw.githubusercontent.com/yourusername/EduGenie-AI/main/scripts/oracle-cloud-setup.sh | bash
```

### Fly.io (Free Tier)
```bash
curl -L https://fly.io/install.sh | sh
flyctl launch
```

## Quick Deploy Script

```bash
# Interactive deployment
chmod +x scripts/quick-deploy.sh
./scripts/quick-deploy.sh
```

## Platform Comparison

| Platform | Frontend | Docker | Database | Cost |
|----------|----------|--------|----------|------|
| **Vercel** | ✅ | ❌ | ❌ | Free |
| **Netlify** | ✅ | ❌ | ❌ | Free |
| **Railway** | ✅ | ✅ | ✅ | $5 credit/mo |
| **Oracle Cloud** | ✅ | ✅ | ✅ | **FREE FOREVER** |
| **Fly.io** | ✅ | ✅ | ✅ | Free tier |

## Recommended Setup

**For Static Site Only:**
→ Use Vercel or Netlify (easiest)

**For Full Stack with Vector DB:**
→ Use Oracle Cloud (best free option)

**For Quick Test:**
→ Use Railway (instant deploy)

## Environment Variables

Add these to your platform:
- `VITE_GEMINI_API_KEY` - Required
- `VITE_CHROMA_URL` - Optional (for external ChromaDB)
- `VITE_HUGGINGFACE_API_KEY` - Optional

## Need Help?

See [FREE_HOSTING.md](./FREE_HOSTING.md) for detailed guides!

---

**Total Cost: $0/month** 🎉
