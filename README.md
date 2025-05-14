<div align="center">

# 🧠 Offline AI Chatbot for Websites

**A powerful, self-contained AI assistant that works 100% offline**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Built with JavaScript](https://img.shields.io/badge/Built_with-JavaScript-yellow.svg)](https://www.javascript.com/)
[![Powered by Ollama](https://img.shields.io/badge/Powered_by-Ollama-green.svg)](https://ollama.ai/)

</div>

<p align="center">
<i>Bring intelligent chat capabilities to any website with zero data leaving the user's device!</i>
</p>

## ✨ Features

- **🔒 100% Offline Operation** — Operates entirely without internet connectivity after initial setup
- **📄 Document Intelligence** — Analyze PDFs, DOCXs, and text files with sophisticated querying capabilities
- **🎨 Modern UI** — Clean, responsive interface with customizable themes and design elements
- **⚙️ Simple Integration** — Embed on any website with a single line of code
- **🛡️ Privacy by Design** — All data and processing stays on the user's device
- **🌐 Cross-Platform** — Works on all modern browsers and devices
- **📱 Responsive Design** — Adapts seamlessly to any screen size

## 🛠️ Technology Stack

<table>
  <tr>
    <td align="center"><b>Frontend</b></td>
    <td>
      <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"/>
      <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"/>
      <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
    </td>
  </tr>
  <tr>
    <td align="center"><b>Backend</b></td>
    <td>
      <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
      <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
    </td>
  </tr>
  <tr>
    <td align="center"><b>AI Engine</b></td>
    <td>
      <a href="https://ollama.ai/"><img src="https://img.shields.io/badge/Ollama-00A3E0?style=for-the-badge&logoColor=white" alt="Ollama"/></a>
      <img src="https://img.shields.io/badge/Llama_3-A100FF?style=for-the-badge&logoColor=white" alt="Llama 3"/>
    </td>
  </tr>
  <tr>
    <td align="center"><b>Document Processing</b></td>
    <td>
      <img src="https://img.shields.io/badge/PDF.js-FF0000?style=for-the-badge&logoColor=white" alt="PDF.js"/>
      <img src="https://img.shields.io/badge/Mammoth.js-5C2D91?style=for-the-badge&logoColor=white" alt="Mammoth.js"/>
      <img src="https://img.shields.io/badge/Vector_Search-4285F4?style=for-the-badge&logoColor=white" alt="Vector Search"/>
    </td>
  </tr>
</table>

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **Ollama** installed and running locally
  - [Download Ollama](https://ollama.ai/download)
  - Run `ollama pull llama3` to download the Llama 3 model
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation

<details>
<summary><b>Step 1: Clone the Repository</b></summary>

```bash
# Clone the repository
git clone https://github.com/yourusername/offline-ai-chatbot.git

# Navigate to the project directory
cd offline-ai-chatbot
```
</details>

<details>
<summary><b>Step 2: Install Dependencies</b></summary>

```bash
# Install project dependencies
npm install
```

This will install all required dependencies including:
- express
- ws (for WebSocket communication)
- pdf.js
- mammoth.js
- and other utilities
</details>

<details>
<summary><b>Step 3: Start the Server</b></summary>

```bash
# Start the local development server
node server.js
```

You should see output indicating the server is running:
```
Server running at http://localhost:3000
Offline AI Chatbot is available on the dummy website
```
</details>

<details>
<summary><b>Step 4: Access the Demo Site</b></summary>

Open your browser and navigate to:
- [http://localhost:3000](http://localhost:3000)

You should see the demo website with the chatbot icon in the bottom-right corner.
</details>

## 💻 Embedding on Your Website

<div align="center">

![Chatbot Embed Animation](https://via.placeholder.com/600x300/ffffff/666666?text=Chatbot+Embed+Animation)

</div>

### Basic Integration

Simply add the following script tag to your website's HTML:

```html
<script src="https://yourserver.com/chatbot/js/chatbot-embed.js" 
        data-position="right" 
        data-primary-color="#3a76f8" 
        data-title="AI Assistant">
</script>
```

### Customization Options

<table>
  <tr>
    <th>Attribute</th>
    <th>Description</th>
    <th>Default</th>
    <th>Example</th>
  </tr>
  <tr>
    <td><code>data-position</code></td>
    <td>Position of the chatbot bubble</td>
    <td><code>"right"</code></td>
    <td><code>data-position="left"</code></td>
  </tr>
  <tr>
    <td><code>data-primary-color</code></td>
    <td>Primary color (hex code)</td>
    <td><code>"#3a76f8"</code></td>
    <td><code>data-primary-color="#FF5722"</code></td>
  </tr>
  <tr>
    <td><code>data-title</code></td>
    <td>Chatbot title</td>
    <td><code>"AI Assistant"</code></td>
    <td><code>data-title="Support Bot"</code></td>
  </tr>
  <tr>
    <td><code>data-welcome-message</code></td>
    <td>Initial greeting message</td>
    <td><code>"Hello! How can I help you today?"</code></td>
    <td><code>data-welcome-message="Welcome to our support!"</code></td>
  </tr>
  <tr>
    <td><code>data-avatar</code></td>
    <td>URL to custom avatar image</td>
    <td>Default robot icon</td>
    <td><code>data-avatar="/images/bot.png"</code></td>
  </tr>
  <tr>
    <td><code>data-theme</code></td>
    <td>Color theme</td>
    <td><code>"light"</code></td>
    <td><code>data-theme="dark"</code></td>
  </tr>
</table>

### Advanced Setup

For more advanced customization and configuration, you can initialize the chatbot programmatically:

```html
<script src="https://yourserver.com/chatbot/js/chatbot-embed.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    OfflineChatbot.init({
      position: 'right',
      primaryColor: '#3a76f8',
      title: 'AI Assistant',
      welcomeMessage: 'Hello! How can I help you today?',
      theme: 'light',
      avatar: '/path/to/avatar.png',
      allowDocuments: true,
      allowVoice: true,
      // Other configuration options
    });
  });
</script>
```

## 📑 Document Intelligence

<div align="center">

![Document Analysis Demo](https://via.placeholder.com/600x300/ffffff/666666?text=Document+Analysis+Demo)

</div>

### Supported Document Formats

<table>
  <tr>
    <th>Format</th>
    <th>Extension</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>PDF Documents</td>
    <td><code>.pdf</code></td>
    <td>Handles multi-page PDFs with text extraction</td>
  </tr>
  <tr>
    <td>Word Documents</td>
    <td><code>.docx</code></td>
    <td>Processes Microsoft Word documents with formatting</td>
  </tr>
  <tr>
    <td>Text Files</td>
    <td><code>.txt</code>, <code>.md</code></td>
    <td>Simple text documents and Markdown files</td>
  </tr>
  <tr>
    <td>Data Files</td>
    <td><code>.json</code>, <code>.csv</code></td>
    <td>Structured data in JSON or CSV format</td>
  </tr>
</table>

### How Document Analysis Works

1. **Client-Side Processing**: 
   - Files are processed entirely in the browser
   - No documents are ever sent to a server

2. **Text Extraction**:
   - PDFs are processed using Mozilla's PDF.js library
   - Word documents are processed with Mammoth.js
   - Plain text files are read directly

3. **Content Chunking**:
   - Documents are split into manageable chunks
   - Each chunk maintains contextual information
   - This enables more accurate responses

4. **Vector Indexing**:
   - Key information is vectorized for quick retrieval
   - Custom vector search algorithm enables semantic search

5. **Local Storage**:
   - Documents are stored in browser's localStorage
   - Approximately 5-10MB storage capacity per browser
   - No information leaves the user's device

### Using Document Features

1. Click the document upload button (📎) in the chat interface
2. Select a document from your device
3. Wait for processing to complete (larger documents take longer)
4. Your document appears in the sidebar document list
5. Ask questions about the document content
6. AI responses will reference information from your documents

## ⚙️ Configuration Guide

<details>
<summary><b>Server Configuration</b></summary>

### Port and Network Settings

Edit `server.js` to modify server configuration:

```javascript
// Change the port number
const PORT = process.env.PORT || 3000;

// Configure CORS settings
app.use(cors({
  origin: '*',  // Restrict to specific domains in production
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Configure static file serving
app.use(express.static('public'));
app.use('/chatbot', express.static('chatbot'));
```

### Security Settings

For production deployments, consider:

- Restricting CORS to specific domains
- Adding rate limiting
- Implementing request validation
- Using HTTPS with proper certificates

</details>

<details>
<summary><b>UI Configuration</b></summary>

### Styling and Themes

The appearance of the chatbot can be customized by editing:

```
chatbot/css/chatbot-widget.css
```

Key CSS variables control the theme:

```css
:root {
  --chatbot-primary-color: #3a76f8;
  --chatbot-secondary-color: #f0f4fd;
  --chatbot-background: #ffffff;
  --chatbot-text-color: #333333;
  /* Additional variables... */
}
```

### Layout Options

You can modify the size and layout in the CSS file:

```css
.chatbot-container {
  width: 480px;      /* Width of the chatbot panel */
  height: 700px;     /* Height of the chatbot panel */
  /* Other properties... */
}
```

</details>

<details>
<summary><b>AI Model Configuration</b></summary>

### Model Selection

The chatbot uses Ollama with Llama 3 by default. To change the model, edit `ollama-client.js`:

```javascript
// Change the model name
const MODEL_NAME = 'llama3';  // Options: mistral, mixtral, llama2, etc.

// Adjust generation parameters
const params = {
  temperature: 0.7,    // Controls randomness (0.0-1.0)
  top_p: 0.9,          // Nucleus sampling parameter
  max_tokens: 2000,    // Maximum response length
  context_window: 4096, // Available context window
  // Other parameters...
};
```

### System Prompt

Customize the AI's personality and capabilities by modifying the system prompt:

```javascript
const SYSTEM_PROMPT = `You are a helpful AI assistant embedded in a website...
// Your custom instructions here`;
```

### Document Processing Settings

Adjust document handling in `document-processor.js`:

```javascript
const CHUNK_SIZE = 1000;        // Characters per chunk
const CHUNK_OVERLAP = 200;      // Overlap between chunks
const MAX_DOCUMENTS = 10;       // Maximum documents stored
```

</details>

## 🔧 Troubleshooting Guide

<details>
<summary><b>Connection Issues</b></summary>

### Ollama Connection Errors

**Problem**: "Failed to connect to Ollama API" error message

**Solutions**:

1. Check if Ollama is running:
   ```bash
   # Check if Ollama is running
   ollama ps
   ```

2. Verify the Ollama API endpoint in `ollama-client.js`:
   ```javascript
   const OLLAMA_ENDPOINT = 'http://localhost:11434/api/generate';
   ```

3. Confirm the model is downloaded:
   ```bash
   # List available models
   ollama list
   
   # Pull the model if not available
   ollama pull llama3
   ```

4. Check for firewall or antivirus blocking connections

</details>

<details>
<summary><b>Document Processing Issues</b></summary>

### Failed Document Uploads

**Problem**: Documents fail to process or display errors

**Solutions**:

1. Check browser console (F12) for specific error messages

2. Verify file size (keep under 5MB for best performance)

3. Ensure document format is supported (PDF, DOCX, TXT, etc.)

4. For PDFs with complex formatting or scanned content:
   - Ensure the PDF contains actual text, not just images
   - OCR processing for scanned documents is not supported in the browser

5. Clear localStorage to free up space:
   ```javascript
   // In browser console
   localStorage.clear()
   ```

</details>

<details>
<summary><b>Performance Optimization</b></summary>

### Slow Responses

**Problem**: AI responses are too slow

**Solutions**:

1. Use a more efficient model (smaller models like Mistral 7B are faster)

2. Adjust model parameters in `ollama-client.js`:
   ```javascript
   // For faster responses at the cost of quality
   temperature: 0.5,
   top_k: 40,
   max_tokens: 1000,
   ```

3. Reduce document chunk size in `document-processor.js`

4. Ensure your computer meets minimum requirements for running Ollama

</details>

## 📋 License

<div align="center">

<img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License"/>

</div>

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Your Name or Organization

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

<div align="center">

<table>
  <tr>
    <td align="center">
      <a href="https://ollama.ai/">
        <img src="https://img.shields.io/badge/Ollama-00A3E0?style=for-the-badge&logoColor=white" alt="Ollama"/><br/>
        <span>Local AI Model Hosting</span>
      </a>
    </td>
    <td align="center">
      <a href="https://mozilla.github.io/pdf.js/">
        <img src="https://img.shields.io/badge/PDF.js-FF0000?style=for-the-badge&logoColor=white" alt="PDF.js"/><br/>
        <span>PDF Processing</span>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/mwilliamson/mammoth.js">
        <img src="https://img.shields.io/badge/Mammoth.js-5C2D91?style=for-the-badge&logoColor=white" alt="Mammoth.js"/><br/>
        <span>DOCX Processing</span>
      </a>
    </td>
  </tr>
</table>

</div>

---

<div align="center">
Developed with ❤️ by Your Name/Organization
</div>
