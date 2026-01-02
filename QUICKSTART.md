# 🚀 Quick Start Guide

## The API Issue You're Experiencing

The error "failed to fetch comments" happens because:
- The Python server (`python -m http.server`) only serves static files
- It **cannot** run the API endpoint `/api/fetch-comments`
- You need Vercel's development server for the API to work

## ✅ Solution: Use Vercel Dev

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Start Vercel Development Server
```bash
cd instagram-comment-picker
vercel dev
```

### Step 3: Open the App
- Visit: `http://localhost:3000`
- The API will now work!
- Try any Instagram URL

## 🚀 Deploy to Production (Recommended)

For the best experience, deploy to Vercel:

```bash
vercel
```

Follow the prompts and you'll get a live URL like:
**`https://your-picker.vercel.app`**

## 🎯 Current Status

✅ **What works locally (Python server):**
- Beautiful UI loads
- Manual comment paste (from old version)
- All styling and animations

❌ **What doesn't work (Python server):**
- Instagram URL fetching
- API calls to `/api/fetch-comments`

✅ **What works (Vercel dev or deployed):**
- **EVERYTHING!** Including Instagram URL fetching

## 💡 Quick Deploy (Fastest Solution)

1. Stop the Python server (Ctrl+C)
2. Run: `vercel --prod`
3. Get instant live URL
4. Share with everyone!

The live version will have full Instagram comment fetching working!
