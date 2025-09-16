# AI Assistant Chrome Extension

A powerful AI assistant integrated into your Chrome browser that can help you with various tasks including summarizing web pages, translating text, explaining content, and general chat assistance.

## Features

- 🤖 **AI Chat Interface**: Interactive chat with AI directly in your browser
- 📄 **Page Summarization**: Automatically summarize long web pages
- 🌐 **Text Translation**: Translate selected text or entire pages
- 💡 **Content Explanation**: Get simple explanations of complex content
- 🎯 **Context Awareness**: AI understands the current page context
- ⌨️ **Keyboard Shortcuts**: Quick access with Ctrl+Shift+A
- 🖱️ **Right-click Integration**: Context menu options for quick actions
- ⚙️ **Customizable Settings**: Configure AI model, temperature, and more

## Installation

### Option 1: Load as Unpacked Extension (Development)

1. **Clone or download this repository**
2. **Install Node.js dependencies** (for the backend service):
   ```bash
   npm install
   ```
3. **Start the AI service**:
   ```bash
   npm start
   ```
4. **Load the extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select this project folder
   - The AI Assistant extension should now appear in your extensions

### Option 2: Build and Package (Production)

1. Follow steps 1-3 from Option 1
2. In Chrome extensions page, click "Pack extension"
3. Select this project folder as the root directory
4. Install the generated `.crx` file

## Setup

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key (you'll need it for the extension)

### 2. Configure the Extension

1. Click the AI Assistant extension icon in your browser toolbar
2. Click the settings button (gear icon)
3. Enter your OpenAI API key
4. Choose your preferred AI model:
   - **GPT-3.5 Turbo**: Fast and cost-effective
   - **GPT-4**: More capable but slower and more expensive
   - **GPT-4 Turbo**: Latest model with improved performance
5. Adjust temperature (0.0 = focused, 1.0 = creative)
6. Save your settings

## Usage

### Chat Interface

1. **Open the extension popup** by clicking the AI Assistant icon
2. **Type your message** in the input field
3. **Press Enter or click Send** to get AI response
4. **Use quick actions** for common tasks:
   - Summarize Page
   - Translate
   - Explain

### Context Menu (Right-click)

Right-click on any webpage to access:
- **Summarize with AI Assistant**: Summarize the entire page
- **Explain with AI Assistant**: Explain selected text
- **Translate with AI Assistant**: Translate selected text
- **Chat with AI Assistant**: Open chat with page context

### Keyboard Shortcuts

- **Ctrl+Shift+A** (or Cmd+Shift+A on Mac): Toggle assistant panel on current page

### In-Page Assistant Panel

The extension can also show an assistant panel directly on web pages:
- Use keyboard shortcut to toggle
- Right-click and select "Chat with AI Assistant"
- The panel appears in the top-right corner of the page

## API Endpoints

The backend service provides the following endpoints:

- `POST /api/chat` - General chat with AI
- `POST /api/summarize` - Summarize content
- `POST /api/translate` - Translate text
- `POST /api/explain` - Explain content
- `GET /health` - Health check

## Configuration

### Environment Variables

You can set these environment variables for the backend service:

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

### Extension Settings

The extension stores settings in Chrome's sync storage:
- API Key (encrypted)
- AI Model selection
- Temperature setting
- Auto-summarize preference

## Development

### Project Structure

```
ai-assistant-chrome-extension/
├── manifest.json          # Extension manifest
├── popup.html             # Extension popup interface
├── popup.css              # Popup styles
├── popup.js               # Popup functionality
├── background.js          # Background service worker
├── content.js             # Content script
├── content.css            # Content script styles
├── ai-service.js          # Backend AI service
├── package.json           # Node.js dependencies
├── icons/                 # Extension icons
└── README.md             # This file
```

### Running in Development

1. **Start the backend service**:
   ```bash
   npm run dev  # Uses nodemon for auto-restart
   ```

2. **Load the extension** in Chrome as unpacked

3. **Make changes** to the code and reload the extension in Chrome

### Building for Production

1. **Install dependencies**:
   ```bash
   npm install --production
   ```

2. **Start the service**:
   ```bash
   npm start
   ```

3. **Package the extension** using Chrome's developer tools

## Troubleshooting

### Common Issues

1. **"API Key Required" error**:
   - Make sure you've entered a valid OpenAI API key in settings
   - Check that your API key has sufficient credits

2. **Extension not responding**:
   - Check if the backend service is running on port 3000
   - Reload the extension in Chrome
   - Check browser console for errors

3. **Context menu not appearing**:
   - Make sure the extension is enabled
   - Try refreshing the page
   - Check if you have the necessary permissions

4. **AI responses are slow**:
   - Try using GPT-3.5 Turbo instead of GPT-4
   - Check your internet connection
   - Reduce the amount of context being sent

### Debug Mode

To enable debug logging:
1. Open Chrome DevTools
2. Go to Console tab
3. Look for AI Assistant logs

## Security & Privacy

- **API Keys**: Stored securely in Chrome's sync storage
- **Data**: Only the content you interact with is sent to OpenAI
- **No Tracking**: The extension doesn't track or store your conversations
- **Local Processing**: The backend service runs locally on your machine

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Look at the GitHub issues
3. Create a new issue with detailed information

## Changelog

### Version 1.0.0
- Initial release
- Basic chat functionality
- Page summarization
- Text translation
- Content explanation
- Context menu integration
- Keyboard shortcuts
- Settings management

