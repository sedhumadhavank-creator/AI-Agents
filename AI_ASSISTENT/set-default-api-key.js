// Script to set default API key for AI Assistant Chrome Extension
// Run this in the browser console when the extension is loaded

async function setDefaultAPIKey(apiKey) {
    try {
        console.log('Setting default API key...');
        
        // Check if we're in extension context
        if (typeof chrome === 'undefined' || !chrome.storage) {
            console.error('Chrome storage API not available. This script must be run in the extension context.');
            return false;
        }
        
        // Set the default settings
        const defaultSettings = {
            apiKey: apiKey,
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            autoSummarize: false
        };
        
        await chrome.storage.sync.set({ aiAssistantSettings: defaultSettings });
        console.log('✅ Default API key set successfully!');
        console.log('Settings:', defaultSettings);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error setting default API key:', error);
        return false;
    }
}

// Usage instructions
console.log(`
🔧 AI Assistant - Set Default API Key
=====================================

To set your default API key, run:
setDefaultAPIKey('your-api-key-here');

Example:
setDefaultAPIKey('sk-1234567890abcdef...');

This will set:
- API Key: Your provided key
- Model: GPT-3.5 Turbo
- Temperature: 0.7
- Auto-summarize: false

After running this, reload the extension popup to see the changes.
`);

// Export the function for use
window.setDefaultAPIKey = setDefaultAPIKey;


