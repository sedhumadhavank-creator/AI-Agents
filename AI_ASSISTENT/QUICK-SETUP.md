# 🚀 Quick Setup Guide - AI Assistant

## Option 1: Set API Key in Code (Easiest)

1. **Open `popup.js`** in your text editor
2. **Find line 16** where it says:
   ```javascript
   apiKey: '', // Replace with your API key here: 'sk-your-api-key-here'
   ```
3. **Replace the empty string** with your API key:
   ```javascript
   apiKey: 'sk-your-actual-api-key-here',
   ```
4. **Save the file**
5. **Reload the extension** in Chrome (`chrome://extensions/` → reload button)
6. **Done!** Your API key is now set as default

## Option 2: Use the Extension Settings

1. **Click the AI Assistant icon** in Chrome toolbar
2. **Click the settings gear icon** (⚙️)
3. **Enter your API key** in the "API Key" field
4. **Click "Save Settings"**
5. **Done!**

## Option 3: Use the Test Page (If Working)

1. **Click the AI Assistant icon**
2. **Click the test button** (✅)
3. **Enter your API key** in the test page
4. **Click "Save Settings"**
5. **Done!**

## Option 4: Browser Console (Advanced)

1. **Open the extension popup**
2. **Press F12** to open Developer Tools
3. **Go to Console tab**
4. **Paste this command** (replace with your actual API key):
   ```javascript
   chrome.storage.sync.set({aiAssistantSettings: {apiKey: 'sk-your-api-key-here', model: 'gpt-3.5-turbo', temperature: 0.7, autoSummarize: false}});
   ```
5. **Press Enter**
6. **Reload the extension popup**

## 🔧 Troubleshooting

**Extension not working?**
- Make sure the AI service is running: `npm start`
- Check that your API key is valid
- Reload the extension after making changes

**Test page stuck on "Checking Chrome API..."?**
- Use Option 1 (edit popup.js) instead
- Or use Option 2 (extension settings)

**Need help?**
- Check the console (F12) for error messages
- Make sure all files are saved
- Restart the AI service if needed

## ✅ Verification

After setting your API key:
1. **Open the extension popup**
2. **Check the status bar** - it should show "AI Ready" with a green dot
3. **Try sending a message** - you should get an AI response

Your AI Assistant is now ready to use! 🎉


