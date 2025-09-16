class AIAssistant {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.testBtn = document.getElementById('testBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettings = document.getElementById('closeSettings');
        this.saveSettings = document.getElementById('saveSettings');
        this.resetSettings = document.getElementById('resetSettings');
        this.modelName = document.getElementById('modelName');
        this.temperatureValue = document.getElementById('temperatureValue');
        
        this.settings = {
            apiKey: 'AIzaSyCyCAN1aMOALrm-rw4TqIMiGeSEOY07wnI',
            model: 'gemini-1.5-flash',
            temperature: 0.7,
            autoSummarize: false
        };
        
        this.init();
    }
    
    async init() {
        console.log('AI Assistant: Initializing...');
        await this.loadSettings();
        console.log('AI Assistant: Settings loaded:', this.settings);
        this.setupEventListeners();
        this.updateUI();
        console.log('AI Assistant: Initialization complete');
    }
    
    setupEventListeners() {
        // Send message
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 100) + 'px';
            this.sendBtn.disabled = !this.messageInput.value.trim();
        });
        
        // Settings modal
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.testBtn.addEventListener('click', () => this.openTestPage());
        this.closeSettings.addEventListener('click', () => this.closeSettingsModal());
        this.saveSettings.addEventListener('click', () => {
            console.log('AI Assistant: Save settings button clicked');
            // Visual feedback
            this.saveSettings.textContent = 'Saving...';
            this.saveSettings.disabled = true;
            this.saveSettingsData().finally(() => {
                this.saveSettings.textContent = 'Save Settings';
                this.saveSettings.disabled = false;
            });
        });
        this.resetSettings.addEventListener('click', () => this.resetSettingsData());
        
        // Temperature slider
        const temperatureSlider = document.getElementById('temperature');
        temperatureSlider.addEventListener('input', (e) => {
            this.temperatureValue.textContent = e.target.value;
        });
        
        // Quick actions
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleQuickAction(action);
            });
        });
        
        // Close modal on outside click
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettingsModal();
            }
        });
    }
    
    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['aiAssistantSettings']);
            if (result.aiAssistantSettings) {
                this.settings = { ...this.settings, ...result.aiAssistantSettings };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    async saveSettings() {
        try {
            await chrome.storage.sync.set({ aiAssistantSettings: this.settings });
            // Update UI after a short delay to ensure DOM is ready
            setTimeout(() => {
                this.updateUI();
            }, 100);
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    }
    
    updateUI() {
        // Update model name display
        this.modelName.textContent = this.settings.model;
        
        // Update settings form
        document.getElementById('apiKey').value = this.settings.apiKey;
        document.getElementById('model').value = this.settings.model;
        document.getElementById('temperature').value = this.settings.temperature;
        document.getElementById('autoSummarize').checked = this.settings.autoSummarize;
        this.temperatureValue.textContent = this.settings.temperature;
        
        // Update status
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-indicator span');
        
        if (this.settings.apiKey) {
            statusDot.className = 'status-dot online';
            statusText.textContent = 'AI Ready';
        } else {
            statusDot.className = 'status-dot offline';
            statusText.textContent = 'API Key Required';
        }
    }
    
    openSettings() {
        this.settingsModal.classList.add('show');
    }
    
    openTestPage() {
        // Open the test extension page in a new tab
        const url = chrome.runtime.getURL('test-extension.html');
        chrome.tabs.create({ url: url });
    }
    
    closeSettingsModal() {
        this.settingsModal.classList.remove('show');
    }
    
    async saveSettingsData() {
        console.log('AI Assistant: Saving settings...');
        try {
            // Validate API key
            const apiKey = document.getElementById('apiKey').value.trim();
            console.log('AI Assistant: API Key length:', apiKey.length);
            
            if (!apiKey) {
                this.showNotification('Please enter an API key', 'error');
                return;
            }
            
            // Update settings
            this.settings.apiKey = apiKey;
            this.settings.model = document.getElementById('model').value;
            this.settings.temperature = parseFloat(document.getElementById('temperature').value);
            this.settings.autoSummarize = document.getElementById('autoSummarize').checked;
            
            console.log('AI Assistant: Updated settings:', this.settings);
            
            // Save settings
            await this.saveSettings();
            console.log('AI Assistant: Settings saved to storage');
            
            // Close modal and show success
            this.closeSettingsModal();
            this.showNotification('Settings saved successfully!', 'success');
            
        } catch (error) {
            console.error('AI Assistant: Error saving settings:', error);
            this.showNotification('Failed to save settings. Please try again.', 'error');
        }
    }
    
    resetSettingsData() {
        this.settings = {
            apiKey: '',
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            autoSummarize: false
        };
        
        this.saveSettings();
        this.updateUI();
        this.showNotification('Settings reset to default!', 'info');
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        if (!this.settings.apiKey) {
            this.showNotification('Please set your API key in settings first!', 'error');
            this.openSettings();
            return;
        }
        
        // Add user message to chat
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        this.sendBtn.disabled = true;
        
        // Show typing indicator
        const typingId = this.addTypingIndicator();
        
        try {
            // Get current tab info for context
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Send message to background script to call AI service
            const response = await chrome.runtime.sendMessage({
                action: 'callAIService',
                data: {
                    message: message,
                    context: await this.getPageContext(tab),
                    settings: this.settings
                }
            });
            
            if (response.success) {
                // Remove typing indicator and add AI response
                this.removeTypingIndicator(typingId);
                this.addMessage(response.response, 'assistant');
            } else {
                throw new Error(response.error || 'Unknown error');
            }
            
        } catch (error) {
            this.removeTypingIndicator(typingId);
            
            let errorMessage = 'Sorry, I encountered an error. ';
            if (error.message.includes('Invalid API key') || error.message.includes('401')) {
                errorMessage += 'Invalid API key. Please check your Gemini API key in settings.';
            } else if (error.message.includes('rate limit') || error.message.includes('429')) {
                errorMessage += 'Rate limit exceeded. Please try again in a moment.';
            } else if (error.message.includes('Gemini API Error')) {
                errorMessage += `Gemini API Error: ${error.message}`;
            } else if (error.message.includes('API key')) {
                errorMessage += 'Please check your API key and try again.';
            } else {
                errorMessage += `Error: ${error.message}`;
            }
            
            this.addMessage(errorMessage, 'assistant');
            console.error('AI Service Error:', error);
        }
    }
    
    
    async getPageContext(tab) {
        try {
            // Check if chrome.scripting is available
            if (!chrome.scripting) {
                console.warn('chrome.scripting not available, using basic context');
                return {
                    title: tab.title || 'Unknown Page',
                    url: tab.url || 'Unknown URL',
                    text: '',
                    selectedText: ''
                };
            }
            
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    return {
                        title: document.title,
                        url: window.location.href,
                        text: document.body.innerText.substring(0, 2000), // Limit text length
                        selectedText: window.getSelection().toString()
                    };
                }
            });
            
            return results[0]?.result || {};
        } catch (error) {
            console.error('Error getting page context:', error);
            // Return basic context if scripting fails
            return {
                title: tab.title || 'Unknown Page',
                url: tab.url || 'Unknown URL',
                text: '',
                selectedText: ''
            };
        }
    }
    
    mockAIResponse(message, context) {
        // Mock AI responses for demonstration
        const responses = [
            "I understand you're asking about: " + message + ". Based on the current page context, I can help you with that.",
            "That's an interesting question! Let me help you with: " + message,
            "I can assist you with that. Here's what I think about: " + message,
            "Great question! Regarding " + message + ", I'd be happy to help you understand this better."
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? 'U' : 'AI';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageContent.appendChild(messageTime);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    addTypingIndicator() {
        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = typingId;
        typingDiv.className = 'message assistant';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = 'AI';
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingIndicator.appendChild(dot);
        }
        
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(typingIndicator);
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
        
        return typingId;
    }
    
    removeTypingIndicator(typingId) {
        const typingElement = document.getElementById(typingId);
        if (typingElement) {
            typingElement.remove();
        }
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    async handleQuickAction(action) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        switch (action) {
            case 'summarize':
                this.messageInput.value = 'Please summarize this page for me.';
                break;
            case 'translate':
                this.messageInput.value = 'Please translate the selected text on this page.';
                break;
            case 'explain':
                this.messageInput.value = 'Please explain the main concepts on this page in simple terms.';
                break;
        }
        
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 100) + 'px';
        this.sendBtn.disabled = false;
        this.messageInput.focus();
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the AI Assistant when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIAssistant();
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
