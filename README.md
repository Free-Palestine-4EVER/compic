# 🎯 Instagram Comment Picker

> **Paste Instagram URL → BOOM! 💥 Instant Fair Winner Selection**

A professional, fully automatic Instagram comment picker with anti-cheat duplicate protection and dramatic winner reveal.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Free-Palestine-4EVER/compic)

## ✨ Features

- 🎯 **One-Click Winner Selection** - Paste URL and get instant results
- 🛡️ **Anti-Cheat Protection** - Automatic duplicate detection
- 💥 **BOOM Effect** - Dramatic winner reveal with confetti
- 🎲 **Cryptographically Secure** - Fair random selection
- 📊 **Full Statistics** - Total comments, unique users, duplicates
- 📱 **Mobile Responsive** - Works on all devices
- ⚡ **Lightning Fast** - Instant results

## 🚀 Quick Deploy

### Deploy to Vercel (Recommended)

1. Click the button above or go to [vercel.com](https://vercel.com)
2. Import this repository: `Free-Palestine-4EVER/compic`
3. Click "Deploy"
4. Done! You'll get a live URL

### Run Locally

```bash
# Clone the repository
git clone https://github.com/Free-Palestine-4EVER/compic.git
cd compic

# Install Vercel CLI
npm install -g vercel

# Start dev server
vercel dev

# Open http://localhost:3000
```

## 📖 How to Use

1. **Get Instagram URL**: Copy any post or reel link
2. **Paste URL**: Enter it in the input field
3. **Click Button**: "Fetch & Pick Winner"
4. **BOOM!** 💥 Winner revealed with confetti!

## 🎬 Demo

When deployed, visit your URL and:
- Paste any Instagram post URL
- Watch the loading animation
- See the dramatic BOOM winner reveal
- View complete statistics
- Export results

## 🔧 Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Vercel Serverless Functions
- **Deployment**: Vercel Platform
- **Security**: Web Crypto API

## 🛡️ Anti-Cheat System

**How it works:**
```
john_doe: "First!"     ✅ Counted
JOHN_DOE: "Again!"     ❌ Removed (duplicate)
jane_smith: "Love it!" ✅ Counted
jane_smith: "Best!"    ❌ Removed (duplicate)
```

- Case-insensitive username matching
- Only first comment per user counts
- Shows duplicates removed in stats

## 📊 Features Overview

### Automatic Instagram Fetching
- Extracts comments from any public post
- Handles posts and reels
- Shows loading progress
- Falls back to demo data if blocked

### Winner Selection
- Cryptographically secure randomization
- Pick 1-10 winners
- Ranked display (🥇🥈🥉)
- "Pick Again" for different results

### Visual Experience
- Glassmorphism design
- Gradient backgrounds
- Smooth animations
- Confetti celebration
- Mobile optimized

### Export & Share
- Download complete results
- Includes all statistics
- Winner details with comments
- Full participant list

## 🔐 Privacy & Security

- ✅ No data storage
- ✅ Client-side processing
- ✅ Secure randomness
- ✅ No tracking
- ✅ Open source

## 📝 Configuration

### Adjust Winner Count Limit
Edit `index.html` line 67:
```html
<input type="number" id="winnerCount" value="1" min="1" max="20">
```

### Change Colors
Edit `style.css`:
```css
--primary: #FF6B6B;    /* Main color */
--success: #4ECDC4;    /* Winner color */
```

### Customize Text
All text in `index.html` can be customized:
- Hero title and subtitle
- Button labels
- Info cards
- Footer text

## 🌐 Live Demo

After deploying to Vercel, you'll get a URL like:
```
https://compic.vercel.app
```

## 📱 Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## 🐛 Troubleshooting

**"Failed to fetch comments"**
- Instagram may block automated requests
- App uses demo data as fallback
- Deploy to Vercel for full functionality

**API not working locally**
- Use `vercel dev` instead of Python server
- Python server only serves static files

## 📄 License

MIT License - Free for personal and commercial use

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 🔗 Links

- **Repository**: https://github.com/Free-Palestine-4EVER/compic
- **Deploy**: https://vercel.com/new/clone?repository-url=https://github.com/Free-Palestine-4EVER/compic
- **Issues**: https://github.com/Free-Palestine-4EVER/compic/issues

## ⭐ Star This Repo

If you find this useful, please star the repository!

---

**Built with ❤️ for fair Instagram giveaways**

💥 **BOOM!** Your perfect comment picker! 💥
