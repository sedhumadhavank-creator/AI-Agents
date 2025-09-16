# Quick Setup Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
# Windows
install.bat

# macOS/Linux
./install.sh
```

### 2. Create Extension Icons
1. Open `create-icons.html` in your browser
2. Download all 4 icon sizes (16x16, 32x32, 48x48, 128x128)
3. Save them in the `icons/` folder with these exact names:
   - `icon16.png`
   - `icon32.png`
   - `icon48.png`
   - `icon128.png`

### 3. Load Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this project folder
5. The AI Assistant extension should appear in your toolbar

### 4. Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up/login and create an API key
3. Copy the key for the next step

### 5. Configure Extension
1. Click the AI Assistant icon in Chrome toolbar
2. Click the settings gear icon
3. Enter your OpenAI API key
4. Choose your preferred model (GPT-3.5 Turbo recommended for beginners)
5. Save settings

## ✅ You're Ready!

The AI Assistant is now ready to use! Try:
- Clicking the extension icon to open the chat
- Right-clicking on any webpage for context menu options
- Using Ctrl+Shift+A to toggle the assistant panel

## 🔧 Troubleshooting

**Extension not working?**
- Make sure the AI service is running (check terminal for "AI Service running on port 3000")
- Verify your API key is correct
- Check Chrome console for errors (F12 → Console)

**Need help?**
- Check the full README.md for detailed documentation
- Look at the troubleshooting section
- Make sure all dependencies are installed correctly

