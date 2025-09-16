// AI Service for Chrome Extension
// This is a Node.js backend service that handles AI requests

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

class AIService {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.setupMiddleware();
        this.setupRoutes();
    }
    
    setupMiddleware() {
        // CORS configuration
        this.app.use(cors({
            origin: ['chrome-extension://*', 'http://localhost:*'],
            credentials: true
        }));
        
        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.'
        });
        this.app.use(limiter);
        
        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        
        // Request logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }
    
    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ status: 'healthy', timestamp: new Date().toISOString() });
        });
        
        // Main AI chat endpoint
        this.app.post('/api/chat', async (req, res) => {
            try {
                const { message, context, model = 'gpt-3.5-turbo', temperature = 0.7, apiKey } = req.body;
                
                if (!message) {
                    return res.status(400).json({ error: 'Message is required' });
                }
                
                if (!apiKey) {
                    return res.status(400).json({ error: 'API key is required' });
                }
                
                const response = await this.callOpenAI(message, context, model, temperature, apiKey);
                res.json({ response });
                
            } catch (error) {
                console.error('Chat error:', error);
                res.status(500).json({ 
                    error: 'Internal server error',
                    message: error.message 
                });
            }
        });
        
        // Summarize page content
        this.app.post('/api/summarize', async (req, res) => {
            try {
                const { content, apiKey, model = 'gpt-3.5-turbo' } = req.body;
                
                if (!content) {
                    return res.status(400).json({ error: 'Content is required' });
                }
                
                if (!apiKey) {
                    return res.status(400).json({ error: 'API key is required' });
                }
                
                const prompt = `Please provide a concise summary of the following content. Focus on the main points and key information:\n\n${content}`;
                
                const response = await this.callOpenAI(prompt, null, model, 0.3, apiKey);
                res.json({ summary: response });
                
            } catch (error) {
                console.error('Summarize error:', error);
                res.status(500).json({ 
                    error: 'Internal server error',
                    message: error.message 
                });
            }
        });
        
        // Translate text
        this.app.post('/api/translate', async (req, res) => {
            try {
                const { text, targetLanguage = 'English', apiKey, model = 'gpt-3.5-turbo' } = req.body;
                
                if (!text) {
                    return res.status(400).json({ error: 'Text is required' });
                }
                
                if (!apiKey) {
                    return res.status(400).json({ error: 'API key is required' });
                }
                
                const prompt = `Please translate the following text to ${targetLanguage}. Only provide the translation without any additional text:\n\n${text}`;
                
                const response = await this.callOpenAI(prompt, null, model, 0.1, apiKey);
                res.json({ translation: response });
                
            } catch (error) {
                console.error('Translate error:', error);
                res.status(500).json({ 
                    error: 'Internal server error',
                    message: error.message 
                });
            }
        });
        
        // Explain content
        this.app.post('/api/explain', async (req, res) => {
            try {
                const { content, apiKey, model = 'gpt-3.5-turbo' } = req.body;
                
                if (!content) {
                    return res.status(400).json({ error: 'Content is required' });
                }
                
                if (!apiKey) {
                    return res.status(400).json({ error: 'API key is required' });
                }
                
                const prompt = `Please explain the following content in simple, easy-to-understand terms. Break down complex concepts and provide clear explanations:\n\n${content}`;
                
                const response = await this.callOpenAI(prompt, null, model, 0.5, apiKey);
                res.json({ explanation: response });
                
            } catch (error) {
                console.error('Explain error:', error);
                res.status(500).json({ 
                    error: 'Internal server error',
                    message: error.message 
                });
            }
        });
        
        // Error handling middleware
        this.app.use((error, req, res, next) => {
            console.error('Unhandled error:', error);
            res.status(500).json({ 
                error: 'Internal server error',
                message: 'An unexpected error occurred' 
            });
        });
        
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({ error: 'Endpoint not found' });
        });
    }
    
    async callOpenAI(message, context, model, temperature, apiKey) {
        try {
            const messages = [];
            
            // Add context if provided
            if (context) {
                if (context.title) {
                    messages.push({
                        role: 'system',
                        content: `You are a helpful AI assistant. The user is currently on a webpage titled "${context.title}" at ${context.url}. Use this context to provide more relevant responses.`
                    });
                }
                
                if (context.text) {
                    messages.push({
                        role: 'system',
                        content: `Here is some context from the current page: ${context.text.substring(0, 2000)}`
                    });
                }
                
                if (context.selectedText) {
                    messages.push({
                        role: 'system',
                        content: `The user has selected this text: "${context.selectedText}"`
                    });
                }
            }
            
            // Add the user's message
            messages.push({
                role: 'user',
                content: message
            });
            
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: model,
                messages: messages,
                temperature: temperature,
                max_tokens: 1000,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 second timeout
            });
            
            return response.data.choices[0].message.content.trim();
            
        } catch (error) {
            if (error.response) {
                const errorMessage = error.response.data?.error?.message || 'OpenAI API error';
                throw new Error(`OpenAI API Error: ${errorMessage}`);
            } else if (error.code === 'ECONNABORTED') {
                throw new Error('Request timeout - please try again');
            } else {
                throw new Error(`Network error: ${error.message}`);
            }
        }
    }
    
    start() {
        this.app.listen(this.port, () => {
            console.log(`AI Service running on port ${this.port}`);
            console.log(`Health check: http://localhost:${this.port}/health`);
        });
    }
}

// Start the service if this file is run directly
if (require.main === module) {
    const service = new AIService();
    service.start();
}

module.exports = AIService;

