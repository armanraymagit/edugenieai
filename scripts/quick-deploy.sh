#!/bin/bash

# Quick Deploy Script for Free Hosting Platforms

set -e

echo "========================================="
echo "EduGenie AI - Quick Deploy"
echo "========================================="
echo ""

PS3='Select deployment platform: '
options=("Vercel" "Netlify" "GitHub Pages" "Railway" "Fly.io (ChromaDB)" "Cancel")
select opt in "${options[@]}"
do
    case $opt in
        "Vercel")
            echo "Deploying to Vercel..."
            if ! command -v vercel &> /dev/null; then
                echo "Installing Vercel CLI..."
                npm install -g vercel
            fi
            vercel
            break
            ;;
        "Netlify")
            echo "Deploying to Netlify..."
            if ! command -v netlify &> /dev/null; then
                echo "Installing Netlify CLI..."
                npm install -g netlify-cli
            fi
            echo "Building..."
            npm run build
            echo "Deploying..."
            netlify deploy --prod
            break
            ;;
        "GitHub Pages")
            echo "Setting up GitHub Pages..."
            echo ""
            echo "To deploy to GitHub Pages:"
            echo "1. Push this code to GitHub"
            echo "2. Go to Settings > Pages"
            echo "3. Select 'GitHub Actions' as source"
            echo "4. The workflow will run automatically"
            echo ""
            echo "Or the workflow is already set up in .github/workflows/github-pages.yml"
            echo "Just push to main branch!"
            break
            ;;
        "Railway")
            echo "Setting up Railway..."
            echo ""
            echo "To deploy to Railway:"
            echo "1. Go to https://railway.app"
            echo "2. Sign in with GitHub"
            echo "3. New Project > Deploy from GitHub"
            echo "4. Select this repository"
            echo "5. Railway will auto-detect and deploy!"
            echo ""
            echo "railway.json is already configured."
            break
            ;;
        "Fly.io (ChromaDB)")
            echo "Deploying ChromaDB to Fly.io..."
            if ! command -v flyctl &> /dev/null; then
                echo "Installing Fly.io CLI..."
                curl -L https://fly.io/install.sh | sh
            fi
            echo "Launching ChromaDB..."
            flyctl launch --config fly.toml
            echo ""
            echo "Your ChromaDB URL will be shown above."
            echo "Update VITE_CHROMA_URL in your .env file with this URL"
            break
            ;;
        "Cancel")
            echo "Cancelled"
            break
            ;;
        *) echo "Invalid option $REPLY";;
    esac
done
