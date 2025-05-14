/**
 * Offline AI Chatbot Widget
 * A standalone, embeddable chatbot widget for websites
 */

// Create a self-contained module using IIFE to avoid global namespace pollution
const OfflineAIChatbot = (function() {
    // Private variables
    let config = {
        position: 'right',
        primaryColor: '#3a76f8',
        welcomeMessage: 'Hello! How can I help you today?',
        title: 'AI Assistant',
        showSidebar: true
    };
    
    let state = {
        isOpen: false,
        isExpanded: false,
        activeFeature: 'chat',
        messages: [],
        history: [],
        documents: [], // Store uploaded documents
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        dragStartWidth: 0,
        dragStartHeight: 0
    };
    
    // DOM elements
    let elements = {
        container: null,
        bubble: null,
        panel: null,
        sidebar: null,
        historyPanel: null,
        mainPanel: null,
        messagesContainer: null,
        inputField: null,
        sendButton: null,
        resizeHandle: null
    };
    
    // Initialize the chatbot
    function init(userConfig = {}) {
        // Merge user config with defaults
        config = {...config, ...userConfig};
        
        // Create DOM elements
        createDOM();
        
        // Set up event listeners
        setupEventListeners();
        
        // Add welcome message
        if (config.welcomeMessage) {
            addMessage('bot', config.welcomeMessage);
        }
        
        // Start with chatbot collapsed
        elements.panel.style.display = 'none';
        elements.bubble.style.display = 'flex';
        
        // Apply styles based on config
        applyStyles();
    }
    
    // Create DOM structure
    function createDOM() {
        // Create container
        elements.container = document.createElement('div');
        elements.container.className = 'chatbot-container';
        
        // Create chat bubble (collapsed state)
        elements.bubble = document.createElement('div');
        elements.bubble.className = 'chatbot-bubble';
        elements.bubble.innerHTML = '🧠';
        elements.container.appendChild(elements.bubble);
        
        // Create panel (expanded state)
        elements.panel = document.createElement('div');
        elements.panel.className = 'chatbot-panel';
        elements.container.appendChild(elements.panel);
        
        // Create sidebar
        elements.sidebar = document.createElement('div');
        elements.sidebar.className = 'chatbot-sidebar';
        elements.panel.appendChild(elements.sidebar);
        
        // Create sidebar icons
        createSidebarIcons();
        
        // Create history panel
        elements.historyPanel = document.createElement('div');
        elements.historyPanel.className = 'chatbot-history';
        elements.panel.appendChild(elements.historyPanel);
        
        // Create history content
        createHistoryPanel();
        
        // Create main panel
        elements.mainPanel = document.createElement('div');
        elements.mainPanel.className = 'chatbot-main';
        elements.panel.appendChild(elements.mainPanel);
        
        // Create main panel content
        createMainPanel();
        
        // Create resize handle
        elements.resizeHandle = document.createElement('div');
        elements.resizeHandle.className = 'resize-handle';
        elements.panel.appendChild(elements.resizeHandle);
        
        // Add to the document
        document.body.appendChild(elements.container);
        
        // Start collapsed
        elements.panel.style.display = 'none';
        elements.bubble.style.display = 'flex';
    }
    
    // Create sidebar icons
    function createSidebarIcons() {
        const icons = [
            { id: 'chat', icon: '💬', title: 'Chat' },
            { id: 'document', icon: '📄', title: 'Documents' },
            { id: 'voice', icon: '🎤', title: 'Voice' },
            { id: 'meeting', icon: '📝', title: 'Meetings' },
            { id: 'settings', icon: '⚙️', title: 'Settings' }
        ];
        
        icons.forEach(item => {
            const icon = document.createElement('div');
            icon.className = 'sidebar-icon';
            icon.dataset.feature = item.id;
            icon.innerHTML = item.icon;
            icon.title = item.title;
            
            if (item.id === 'chat') {
                icon.classList.add('active');
            }
            
            elements.sidebar.appendChild(icon);
        });
    }
    
    // Create history panel content
    function createHistoryPanel() {
        // Header
        const header = document.createElement('div');
        header.className = 'history-header';
        header.innerHTML = '<h3>AI Assistant</h3>';
        elements.historyPanel.appendChild(header);
        
        // New chat button
        const newChatBtn = document.createElement('div');
        newChatBtn.className = 'new-chat-btn';
        newChatBtn.textContent = '+ New Chat';
        elements.historyPanel.appendChild(newChatBtn);
        
        // Search
        const search = document.createElement('div');
        search.className = 'history-search';
        search.innerHTML = '<input type="text" placeholder="Search chats...">';
        elements.historyPanel.appendChild(search);
        
        // History list
        const historyList = document.createElement('div');
        historyList.className = 'history-list';
        historyList.innerHTML = '<div class="history-empty">No chat history yet</div>';
        elements.historyPanel.appendChild(historyList);
    }
    
    // Create main panel content
    function createMainPanel() {
        // Chat header - modernized with Cascade style
        const chatHeader = document.createElement('div');
        chatHeader.className = 'chatbot-header';
        
        // Create a title with an icon
        const chatTitle = document.createElement('div');
        chatTitle.className = 'chatbot-title';
        chatTitle.innerHTML = `<span class="chatbot-title-icon">💬</span> ${config.title}`;
        chatHeader.appendChild(chatTitle);
        
        const chatControls = document.createElement('div');
        chatControls.className = 'chat-controls';
        
        // Expand button
        const expandBtn = document.createElement('button');
        expandBtn.className = 'control-btn expand-btn';
        expandBtn.innerHTML = '⤢';
        expandBtn.title = 'Expand';
        expandBtn.addEventListener('click', toggleExpand);
        
        // Minimize button
        const minimizeBtn = document.createElement('button');
        minimizeBtn.className = 'control-btn minimize-btn';
        minimizeBtn.innerHTML = '−';
        minimizeBtn.title = 'Minimize';
        minimizeBtn.addEventListener('click', toggleChat);
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'control-btn close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.title = 'Close';
        closeBtn.addEventListener('click', toggleChat);
        
        chatControls.appendChild(expandBtn);
        chatControls.appendChild(minimizeBtn);
        chatControls.appendChild(closeBtn);
        
        chatHeader.appendChild(chatControls);
        
        elements.mainPanel.appendChild(chatHeader);
        
        // Messages container
        elements.messagesContainer = document.createElement('div');
        elements.messagesContainer.className = 'chat-messages';
        elements.mainPanel.appendChild(elements.messagesContainer);
        
        // Hidden file input for document uploads
        elements.fileInput = document.createElement('input');
        elements.fileInput.type = 'file';
        elements.fileInput.id = 'chatbot-file-upload';
        elements.fileInput.accept = '.pdf,.docx,.txt,.md,.csv,.json';
        elements.fileInput.style.display = 'none';
        elements.fileInput.addEventListener('change', handleFileUpload);
        elements.mainPanel.appendChild(elements.fileInput);
        
        // Modern chat input area - Cascade style
        const chatInputWrapper = document.createElement('div');
        chatInputWrapper.className = 'chat-input-wrapper';
        
        // Input field with buttons container
        const inputContainer = document.createElement('div');
        inputContainer.className = 'chat-input';
        
        // Upload button
        const fileUploadBtn = document.createElement('button');
        fileUploadBtn.className = 'input-action-btn';
        fileUploadBtn.innerHTML = '📎';
        fileUploadBtn.title = 'Upload document';
        fileUploadBtn.addEventListener('click', () => elements.fileInput.click());
        
        // Input field (textarea for multi-line support)
        elements.inputField = document.createElement('textarea');
        elements.inputField.className = 'chat-input-field';
        elements.inputField.placeholder = 'Type your message here...';
        elements.inputField.rows = 1;
        
        // Add auto-resize to textarea
        elements.inputField.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
        
        // Voice input button (placeholder for future functionality)
        const voiceBtn = document.createElement('button');
        voiceBtn.className = 'input-action-btn';
        voiceBtn.innerHTML = '🎤';
        voiceBtn.title = 'Voice input';
        
        // Send button
        elements.sendButton = document.createElement('button');
        elements.sendButton.className = 'input-send-btn';
        elements.sendButton.innerHTML = '↑';
        elements.sendButton.title = 'Send message';
        
        // Add the elements to the input container
        inputContainer.appendChild(fileUploadBtn);
        inputContainer.appendChild(elements.inputField);
        inputContainer.appendChild(voiceBtn);
        inputContainer.appendChild(elements.sendButton);
        
        // Add input container to the wrapper
        chatInputWrapper.appendChild(inputContainer);
        
        // Add the input wrapper to the main panel
        elements.mainPanel.appendChild(chatInputWrapper);
        
        // Feature-specific panels (initially hidden)
        createFeaturePanels();
    }
    
    // Create specific panels for different features
    function createFeaturePanels() {
        // Document panel
        const documentPanel = document.createElement('div');
        documentPanel.className = 'feature-panel document-panel';
        documentPanel.innerHTML = `
            <div class="chat-header">
                <h3>Document Analysis</h3>
                <div class="chat-controls">
                    <button class="control-btn back-btn">←</button>
                </div>
            </div>
            <div class="document-content">
                <div class="documents-list-container">
                    <p>Your documents will appear here</p>
                    <div class="document-panel-list"></div>
                </div>
            </div>
        `;
        elements.panel.appendChild(documentPanel);
        
        // Voice panel
        const voicePanel = document.createElement('div');
        voicePanel.className = 'feature-panel voice-panel';
        voicePanel.innerHTML = `
            <div class="chat-header">
                <h3>Voice Assistant</h3>
                <div class="chat-controls">
                    <button class="control-btn back-btn">←</button>
                </div>
            </div>
            <div class="voice-content">
                <div class="voice-controls">
                    <p>Click to start speaking</p>
                    <button class="mic-btn">🎤</button>
                </div>
            </div>
        `;
        elements.panel.appendChild(voicePanel);
        
        // Meeting panel
        const meetingPanel = document.createElement('div');
        meetingPanel.className = 'feature-panel meeting-panel';
        meetingPanel.innerHTML = `
            <div class="chat-header">
                <h3>Meeting Recorder</h3>
                <div class="chat-controls">
                    <button class="control-btn back-btn">←</button>
                </div>
            </div>
            <div class="meeting-content">
                <div class="meeting-controls">
                    <p>Record and analyze meetings</p>
                    <button class="record-btn">⏺ Record</button>
                </div>
            </div>
        `;
        elements.panel.appendChild(meetingPanel);
        
        // Settings panel
        const settingsPanel = document.createElement('div');
        settingsPanel.className = 'feature-panel settings-panel';
        settingsPanel.innerHTML = `
            <div class="chat-header">
                <h3>Settings</h3>
                <div class="chat-controls">
                    <button class="control-btn back-btn">←</button>
                </div>
            </div>
            <div class="settings-content">
                <div class="settings-group">
                    <h4>General</h4>
                    <div class="setting-item">
                        <label>Theme</label>
                        <select>
                            <option>Light</option>
                            <option>Dark</option>
                            <option>System</option>
                        </select>
                    </div>
                </div>
                <div class="settings-group">
                    <h4>AI Model</h4>
                    <div class="setting-item">
                        <label>Model</label>
                        <select>
                            <option>Llama 3 (7B)</option>
                            <option>Mistral (7B)</option>
                            <option>Mixtral (8x7B)</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
        elements.panel.appendChild(settingsPanel);
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Toggle chat open/close
        elements.bubble.addEventListener('click', toggleChat);
        
        // Close button
        const closeBtn = elements.mainPanel.querySelector('.close-btn');
        closeBtn.addEventListener('click', toggleChat);
        
        // Expand button
        const expandBtn = elements.mainPanel.querySelector('.expand-btn');
        expandBtn.addEventListener('click', toggleExpand);
        
        // Send message
        elements.sendButton.addEventListener('click', sendMessage);
        elements.inputField.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Document upload button
        const docUploadBtn = elements.mainPanel.querySelector('.doc-upload-btn');
        if (docUploadBtn) {
            docUploadBtn.addEventListener('click', function() {
                elements.fileInput.click();
            });
        }
        
        // File input change event
        if (elements.fileInput) {
            elements.fileInput.addEventListener('change', handleFileUpload);
        }
        
        // Voice input button
        const voiceBtn = elements.mainPanel.querySelector('.voice-btn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', function() {
                // Voice input functionality will be implemented later
                alert('Voice input feature coming soon!');
            });
        }
        
        // Resize functionality
        elements.resizeHandle.addEventListener('mousedown', startResize);
        
        // Feature switching
        const sidebarIcons = elements.sidebar.querySelectorAll('.sidebar-icon');
        sidebarIcons.forEach(icon => {
            icon.addEventListener('click', function() {
                switchFeature(this.dataset.feature);
            });
        });
        
        // Back buttons
        const backButtons = elements.panel.querySelectorAll('.back-btn');
        backButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                switchFeature('chat');
            });
        });
        
        // New chat button
        const newChatBtn = elements.historyPanel.querySelector('.new-chat-btn');
        newChatBtn.addEventListener('click', function() {
            state.messages = [];
            updateMessages();
            addMessage('bot', config.welcomeMessage);
        });
    }
    
    // Global event listeners
    document.addEventListener('mouseup', stopResize);
    document.addEventListener('mousemove', resize);
    
    // Toggle chat open/close
    function toggleChat() {
        state.isOpen = !state.isOpen;
        
        if (state.isOpen) {
            elements.bubble.style.display = 'none';
            elements.panel.style.display = 'flex';
        } else {
            elements.panel.style.display = 'none';
            elements.bubble.style.display = 'flex';
        }
    }
    
    // Toggle expanded view
    function toggleExpand() {
        state.isExpanded = !state.isExpanded;
        
        if (state.isExpanded) {
            elements.panel.classList.add('expanded');
        } else {
            elements.panel.classList.remove('expanded');
        }
    }
    
    // Switch features
    function switchFeature(feature) {
        // Check if this feature is already active (toggle behavior)
        if (state.activeFeature === feature && feature !== 'chat') {
            // If clicking the same feature button again, go back to chat
            feature = 'chat';
        }
        
        // Update active state
        state.activeFeature = feature;
        
        // Update sidebar icons
        const icons = elements.sidebar.querySelectorAll('.sidebar-icon');
        icons.forEach(icon => {
            icon.classList.remove('active');
            if (icon.dataset.feature === feature) {
                icon.classList.add('active');
            }
        });
        
        // Hide all feature panels
        const featurePanels = elements.panel.querySelectorAll('.feature-panel');
        featurePanels.forEach(panel => {
            panel.classList.remove('active');
        });
        
        // Show main chat or selected feature
        if (feature === 'chat') {
            elements.mainPanel.style.display = 'flex';
        } else {
            elements.mainPanel.style.display = 'none';
            const activePanel = elements.panel.querySelector(`.${feature}-panel`);
            if (activePanel) {
                activePanel.classList.add('active');
            }
        }
        
        // Always expand when switching features other than chat
        if (feature !== 'chat' && !state.isExpanded) {
            toggleExpand();
        }
    }
    
    // Send a message
    function sendMessage() {
        const message = elements.inputField.value.trim();
        
        if (!message) return;
        
        // Add user message
        addMessage('user', message);
        
        // Clear input
        elements.inputField.value = '';
        
        // Call Ollama for the response
        getBotResponse(message);
    }
    
    // Add a message to the chat
    function addMessage(sender, text) {
        state.messages.push({
            sender: sender,
            text: text,
            timestamp: new Date().toISOString()
        });
        
        updateMessages();
    }
    
    // Update the messages display
    function updateMessages() {
        elements.messagesContainer.innerHTML = '';
        
        state.messages.forEach(msg => {
            // Create message container
            const messageEl = document.createElement('div');
            messageEl.className = `message ${msg.sender}-message`;
            
            // Create message content container
            const messageContent = document.createElement('div');
            messageContent.className = `message-content ${msg.sender}-message-content`;
            messageContent.textContent = msg.text;
            
            // Add message content to message container
            messageEl.appendChild(messageContent);
            elements.messagesContainer.appendChild(messageEl);
        });
        
        // Scroll to bottom
        elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
    }
    
    // Get response from Ollama
    function getBotResponse(userMessage) {
        // No loading message anymore since Ollama responds quickly enough

        // Check if the OllamaClient is available
        if (typeof OllamaClient === 'undefined') {
            console.error('OllamaClient not found. Falling back to placeholder response.');
            addMessage('bot', 'Sorry, I cannot connect to the AI model right now. Please make sure Ollama is running correctly.');
            return;
        }
        
        // Format history for Ollama
        const historyForOllama = state.messages.map(msg => ({
            sender: msg.sender,
            text: msg.text
        }));
        
        // Check if we need to add document context
        let enhancedPrompt = userMessage;
        let documentContext = '';
        
        // If DocumentProcessor is available, check for relevant document context
        if (typeof DocumentProcessor !== 'undefined' && state.documents.length > 0) {
            // Check if the message is asking about documents or if we're just uploaded a document
            const isDocumentQuery = userMessage.toLowerCase().includes('document') || 
                                    userMessage.toLowerCase().includes('file') ||
                                    userMessage.toLowerCase().includes('pdf') ||
                                    userMessage.toLowerCase().includes('text') ||
                                    userMessage.toLowerCase().includes('uploaded') ||
                                    userMessage.toLowerCase().includes('analyze') ||
                                    userMessage.toLowerCase().includes('content');
            
            // Always include document context if the previous message was about uploading a document
            const lastBotMessage = state.messages.length > 1 ? state.messages[state.messages.length - 2] : null;
            const wasDocUploadMessage = lastBotMessage && 
                                      lastBotMessage.sender === 'bot' && 
                                      lastBotMessage.text.includes('Processing document');
            
            if (isDocumentQuery || wasDocUploadMessage) {
                try {
                    console.log('Searching for document context...');
                    // If we just uploaded a document, use the most recent one
                    if (wasDocUploadMessage && state.documents.length > 0) {
                        // Sort documents by timestamp (newest first)
                        const sortedDocs = [...state.documents].sort((a, b) => {
                            return new Date(b.timestamp) - new Date(a.timestamp);
                        });
                        
                        const latestDoc = sortedDocs[0];
                        console.log('Using latest document:', latestDoc.name);
                        
                        // Get actual document content or full preview
                        let documentContent = latestDoc.content || latestDoc.preview;
                        
                        // If DocumentProcessor is available, try to get more comprehensive content via chunks
                        if (typeof DocumentProcessor !== 'undefined') {
                            const docChunks = DocumentProcessor.queryDocuments(latestDoc.name, 5);
                            if (docChunks && docChunks.length > 0) {
                                // Collect all text from chunks
                                documentContent = docChunks.map(result => result.chunk.text).join('\n\n');
                                console.log(`Using ${docChunks.length} chunks for document content`);
                            }
                        }
                        
                        // Truncate if extremely large to avoid context limit issues
                        if (documentContent.length > 5000) {
                            documentContent = documentContent.substring(0, 5000) + '... [content truncated due to length]';
                        }
                        
                        // Create system instruction for document analysis
                        documentContext = `\n\n### Document Analysis Task\n\nYou are analyzing this document. THIS IS AN ACTUAL DOCUMENT THE USER HAS UPLOADED. Do not say you cannot access files. Treat this document as if you have full access to it.\n\nDocument Name: ${latestDoc.name}\nDocument Type: ${latestDoc.type.toUpperCase()}\nFile Size: ${formatFileSize(latestDoc.size)}\n\nDocument Content:\n\n${documentContent}\n\nYour task is to analyze this document content thoroughly. Provide specific details from the document to support your analysis.\n`;
                        
                        // Enhance the prompt with document context
                        enhancedPrompt = documentContext + '\n\nUser question: ' + userMessage + '\n\nProvide a detailed analysis addressing the user question directly. Cite specific parts of the document.';
                        
                        console.log('Enhanced prompt with document content of length:', documentContent.length);
                    } else {
                        // Search for relevant document chunks
                        const results = DocumentProcessor.queryDocuments(userMessage, 3);
                        
                        if (results && results.length > 0) {
                            console.log('Found relevant document chunks:', results.length);
                            documentContext = '\n\n### Document Analysis Task\n\nI need you to analyze the following document excerpts and provide insights. Treat this as a document you have direct access to.\n\n';
                            
                            results.forEach((result, index) => {
                                documentContext += `\n[Document: ${result.document.name}, Section ${index+1}]\n${result.chunk.text}\n`;
                            });
                            
                            // Enhance the prompt with document context
                            enhancedPrompt = documentContext + '\n\nUser question: ' + userMessage + '\n\nBased on these document excerpts, provide a thorough analysis and answer the user\'s question directly.';
                        }
                    }
                } catch (error) {
                    console.error('Error querying documents:', error);
                }
            }
        }
        
        // Create a unique ID for this message stream
        const messageStreamId = 'msg-' + Date.now();
        let messageEl = null;
        let isFirstChunk = true;
        
        // Stream response from Ollama
        OllamaClient.generateCompletionStream(
            enhancedPrompt,
            historyForOllama,
            // On each chunk received
            (chunk) => {
                // If this is the first chunk, create a new message element
                if (isFirstChunk) {
                    isFirstChunk = false;
                    
                    // Add the new message to state
                    state.messages.push({
                        sender: 'bot',
                        text: chunk,
                        timestamp: new Date().toISOString(),
                        id: messageStreamId
                    });
                    
                    // Create the message element
                    messageEl = document.createElement('div');
                    messageEl.className = 'message bot-message';
                    messageEl.id = messageStreamId;
                    
                    // Create message content container
                    const messageContent = document.createElement('div');
                    messageContent.className = 'message-content bot-message-content';
                    messageContent.textContent = chunk;
                    
                    // Add message content to message container
                    messageEl.appendChild(messageContent);
                    elements.messagesContainer.appendChild(messageEl);
                    
                    // Scroll to show new message
                    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
                } else {
                    // Append to the last message without redrawing everything
                    state.messages[state.messages.length - 1].text += chunk;
                    
                    // Update just the content of the existing message element
                    if (!messageEl) {
                        messageEl = document.getElementById(messageStreamId) || 
                                  elements.messagesContainer.lastElementChild;
                    }
                    
                    if (messageEl && messageEl.querySelector('.message-content')) {
                        messageEl.querySelector('.message-content').textContent = 
                            state.messages[state.messages.length - 1].text;
                            
                        // Keep scrolling down as content is added
                        elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
                    }
                }
            },
            // On complete
            (fullResponse) => {
                console.log('Response completed');
                
                // Add to history
                if (state.history.length === 0 || state.history[0].id !== Date.now()) {
                    state.history.unshift({
                        id: Date.now(),
                        title: userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : ''),
                        lastMessage: new Date().toISOString(),
                        messages: [...state.messages]
                    });
                    
                    updateHistory();
                }
            },
            // On error
            (error) => {
                console.error('Error from Ollama:', error);
                
                // Show error message
                addMessage('bot', 'Sorry, I encountered an error while generating a response. Please check if Ollama is running correctly.');
            }
        );
    }
    
    // Update history display
    function updateHistory() {
        const historyList = elements.historyPanel.querySelector('.history-list');
        historyList.innerHTML = '';
        
        if (state.history.length === 0) {
            historyList.innerHTML = '<div class="history-empty">No chat history yet</div>';
            return;
        }
        
        state.history.forEach(chat => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.dataset.id = chat.id;
            historyItem.textContent = chat.title;
            historyList.appendChild(historyItem);
            
            // Add click event to load this chat
            historyItem.addEventListener('click', function() {
                const chatId = this.dataset.id;
                loadChat(chatId);
            });
        });
    }
    
    // Load a chat from history
    function loadChat(chatId) {
        const chat = state.history.find(c => c.id == chatId);
        if (chat) {
            state.messages = [...chat.messages];
            updateMessages();
            
            // Switch to chat if in another feature
            if (state.activeFeature !== 'chat') {
                switchFeature('chat');
            }
        }
    }
    
    // Start resize operation
    function startResize(e) {
        state.isDragging = true;
        state.dragStartX = e.clientX;
        state.dragStartY = e.clientY;
        state.dragStartWidth = elements.panel.offsetWidth;
        state.dragStartHeight = elements.panel.offsetHeight;
        
        e.preventDefault();
    }
    
    // Handle resize
    function resize(e) {
        if (!state.isDragging) return;
        
        const newWidth = state.dragStartWidth + (e.clientX - state.dragStartX);
        const newHeight = state.dragStartHeight + (e.clientY - state.dragStartY);
        
        // Apply minimum sizes
        elements.panel.style.width = Math.max(300, newWidth) + 'px';
        elements.panel.style.height = Math.max(400, newHeight) + 'px';
    }
    
    // Stop resize operation
    function stopResize() {
        state.isDragging = false;
    }
    
    // Handle file upload
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Check file type
        const validTypes = ['.pdf', '.docx', '.txt', '.md', '.csv', '.json'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
        if (!validTypes.includes(fileExtension.toLowerCase())) {
            alert('Unsupported file type. Please upload PDF, DOCX, TXT, MD, CSV, or JSON files.');
            return;
        }
        
        // Add loading message
        addMessage('bot', `Processing document: ${file.name}...`);
        
        // Process document using DocumentProcessor
        if (typeof DocumentProcessor !== 'undefined') {
            DocumentProcessor.processDocument(file)
                .then(result => {
                    // Get the processed document
                    const processedDoc = DocumentProcessor.getDocument(result.documentId);
                    
                    // Create a simplified document object for our state
                    const simplifiedDoc = {
                        id: processedDoc.id,
                        name: processedDoc.name,
                        type: processedDoc.type,
                        size: file.size,
                        preview: processedDoc.content.substring(0, 200) + '...',
                        timestamp: processedDoc.timestamp
                    };
                    
                    // Add to documents array
                    state.documents.push(simplifiedDoc);
                    
                    // Replace loading message with document message
                    state.messages.pop(); // Remove loading message
                    
                    // Add document message
                    const docElement = createDocumentElement(simplifiedDoc);
                    elements.messagesContainer.appendChild(docElement);
                    
                    // Auto scroll to bottom
                    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
                    
                    // Update documents list in sidebar if needed
                    updateDocumentsList();
                    
                    // Clear file input for next upload
                    elements.fileInput.value = '';
                    
                    // Send message about document with chunk count info
                    let message = `I've uploaded a document called ${file.name}.`;
                    if (result.chunkCount) {
                        message += ` The document has been processed into ${result.chunkCount} chunks for analysis.`;
                    }
                    message += ' Can you analyze it and tell me what it contains?';
                    
                    getBotResponse(message);
                })
                .catch(error => {
                    alert('Error processing document: ' + error.message);
                    // Remove loading message
                    state.messages.pop();
                    updateMessages();
                    // Clear file input
                    elements.fileInput.value = '';
                });
        } else {
            // Fallback to simple file reading if DocumentProcessor is not available
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                let preview = '';
                
                // Generate preview (first 200 chars)
                if (fileExtension === '.pdf') {
                    preview = 'PDF document (preview not available)';
                } else {
                    preview = content.substring(0, 200) + '...';
                }
                
                // Create document ID
                const docId = 'doc-' + Date.now();
                
                // Create document object
                const document = {
                    id: docId,
                    name: file.name,
                    type: fileExtension.substring(1), // Remove the dot
                    size: file.size,
                    content: content,
                    preview: preview,
                    timestamp: new Date().toISOString()
                };
                
                // Add to documents array
                state.documents.push(document);
                
                // Replace loading message with document message
                state.messages.pop(); // Remove loading message
                
                // Add document message
                const docElement = createDocumentElement(document);
                elements.messagesContainer.appendChild(docElement);
                
                // Auto scroll to bottom
                elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
                
                // Update documents list in sidebar if needed
                updateDocumentsList();
                
                // Clear file input for next upload
                elements.fileInput.value = '';
                
                // Send message about document
                getBotResponse(`I've uploaded a document called ${file.name}. Can you analyze it and tell me what it contains?`);
            };
            
            reader.onerror = function() {
                alert('Error reading file.');
                // Remove loading message
                state.messages.pop();
                updateMessages();
            };
            
            // Read as text (works for txt, csv, etc.)
            reader.readAsText(file);
        }
    }
    
    // Create document element for chat
    function createDocumentElement(docObj) {
        const docElement = document.createElement('div');
        docElement.className = 'document-message';
        docElement.dataset.documentId = docObj.id;
        
        const titleElement = document.createElement('div');
        titleElement.className = 'document-title';
        titleElement.textContent = docObj.name;
        
        const previewElement = document.createElement('div');
        previewElement.className = 'document-preview';
        previewElement.textContent = docObj.preview;
        
        const actionsElement = document.createElement('div');
        actionsElement.className = 'document-actions';
        
        const askButton = document.createElement('button');
        askButton.className = 'document-action-btn';
        askButton.textContent = 'Ask about this';
        askButton.addEventListener('click', function() {
            elements.inputField.value = `Tell me about the document ${docObj.name}`;
            elements.inputField.focus();
        });
        
        actionsElement.appendChild(askButton);
        
        docElement.appendChild(titleElement);
        docElement.appendChild(previewElement);
        docElement.appendChild(actionsElement);
        
        return docElement;
    }
    
    // Update documents list in sidebar and document panel
    function updateDocumentsList() {
        // 1. Update sidebar documents list
        // Check if we have a documents list container
        let documentsContainer = elements.historyPanel.querySelector('.documents-list');
        
        // If not, create one
        if (!documentsContainer) {
            // Add a divider
            const divider = document.createElement('div');
            divider.className = 'history-divider';
            divider.innerHTML = '<span>Documents</span>';
            elements.historyPanel.appendChild(divider);
            
            // Create documents list
            documentsContainer = document.createElement('div');
            documentsContainer.className = 'documents-list chatbot-documents-list';
            elements.historyPanel.appendChild(documentsContainer);
        }
        
        // Clear existing list
        documentsContainer.innerHTML = '';
        
        // If no documents
        if (state.documents.length === 0) {
            documentsContainer.innerHTML = '<div class="history-empty">No documents uploaded</div>';
        } else {
            // Add documents to sidebar list
            createDocumentListItems(documentsContainer);
        }
        
        // 2. Update document panel list if it exists
        const documentPanelList = elements.panel ? elements.panel.querySelector('.document-panel-list') : null;
        if (documentPanelList) {
            documentPanelList.innerHTML = '';
            
            if (state.documents.length === 0) {
                documentPanelList.innerHTML = '<div class="no-documents">No documents have been uploaded yet. Use the document upload button above the chat input to add documents.</div>';
            } else {
                // Create a heading
                const heading = document.createElement('h4');
                heading.className = 'document-panel-heading';
                heading.textContent = 'Your Documents';
                documentPanelList.appendChild(heading);
                
                // Add documents to panel list
                createDocumentListItems(documentPanelList, true);
            }
        }
    }
    // Helper function to create document list items
    function createDocumentListItems(container, isPanel = false) {
        state.documents.forEach(doc => {
            const documentItem = document.createElement('div');
            documentItem.className = isPanel ? 'document-panel-item' : 'document-item';
            documentItem.dataset.documentId = doc.id;
            
            const documentIcon = document.createElement('span');
            documentIcon.className = 'document-icon';
            documentIcon.innerHTML = '📄';
            
            const documentInfo = document.createElement('div');
            documentInfo.className = 'document-info';
            
            const documentName = document.createElement('div');
            documentName.className = 'document-name';
            documentName.textContent = doc.name;
            
            const documentMeta = document.createElement('div');
            documentMeta.className = 'document-meta';
            // Format file size
            const fileSize = doc.size < 1024 ? `${doc.size} B` : 
                           doc.size < 1048576 ? `${Math.round(doc.size/1024)} KB` : 
                           `${Math.round(doc.size/1048576)} MB`;
            documentMeta.textContent = `${doc.type.toUpperCase()} · ${fileSize}`;
            
            documentInfo.appendChild(documentName);
            documentInfo.appendChild(documentMeta);
            
            documentItem.appendChild(documentIcon);
            documentItem.appendChild(documentInfo);
            
            // Add click event to reference this document in chat
            documentItem.addEventListener('click', function() {
                // Return to chat if in document panel
                if (isPanel) {
                    switchFeature('chat');
                }
                
                // Add document to chat
                const docElement = createDocumentElement(doc);
                elements.messagesContainer.appendChild(docElement);
                elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
            });
            
            container.appendChild(documentItem);
        });
    }
    
    /**
     * Format file size in human-readable format
     * @param {number} bytes - File size in bytes
     * @returns {string} - Formatted file size
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Apply styles based on config
    function applyStyles() {
        // Set primary color
        document.documentElement.style.setProperty('--primary-color', config.primaryColor);
        
        // Set position
        if (config.position === 'left') {
            elements.container.style.right = 'auto';
            elements.container.style.left = '20px';
        }
    }
    
    // Public methods
    return {
        init: init
    };
})();

// Embed script to inject the chatbot into any website
(function() {
    // Check if script is being loaded from a file (not inline)
    if (document.currentScript) {
        const script = document.currentScript;
        
        // Get the script path to find related resources
        const scriptPath = script.src.substring(0, script.src.lastIndexOf('/') + 1);
        
        // Add CSS dynamically
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = scriptPath + '../css/chatbot-widget.css';
        document.head.appendChild(link);
        
        // Configure and init the chatbot
        document.addEventListener('DOMContentLoaded', function() {
            // Get configuration from script data attributes
            const config = {
                position: script.dataset.position || 'right',
                primaryColor: script.dataset.primaryColor || '#3a76f8',
                welcomeMessage: script.dataset.welcomeMessage || 'Hello! How can I help you today?',
                title: script.dataset.title || 'AI Assistant'
            };
            
            // Initialize the chatbot
            OfflineAIChatbot.init(config);
        });
    }
})();
