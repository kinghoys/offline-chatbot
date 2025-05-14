/**
 * Offline AI Chatbot - Embed Script
 * Add this script to any website to include the chatbot widget
 * Usage: <script src="path/to/chatbot-embed.js" data-primary-color="#3a76f8" data-position="right"></script>
 */

(function() {
    // Create a loader function
    function loadChatbot() {
        // Get the script tag that loaded this script
        const scripts = document.getElementsByTagName('script');
        const currentScript = scripts[scripts.length - 1];
        
        // Get the base path from the script src
        const scriptSrc = currentScript.src;
        const basePath = scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1);
        
        // Get configuration options from data attributes
        const config = {
            position: currentScript.getAttribute('data-position') || 'right',
            primaryColor: currentScript.getAttribute('data-primary-color') || '#3a76f8',
            welcomeMessage: currentScript.getAttribute('data-welcome-message') || 'Hello! I am your AI assistant. How can I help you today?',
            title: currentScript.getAttribute('data-title') || 'AI Assistant'
        };
        
        // Load CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.type = 'text/css';
        cssLink.href = basePath + '../css/chatbot-widget.css';
        document.head.appendChild(cssLink);
        
        // Load the Ollama client script first
        const ollamaScript = document.createElement('script');
        ollamaScript.src = basePath + 'integrations/ollama-client.js';
        document.head.appendChild(ollamaScript);
        
        // Load the document processor scripts
        const vectorStoreScript = document.createElement('script');
        vectorStoreScript.src = basePath + 'document-processor/simple-vector-store.js';
        document.head.appendChild(vectorStoreScript);
        
        const documentProcessorScript = document.createElement('script');
        documentProcessorScript.src = basePath + 'document-processor/document-processor.js';
        document.head.appendChild(documentProcessorScript);
        
        const documentUIScript = document.createElement('script');
        documentUIScript.src = basePath + 'document-processor/document-ui.js';
        document.head.appendChild(documentUIScript);
        
        // Load the main chatbot script
        const chatbotScript = document.createElement('script');
        chatbotScript.src = basePath + 'chatbot-widget.js';
        chatbotScript.onload = function() {
            // Initialize the chatbot once loaded
            if (typeof OfflineAIChatbot !== 'undefined') {
                // Initialize Ollama client if available
                if (typeof OllamaClient !== 'undefined') {
                    OllamaClient.init({
                        model: 'llama3:8b'
                    });
                }
                
                // Initialize document processor if available
                if (typeof DocumentProcessor !== 'undefined') {
                    DocumentProcessor.init();
                }
                
                // Initialize document UI if available
                if (typeof DocumentUI !== 'undefined') {
                    DocumentUI.init();
                }
                
                // Initialize the chatbot
                OfflineAIChatbot.init(config);
            } else {
                console.error('Chatbot widget failed to load properly');
            }
        };
        
        // Wait for all scripts to load before loading the chatbot
        let scriptsLoaded = 0;
        const requiredScripts = 4; // Ollama, VectorStore, DocumentProcessor, DocumentUI
        
        function checkAllScriptsLoaded() {
            scriptsLoaded++;
            if (scriptsLoaded >= requiredScripts) {
                document.head.appendChild(chatbotScript);
            }
        }
        
        ollamaScript.onload = checkAllScriptsLoaded;
        vectorStoreScript.onload = checkAllScriptsLoaded;
        documentProcessorScript.onload = checkAllScriptsLoaded;
        documentUIScript.onload = checkAllScriptsLoaded;
        
        // Add error handling for scripts
        ollamaScript.onerror = function() {
            console.warn('Failed to load Ollama client, falling back to basic chatbot');
            checkAllScriptsLoaded();
        };
        
        vectorStoreScript.onerror = function() {
            console.warn('Failed to load vector store, document search will be limited');
            checkAllScriptsLoaded();
        };
        
        documentProcessorScript.onerror = function() {
            console.warn('Failed to load document processor, document handling will be limited');
            checkAllScriptsLoaded();
        };
        
        documentUIScript.onerror = function() {
            console.warn('Failed to load document UI, document interface will be limited');
            checkAllScriptsLoaded();
        };
    }
    
    // Load immediately if document is already loaded, otherwise wait for DOMContentLoaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(loadChatbot, 1);
    } else {
        document.addEventListener('DOMContentLoaded', loadChatbot);
    }
})();
