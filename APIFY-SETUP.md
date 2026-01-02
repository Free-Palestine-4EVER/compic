# 🚀 Apify Setup Guide

## Step 1: Create Free Apify Account

1. Go to **https://apify.com/sign-up**
2. Sign up with email or Google
3. Verify your email

## Step 2: Get Your API Token

1. Go to **https://console.apify.com/account/integrations**
2. Look for **"Personal API tokens"**
3. Copy your token (starts with `apify_api_...`)

## Step 3: Add Token to Vercel

### Method A: Via Vercel Dashboard (Easiest)
1. Go to **https://vercel.com**
2. Select your project **"compic"**
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in sidebar
5. Click **"Add New"**
6. Enter:
   - **Name:** `APIFY_API_TOKEN`
   - **Value:** Your Apify token (paste it)
   - **Environment:** Select all (Production, Preview, Development)
7. Click **"Save"**
8. Go to **"Deployments"** tab
9. Click **"Redeploy"** on latest deployment

### Method B: Via Command Line
```bash
cd instagram-comment-picker
vercel env add APIFY_API_TOKEN
# Paste your token when prompted
# Select all environments
vercel --prod
```

## Step 4: Test It!

1. Wait 1-2 minutes for Vercel to redeploy
2. Go to your site: `https://compic-seven.vercel.app`
3. Paste any Instagram post URL
4. Click "Fetch & Pick Winner"
5. Wait 10-30 seconds for Apify to scrape
6. BOOM! Winner selected! ✨

## What You Get (FREE Plan)

✅ **100 scrapes per month**
✅ **Unlimited comments per scrape** (6,000+ no problem)
✅ **All public Instagram posts**
✅ **Reliable and fast**

## Troubleshooting

**"Apify API token not configured"**
- You forgot to add the token to Vercel
- Or you didn't redeploy after adding it

**"Failed to fetch comments"**
- The Instagram post might be private
- Or the URL is invalid
- Wait a moment and try again

**Scrape is slow (30+ seconds)**
- Normal! Apify needs time to get all comments
- 6,000 comments may take 20-30 seconds
- It's worth the wait for 100% reliability

## Your Limits

- 100 Instagram posts per month
- Each post can have unlimited comments
- Resets every month

Perfect for running giveaways! 🎉
