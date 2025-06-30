# Netlify Deployment Guide

## Quick Deploy Steps:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [https://app.netlify.com/](https://app.netlify.com/)
   - Click "Add new site" → "Deploy manually"
   - Drag and drop the `dist` folder
   - Your site will be live in seconds!

## Environment Variables (if needed):
If you need to add environment variables later:
- Go to Site Settings → Environment Variables
- Add your API keys (VITE_GEMINI_API_KEY, VITE_GROQ_API_KEY, etc.)

## Custom Domain (optional):
- Go to Site Settings → Domain management
- Add your custom domain

## Auto-deploy from GitHub (recommended for future):
1. Connect your GitHub repository to Netlify
2. Every push to main branch will auto-deploy
3. No need to manually upload files

## Current Configuration:
- ✅ Build command: `npm run build`
- ✅ Publish directory: `dist`
- ✅ SPA routing: Configured with redirects
- ✅ Node version: 18 