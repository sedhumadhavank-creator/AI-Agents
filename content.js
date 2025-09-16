// Content script for AI Assistant Chrome Extension

class ContentScript {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupMessageHandling();
        this.injectAssistantPanel();
        this.setupKeyboardShortcuts();
    }
    
    setupMessageHandling() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true;
        });
    }
    
    handleMessage(request, sender, sendResponse) {
        switch (request.action) {
            case 'getPageInfo':
                sendResponse(this.getPageInfo());
                break;
            case 'getSelectedText':
                sendResponse(this.getSelectedText());
                break;
            case 'highlightText':
                this.highlightText(request.text);
                sendResponse({ success: true });
                break;
            case 'showAssistantPanel':
                this.showAssistantPanel(request.data);
                sendResponse({ success: true });
                break;
            case 'hideAssistantPanel':
                this.hideAssistantPanel();
                sendResponse({ success: true });
                break;
            default:
                sendResponse({ success: false, error: 'Unknown action' });
        }
    }
    
    getPageInfo() {
        return {
            title: document.title,
            url: window.location.href,
            text: document.body.innerText.substring(0, 5000),
            selectedText: window.getSelection().toString(),
            wordCount: document.body.innerText.split(/\s+/).length,
            language: document.documentElement.lang || 'en'
        };
    }
    
    getSelectedText() {
        const selection = window.getSelection();
        return {
            text: selection.toString(),
            range: selection.rangeCount > 0 ? {
                startOffset: selection.getRangeAt(0).startOffset,
                endOffset: selection.getRangeAt(0).endOffset,
                startContainer: selection.getRangeAt(0).startContainer,
                endContainer: selection.getRangeAt(0).endContainer
            } : null
        };
    }
    
    highlightText(text) {
        // Remove existing highlights
        this.removeHighlights();
        
        if (!text) return;
        
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        textNodes.forEach(textNode => {
            const content = textNode.textContent;
            const index = content.toLowerCase().indexOf(text.toLowerCase());
            
            if (index !== -1) {
                const range = document.createRange();
                range.setStart(textNode, index);
                range.setEnd(textNode, index + text.length);
                
                const span = document.createElement('span');
                span.className = 'ai-assistant-highlight';
                span.style.cssText = `
                    background-color: #ffeb3b;
                    padding: 2px 4px;
                    border-radius: 3px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                `;
                
                try {
                    range.surroundContents(span);
                } catch (e) {
                    // If surroundContents fails, try a different approach
                    const contents = range.extractContents();
                    span.appendChild(contents);
                    range.insertNode(span);
                }
            }
        });
    }
    
    removeHighlights() {
        const highlights = document.querySelectorAll('.ai-assistant-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
    }
    
    injectAssistantPanel() {
        // Create the assistant panel if it doesn't exist
        if (!document.getElementById('ai-assistant-panel')) {
            const panel = document.createElement('div');
            panel.id = 'ai-assistant-panel';
            panel.innerHTML = `
                <div class="ai-assistant-header">
                    <h3>AI Assistant</h3>
                    <button id="ai-assistant-close" class="ai-assistant-close">&times;</button>
                </div>
                <div class="ai-assistant-content">
                    <div class="ai-assistant-messages"></div>
                    <div class="ai-assistant-input">
                        <textarea placeholder="Ask me anything about this page..." rows="3"></textarea>
                        <button class="ai-assistant-send">Send</button>
                    </div>
                </div>
            `;
            
            panel.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                width: 350px;
                max-height: 500px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                z-index: 10000;
                display: none;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                border: 1px solid #e0e0e0;
            `;
            
            document.body.appendChild(panel);
            this.setupPanelEvents();
        }
    }
    
    setupPanelEvents() {
        const panel = document.getElementById('ai-assistant-panel');
        const closeBtn = document.getElementById('ai-assistant-close');
        const sendBtn = panel.querySelector('.ai-assistant-send');
        const textarea = panel.querySelector('textarea');
        const messages = panel.querySelector('.ai-assistant-messages');
        
        closeBtn.addEventListener('click', () => this.hideAssistantPanel());
        
        sendBtn.addEventListener('click', () => {
            const message = textarea.value.trim();
            if (message) {
                this.sendMessage(message, messages, textarea);
            }
        });
        
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const message = textarea.value.trim();
                if (message) {
                    this.sendMessage(message, messages, textarea);
                }
            }
        });
        
        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!panel.contains(e.target) && !e.target.closest('[data-ai-assistant-trigger]')) {
                this.hideAssistantPanel();
            }
        });
    }
    
    async sendMessage(message, messagesContainer, textarea) {
        // Add user message
        this.addMessageToPanel(message, 'user', messagesContainer);
        textarea.value = '';
        
        // Show typing indicator
        const typingId = this.addTypingIndicator(messagesContainer);
        
        try {
            // Send message to background script
            const response = await chrome.runtime.sendMessage({
                action: 'callAIService',
                data: {
                    message: message,
                    context: this.getPageInfo()
                }
            });
            
            // Remove typing indicator and add AI response
            this.removeTypingIndicator(typingId);
            this.addMessageToPanel(response.response, 'assistant', messagesContainer);
            
        } catch (error) {
            this.removeTypingIndicator(typingId);
            this.addMessageToPanel('Sorry, I encountered an error. Please try again.', 'assistant', messagesContainer);
            console.error('Error sending message:', error);
        }
    }
    
    addMessageToPanel(content, sender, container) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-assistant-message ai-assistant-message-${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'ai-assistant-avatar';
        avatar.textContent = sender === 'user' ? 'U' : 'AI';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'ai-assistant-message-content';
        messageContent.textContent = content;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        container.appendChild(messageDiv);
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }
    
    addTypingIndicator(container) {
        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = typingId;
        typingDiv.className = 'ai-assistant-message ai-assistant-message-assistant';
        
        const avatar = document.createElement('div');
        avatar.className = 'ai-assistant-avatar';
        avatar.textContent = 'AI';
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'ai-assistant-typing';
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(typingIndicator);
        container.appendChild(typingDiv);
        
        container.scrollTop = container.scrollHeight;
        return typingId;
    }
    
    removeTypingIndicator(typingId) {
        const typingElement = document.getElementById(typingId);
        if (typingElement) {
            typingElement.remove();
        }
    }
    
    showAssistantPanel(data = {}) {
        const panel = document.getElementById('ai-assistant-panel');
        if (panel) {
            panel.style.display = 'block';
            
            // If there's initial data, populate it
            if (data.text) {
                const textarea = panel.querySelector('textarea');
                textarea.value = data.text;
            }
            
            // Focus on textarea
            const textarea = panel.querySelector('textarea');
            textarea.focus();
        }
    }
    
    hideAssistantPanel() {
        const panel = document.getElementById('ai-assistant-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + A to toggle assistant panel
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                const panel = document.getElementById('ai-assistant-panel');
                if (panel.style.display === 'none' || !panel.style.display) {
                    this.showAssistantPanel();
                } else {
                    this.hideAssistantPanel();
                }
            }
        });
    }
}

// Initialize content script
new ContentScript();

