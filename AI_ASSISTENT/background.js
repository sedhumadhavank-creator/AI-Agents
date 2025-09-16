// Background script for AI Assistant Chrome Extension

class BackgroundService {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupContextMenus();
        this.setupMessageHandling();
        this.setupInstallationEvents();
    }
    
    setupContextMenus() {
        // Create context menu items
        chrome.runtime.onInstalled.addListener(() => {
            chrome.contextMenus.create({
                id: 'ai-assistant-summarize',
                title: 'Summarize with AI Assistant',
                contexts: ['selection', 'page']
            });
            
            chrome.contextMenus.create({
                id: 'ai-assistant-explain',
                title: 'Explain with AI Assistant',
                contexts: ['selection']
            });
            
            chrome.contextMenus.create({
                id: 'ai-assistant-translate',
                title: 'Translate with AI Assistant',
                contexts: ['selection']
            });
            
            chrome.contextMenus.create({
                id: 'ai-assistant-chat',
                title: 'Chat with AI Assistant',
                contexts: ['page']
            });
            
            chrome.contextMenus.create({
                id: 'ai-assistant-test',
                title: 'Test Settings Storage',
                contexts: ['page']
            });
            
            chrome.contextMenus.create({
                id: 'ai-assistant-diagnose',
                title: 'Diagnose API Issues',
                contexts: ['page']
            });
            
            chrome.contextMenus.create({
                id: 'ai-assistant-simple-test',
                title: 'Simple Gemini Test',
                contexts: ['page']
            });
        });
        
        // Handle context menu clicks
        chrome.contextMenus.onClicked.addListener((info, tab) => {
            this.handleContextMenuClick(info, tab);
        });
    }
    
    setupMessageHandling() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async response
        });
    }
    
    setupInstallationEvents() {
        chrome.runtime.onInstalled.addListener((details) => {
            if (details.reason === 'install') {
                this.showWelcomeNotification();
            }
        });
    }
    
    async handleContextMenuClick(info, tab) {
        const { menuItemId, selectionText, pageUrl } = info;
        
        try {
            switch (menuItemId) {
                case 'ai-assistant-summarize':
                    await this.openAssistantWithAction(tab.id, 'summarize', selectionText);
                    break;
                case 'ai-assistant-explain':
                    await this.openAssistantWithAction(tab.id, 'explain', selectionText);
                    break;
                case 'ai-assistant-translate':
                    await this.openAssistantWithAction(tab.id, 'translate', selectionText);
                    break;
                case 'ai-assistant-chat':
                    await this.openAssistantWithAction(tab.id, 'chat');
                    break;
                case 'ai-assistant-test':
                    await this.openTestPage();
                    break;
                case 'ai-assistant-diagnose':
                    await this.openDiagnosePage();
                    break;
                case 'ai-assistant-simple-test':
                    await this.openSimpleTestPage();
                    break;
            }
        } catch (error) {
            console.error('Error handling context menu click:', error);
        }
    }
    
    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'getPageContent':
                    const content = await this.getPageContent(sender.tab.id);
                    sendResponse({ success: true, content });
                    break;
                    
                case 'callAIService':
                    try {
                        const response = await this.callGeminiDirectly(request.data);
                        sendResponse({ success: true, response });
                    } catch (error) {
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                    
                case 'getSettings':
                    const settings = await this.getSettings();
                    sendResponse({ success: true, settings });
                    break;
                    
                case 'saveSettings':
                    await this.saveSettings(request.settings);
                    sendResponse({ success: true });
                    break;
                    
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ success: false, error: error.message });
        }
    }
    
    async openAssistantWithAction(tabId, action, text = '') {
        // Open the extension popup
        await chrome.action.openPopup();
        
        // Send message to popup with the action
        setTimeout(() => {
            chrome.runtime.sendMessage({
                action: 'contextMenuAction',
                data: { action, text, tabId }
            });
        }, 100);
    }
    
    async openTestPage() {
        // Open the test settings page in a new tab
        const url = chrome.runtime.getURL('test-settings.html');
        await chrome.tabs.create({ url: url });
    }
    
    async openDiagnosePage() {
        // Open the diagnostic page in a new tab
        const url = chrome.runtime.getURL('diagnose-api.html');
        await chrome.tabs.create({ url: url });
    }
    
    async openSimpleTestPage() {
        // Open the simple test page in a new tab
        const url = chrome.runtime.getURL('test-gemini-simple.html');
        await chrome.tabs.create({ url: url });
    }
    
    async getPageContent(tabId) {
        try {
            const results = await chrome.scripting.executeScript({
                target: { tabId },
                function: () => {
                    return {
                        title: document.title,
                        url: window.location.href,
                        text: document.body.innerText.substring(0, 5000),
                        selectedText: window.getSelection().toString(),
                        html: document.documentElement.outerHTML.substring(0, 10000)
                    };
                }
            });
            
            return results[0]?.result || {};
        } catch (error) {
            console.error('Error getting page content:', error);
            return {};
        }
    }
    
    async callGeminiDirectly(data) {
        const { message, context, settings } = data;
        
        // Build the prompt with context
        let prompt = message;
        
        // Add context if provided
        if (context && context.title) {
            prompt = `You are a helpful AI assistant. The user is currently on a webpage titled "${context.title}" at ${context.url}. Use this context to provide more relevant responses.\n\nUser's question: ${message}`;
        }
        
        if (context && context.text) {
            prompt += `\n\nHere is some context from the current page: ${context.text.substring(0, 2000)}`;
        }
        
        if (context && context.selectedText) {
            prompt += `\n\nThe user has selected this text: "${context.selectedText}"`;
        }
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${settings.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: settings.temperature,
                    maxOutputTokens: 1000
                }
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Gemini API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }
        
        const responseData = await response.json();
        
        if (responseData.candidates && responseData.candidates[0] && responseData.candidates[0].content) {
            return responseData.candidates[0].content.parts[0].text.trim();
        } else {
            throw new Error('Invalid response format from Gemini API');
        }
    }
    
    async callAIService(data) {
        // This would typically call your backend AI service
        // For now, we'll return a mock response
        return this.mockAIResponse(data.message, data.context);
    }
    
    mockAIResponse(message, context) {
        const responses = [
            `I understand you're asking about: "${message}". Based on the current page context, I can help you with that.`,
            `That's an interesting question! Let me help you with: "${message}".`,
            `I can assist you with that. Here's what I think about: "${message}".`,
            `Great question! Regarding "${message}", I'd be happy to help you understand this better.`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    async getSettings() {
        try {
            const result = await chrome.storage.sync.get(['aiAssistantSettings']);
            return result.aiAssistantSettings || {};
        } catch (error) {
            console.error('Error getting settings:', error);
            return {};
        }
    }
    
    async saveSettings(settings) {
        try {
            await chrome.storage.sync.set({ aiAssistantSettings: settings });
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    }
    
    showWelcomeNotification() {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'AI Assistant Installed!',
            message: 'Right-click on any page to access AI features, or click the extension icon to open the chat interface.'
        });
    }
}

// Initialize the background service
new BackgroundService();
