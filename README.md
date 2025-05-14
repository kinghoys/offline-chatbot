# Offline AI Chatbot for Websites

An intelligent, self-contained AI assistant that works entirely offline, allowing website visitors to interact with an AI chatbot without requiring internet connectivity or external API calls.

## Features

- **100% Offline Operation**: Works without internet connectivity after initial setup
- **Document Analysis**: Upload and query PDF, DOCX, and text files
- **Modern UI**: Clean, responsive interface inspired by professional chat applications
- **Customizable**: Easy to embed on any website with simple configuration
- **Privacy-Focused**: All data and processing stays on the user's device

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js with Express server
- **AI Engine**: [Ollama](https://ollama.ai/) with Llama 3 model
- **Document Processing**:
  - PDF.js for PDF extraction
  - Mammoth.js for DOCX extraction
  - Custom chunking and vector search for document queries

## Quick Start

### Prerequisites

- Node.js (v18+)
- [Ollama](https://ollama.ai/) installed and running with Llama 3
- A modern web browser

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/offline-ai-chatbot.git
   cd offline-ai-chatbot
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   node server.js
   ```

4. Access the demo site at http://localhost:3000

## Embedding on Your Website

Add the following script tag to your website:

```html
<script src="https://yourserver.com/chatbot/js/chatbot-embed.js" 
        data-position="right" 
        data-primary-color="#3a76f8" 
        data-title="AI Assistant">
</script>
```

Customize attributes:
- `data-position`: "right" or "left" (default: "right")
- `data-primary-color`: Custom color hex code (default: "#3a76f8")
- `data-title`: Chatbot title (default: "AI Assistant")
- `data-welcome-message`: Custom greeting message

## Document Processing

The chatbot can analyze uploaded documents in the following formats:
- PDF (.pdf)
- Word (.docx)
- Text (.txt, .md)
- JSON (.json)
- CSV (.csv)

When a document is uploaded:
1. The file is processed client-side (no server upload)
2. Text is extracted using appropriate libraries
3. Content is chunked for efficient retrieval
4. Document is stored in browser's localStorage
5. AI uses the document content to answer specific questions

## Configuration

### Server Configuration

Edit `server.js` to customize:
- Port settings
- CORS settings
- Static file serving

### UI Configuration

Customize the appearance in `chatbot/css/chatbot-widget.css`

### AI Model Configuration

By default, the chatbot uses the Ollama-hosted Llama 3 model. You can modify `ollama-client.js` to:
- Change the model (e.g., Mixtral, Mistral)
- Adjust temperature, context window, and other parameters
- Customize system prompts

## Troubleshooting

### Common Issues

- **Ollama Connection Error**: Ensure Ollama is running locally
- **Document Processing Failures**: Check browser console for errors
- **Memory Limitations**: Large documents may exceed browser storage limits

## License

MIT License

## Acknowledgments

- [Ollama](https://ollama.ai/) for the local AI model hosting
- [PDF.js](https://mozilla.github.io/pdf.js/) for PDF processing
- [Mammoth.js](https://github.com/mwilliamson/mammoth.js) for DOCX processing

---

Developed by [Your Name/Organization]
