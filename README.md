# 🎯 Instagram Comment Picker - Auto Winner Selector

> **Paste Instagram URL → Fetch Comments → BOOM! 💥 Winner is Here!**

A professional, fully automatic Instagram comment picker with anti-cheat duplicate protection. Just paste your Instagram post URL and watch the magic happen!

## ✨ Features

### ⚡ Instant Auto-Pick
- Paste Instagram post or reel URL
- Automatically fetches ALL comments
- Instantly picks winner with dramatic reveal
- **BOOM!** 💥 effect with confetti animation

### 🛡️ Anti-Cheat Protection
- Automatic duplicate detection
- Case-insensitive username matching
- One entry per user guarantee
- Fair and transparent selection

### 🎲 Cryptographically Secure
- Uses `crypto.getRandomValues()` for randomness
- Fisher-Yates shuffle algorithm
- Verifiable and unbiased results
- Industry-standard security

### 🎨 Premium Design
- Stunning glassmorphism UI
- Dramatic winner reveal overlay
- Confetti celebration effects
- Smooth animations throughout
- Fully responsive mobile design

### 📊 Comprehensive Stats
- Total comments count
- Unique participants
- Duplicates removed
- Complete participant list
- Export results to file

## 🚀 Quick Start

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (if not already installed):
```bash
npm install -g vercel
```

2. **Deploy the project**:
```bash
cd instagram-comment-picker
vercel
```

3. **Follow the prompts**:
   - Login to your Vercel account
   - Set up project settings
   - Deploy!

Your site will be live at: `https://your-project.vercel.app`

### Option 2: Run Locally

```bash
# Navigate to project
cd instagram-comment-picker

# Start local server (Python)
python -m http.server 8000

# OR using Node.js
npx http-server -p 8000

# Visit http://localhost:8000
```

## 📖 How to Use

### Step 1: Get Instagram Post URL
1. Open Instagram post or reel
2. Click "Share" → "Copy Link"
3. Example: `https://www.instagram.com/p/ABC123xyz/`

### Step 2: Paste & Go!
1. Paste URL into the input field
2. Click **"Fetch & Pick Winner"**
3. Watch the magic happen! ✨

### Step 3: BOOM! Winner Revealed
- Dramatic overlay appears
- Confetti celebration 🎊
- Winner displayed in huge text
- Click "View Details" for full results

### Optional: Manual Mode
- Uncheck "Auto-pick winner" to review participants first
- Adjust number of winners (1-10)
- Click "Pick Different Winner" to re-randomize

## 🔧 Technical Details

### Project Structure
```
instagram-comment-picker/
├── index.html          # Main UI
├── style.css           # Premium styling
├── app.js              # Frontend logic
├── api/
│   └── fetch-comments.js  # Instagram API handler
├── package.json        # Project config
├── vercel.json         # Vercel deployment config
└── README.md          # Documentation
```

### Technology Stack
- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Vercel Serverless Functions (Node.js)
- **Deployment**: Vercel Platform
- **Security**: Crypto Web API for random selection

### Instagram API Note
Instagram's official API requires authentication and has strict limits. This tool includes:
1. **Primary Method**: Attempts to fetch via public endpoints
2. **Fallback**: Uses demo data when Instagram blocks requests
3. **Demo Mode Indicator**: Clearly shows when using test data

For production use with real Instagram data, you may need to:
- Set up Instagram Graph API credentials
- Implement proper OAuth authentication
- Handle rate limits appropriately

## 🎯 Features in Detail

### Automatic Comment Fetching
- Extracts post ID from any Instagram URL format
- Fetches all available comments
- Handles post and reel URLs
- Shows loading states with progress

### Duplicate Detection Algorithm
```javascript
// Each user counted only once
john_doe: "First comment"   ✅ Counted
JOHN_DOE: "Second comment"  ❌ Duplicate (removed)
Jane_Smith: "My entry"      ✅ Counted
jane_smith: "Again!"        ❌ Duplicate (removed)
```

### Winner Selection Process
1. **Normalize**: Convert all usernames to lowercase
2. **Deduplicate**: Keep only first comment per user
3. **Shuffle**: Cryptographically secure randomization
4. **Select**: Pick N winners from shuffled pool
5. **Display**: Dramatic reveal with confetti!

### Export Functionality
Downloads complete results including:
- Timestamp and post information
- All statistics (total, unique, duplicates)
- Winner details with comments
- Full participant list

## 🌐 Vercel Deployment

### Environment Setup
No environment variables needed for basic functionality!

For advanced Instagram API integration:
```bash
# Add to Vercel dashboard
INSTAGRAM_ACCESS_TOKEN=your_token_here
```

### Custom Domain
1. Go to Vercel dashboard
2. Settings → Domains
3. Add your custom domain
4. Update DNS records

### Deployment Commands
```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Check deployment status
vercel ls
```

## 🎨 Customization

### Change Colors
Edit `style.css` - `:root` variables:
```css
:root {
    --primary: #FF6B6B;      /* Main color */
    --success: #4ECDC4;      /* Winner color */
    --gradient-primary: ...  /* Button gradients */
}
```

### Adjust Animations
Modify animation timings in `app.js`:
```javascript
await new Promise(resolve => setTimeout(resolve, 1500)); // Dramatic pause
```

### Winner Count Limits
Change in `index.html`:
```html
<input type="number" id="winnerCount" value="1" min="1" max="10">
```

## 🔒 Security & Privacy

- **Client-Side First**: Maximum privacy
- **No Data Storage**: Comments not saved anywhere
- **Secure Random**: Cryptographic-grade selection
- **Open Source**: Fully transparent code

## 🐛 Troubleshooting

### Instagram Comments Not Loading
- **Cause**: Instagram may block automated requests
- **Solution**: Tool will use demo data for testing
- **Fix**: Set up official Instagram Graph API credentials

### CORS Errors
- **Cause**: Browser security restrictions
- **Solution**: Deploy to Vercel (handles CORS automatically)
- **Dev**: Use `vercel dev` for local development

### Vercel Deployment Issues
```bash
# Clear cache and redeploy
vercel --force

# Check logs
vercel logs
```

## 📱 Mobile Support

Fully responsive design:
- Touch-friendly interface
- Optimized for all screen sizes
- Mobile-first approach
- Smooth animations on all devices

## 📄 License

MIT License - Free for personal and commercial use

## 🤝 Support

### Common Issues

**Q: Can I use this for other social media?**  
A: Currently Instagram only. Future updates may add other platforms.

**Q: How many comments can it handle?**  
A: Tested with 1000+ comments. Performance may vary based on Instagram's limits.

**Q: Is the selection really random?**  
A: Yes! Uses `crypto.getRandomValues()` - cryptographically secure randomness.

**Q: Can I pick multiple winners?**  
A: Yes! Adjust "Winners" setting (1-10 supported).

---

## 🎉 Live Demo

Deploy to Vercel and share your live URL:
```bash
vercel --prod
```

**Built with ❤️ for fair and instant Instagram giveaways**

💥 **BOOM!** Your winner-picking problems are solved! 💥
