/**
 * Document UI Module
 * Handles document display, interaction, and UI elements for the chatbot's document feature
 */

const DocumentUI = (function() {
    // Private variables
    let config = {
        maxPreviewLength: 200,
        documentListSelector: '.chatbot-documents-list',
        documentItemClass: 'chatbot-document-item',
        documentIconClass: 'chatbot-document-icon',
        documentNameClass: 'chatbot-document-name',
        documentActionsClass: 'chatbot-document-actions',
        documentDeleteClass: 'chatbot-document-delete',
        documentAskClass: 'chatbot-document-ask',
        documentPreviewClass: 'chatbot-document-preview',
        documentTypeIcons: {
            'pdf': '📄',
            'docx': '📝',
            'txt': '📃',
            'md': '📑',
            'csv': '📊',
            'json': '📋',
            'default': '📄'
        }
    };
    
    // References to DOM elements
    let elements = {
        documentList: null
    };
    
    /**
     * Initialize the document UI
     * @param {Object} customConfig - Override default configuration
     */
    function init(customConfig = {}) {
        config = {...config, ...customConfig};
        
        // Find document list element
        elements.documentList = document.querySelector(config.documentListSelector);
        
        // Initialize event listeners
        initEventListeners();
        
        console.log('Document UI initialized');
    }
    
    /**
     * Initialize event listeners for document UI
     */
    function initEventListeners() {
        // Delegate event listener for document actions
        if (elements.documentList) {
            elements.documentList.addEventListener('click', handleDocumentAction);
        }
    }
    
    /**
     * Handle document action clicks (delete, ask, etc.)
     * @param {Event} event - Click event
     */
    function handleDocumentAction(event) {
        const target = event.target;
        
        // Check if delete button was clicked
        if (target.classList.contains(config.documentDeleteClass)) {
            const documentItem = target.closest('.' + config.documentItemClass);
            if (documentItem && documentItem.dataset.id) {
                deleteDocument(documentItem.dataset.id);
            }
            return;
        }
        
        // Check if ask button was clicked
        if (target.classList.contains(config.documentAskClass)) {
            const documentItem = target.closest('.' + config.documentItemClass);
            if (documentItem && documentItem.dataset.id) {
                askAboutDocument(documentItem.dataset.id, documentItem.dataset.name);
            }
            return;
        }
    }
    
    /**
     * Create a document element for the chat
     * @param {Object} docObj - Document object
     * @returns {HTMLElement} - Document element
     */
    function createDocumentElement(docObj) {
        const docElement = document.createElement('div');
        docElement.className = 'chatbot-message bot-message document-message';
        
        // Get icon for document type
        const typeIcon = config.documentTypeIcons[docObj.type] || config.documentTypeIcons.default;
        
        // Create document preview
        let previewText = docObj.preview || '';
        if (previewText.length > config.maxPreviewLength) {
            previewText = previewText.substring(0, config.maxPreviewLength) + '...';
        }
        
        // Format file size
        const fileSize = formatFileSize(docObj.size);
        
        // Create document HTML
        docElement.innerHTML = `
            <div class="chatbot-document">
                <div class="chatbot-document-header">
                    <span class="chatbot-document-icon">${typeIcon}</span>
                    <span class="chatbot-document-name">${docObj.name}</span>
                    <span class="chatbot-document-size">${fileSize}</span>
                </div>
                <div class="chatbot-document-preview">${previewText}</div>
                <div class="chatbot-document-actions">
                    <button class="chatbot-document-ask">Ask about this</button>
                </div>
            </div>
        `;
        
        // Add event listener for the ask button
        const askButton = docElement.querySelector('.chatbot-document-ask');
        if (askButton) {
            askButton.addEventListener('click', function() {
                askAboutDocument(docObj.id, docObj.name);
            });
        }
        
        return docElement;
    }
    
    /**
     * Create a document item for the sidebar list
     * @param {Object} docObj - Document object
     * @returns {HTMLElement} - Document list item element
     */
    function createDocumentListItem(docObj) {
        const listItem = document.createElement('div');
        listItem.className = config.documentItemClass;
        listItem.dataset.id = docObj.id;
        listItem.dataset.name = docObj.name;
        
        // Get icon for document type
        const typeIcon = config.documentTypeIcons[docObj.type] || config.documentTypeIcons.default;
        
        // Format timestamp
        const timestamp = new Date(docObj.timestamp).toLocaleString();
        
        // Create list item HTML
        listItem.innerHTML = `
            <div class="${config.documentIconClass}">${typeIcon}</div>
            <div class="${config.documentNameClass}">${docObj.name}</div>
            <div class="document-timestamp">${timestamp}</div>
            <div class="${config.documentActionsClass}">
                <button class="${config.documentAskClass}">Ask</button>
                <button class="${config.documentDeleteClass}">Delete</button>
            </div>
        `;
        
        return listItem;
    }
    
    /**
     * Update the documents list in the sidebar
     * @param {Array<Object>} documents - Array of document objects
     */
    function updateDocumentsList(documents) {
        if (!elements.documentList || !documents) return;
        
        // Clear current list
        elements.documentList.innerHTML = '';
        
        // Add document items
        if (documents.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'chatbot-documents-empty';
            emptyMessage.textContent = 'No documents uploaded yet';
            elements.documentList.appendChild(emptyMessage);
            return;
        }
        
        // Sort documents by timestamp (newest first)
        const sortedDocs = [...documents].sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        // Add each document to the list
        sortedDocs.forEach(doc => {
            const listItem = createDocumentListItem(doc);
            elements.documentList.appendChild(listItem);
        });
    }
    
    /**
     * Delete a document
     * @param {string} documentId - Document ID to delete
     */
    function deleteDocument(documentId) {
        // Confirm deletion
        if (!confirm('Are you sure you want to delete this document?')) {
            return;
        }
        
        // Delete from DocumentProcessor if available
        if (typeof DocumentProcessor !== 'undefined') {
            const success = DocumentProcessor.deleteDocument(documentId);
            if (success) {
                // Remove from UI
                const documentItems = document.querySelectorAll(`.${config.documentItemClass}[data-id="${documentId}"]`);
                documentItems.forEach(item => item.remove());
                
                // Notify user
                alert('Document deleted successfully');
                
                // If the document list is now empty, show empty message
                if (elements.documentList && elements.documentList.children.length === 0) {
                    const emptyMessage = document.createElement('div');
                    emptyMessage.className = 'chatbot-documents-empty';
                    emptyMessage.textContent = 'No documents uploaded yet';
                    elements.documentList.appendChild(emptyMessage);
                }
            } else {
                alert('Error deleting document');
            }
        } else {
            // Fallback if DocumentProcessor is not available
            alert('Document processor not available');
        }
    }
    
    /**
     * Ask a question about a specific document
     * @param {string} documentId - Document ID
     * @param {string} documentName - Document name
     */
    function askAboutDocument(documentId, documentName) {
        // Get the chatbot input element
        const inputElement = document.querySelector('.chatbot-input');
        if (!inputElement) return;
        
        // Set the input value to ask about the document
        inputElement.value = `Tell me about the document ${documentName}`;
        
        // Focus the input
        inputElement.focus();
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
    
    // Public API
    return {
        init,
        createDocumentElement,
        createDocumentListItem,
        updateDocumentsList,
        deleteDocument,
        askAboutDocument
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocumentUI;
}