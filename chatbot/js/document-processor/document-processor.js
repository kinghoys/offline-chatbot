/**
 * Document Processor Module
 * Handles document parsing, chunking, and vector storage for the offline chatbot
 */

const DocumentProcessor = (function() {
    // Private variables
    let config = {
        chunkSize: 1000,          // Characters per chunk
        chunkOverlap: 200,        // Overlap between chunks
        maxDocumentSize: 5000000, // 5MB max document size
        supportedTypes: {
            'text/plain': processTextDocument,
            'application/pdf': processPdfDocument,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': processDocxDocument,
            'text/csv': processCsvDocument,
            'application/json': processJsonDocument,
            'text/markdown': processMarkdownDocument
        }
    };
    
    // Document storage
    let documents = [];
    let chunks = [];
    let vectorStore = null;
    
    // Validate that documents is always an array
    function ensureDocumentsIsArray() {
        if (!Array.isArray(documents)) {
            console.warn('Documents variable is not an array, resetting');
            documents = [];
        }
    }
    
    /**
     * Initialize the document processor
     * @param {Object} customConfig - Override default configuration
     */
    function init(customConfig = {}) {
        config = {...config, ...customConfig};
        console.log('Document processor initialization started');
        
        // Ensure documents is an array
        ensureDocumentsIsArray();
        
        // Initialize vector store
        vectorStore = SimpleVectorStore.create();
        console.log('Vector store created');
        
        // Clear local storage if requested (for testing/debugging)
        if (customConfig.clearStorage) {
            console.log('Clearing document storage as requested');
            clearDocumentStorage();
        }
        
        // Load any previously stored documents
        loadStoredDocuments();
        
        // Validate again after loading
        ensureDocumentsIsArray();
        
        // Make sure vector store has all chunks
        if (chunks.length > 0 && vectorStore) {
            console.log(`Ensuring vector store has all ${chunks.length} chunks`);
            vectorStore.addDocuments(chunks);
        }
        
        console.log(`Document processor initialized with ${documents.length} documents and ${chunks.length} chunks`);
    }
    
    /**
     * Clear document storage (for testing/debugging)
     */
    function clearDocumentStorage() {
        // Clear documents and chunks from local storage
        localStorage.removeItem('offlineAIChatbot_documents');
        localStorage.removeItem('offlineAIChatbot_chunks_count');
        
        // Clear all chunk batches
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('offlineAIChatbot_chunks_')) {
                localStorage.removeItem(key);
            }
        }
        
        // Reset in-memory data
        documents = [];
        chunks = [];
        
        // Reset vector store
        if (vectorStore) {
            vectorStore = SimpleVectorStore.create();
        }
        
        console.log('Document storage cleared');
    }
    
    /**
     * Process a document file
     * @param {File} file - The document file to process
     * @returns {Promise<Object>} - Processing result with document ID
     */
    async function processDocument(file) {
        try {
            // Ensure documents is an array
            ensureDocumentsIsArray();
            
            // Check file size
            if (file.size > config.maxDocumentSize) {
                throw new Error(`File too large. Maximum size is ${config.maxDocumentSize / 1000000}MB`);
            }
            
            // Check file type
            const processor = config.supportedTypes[file.type];
            if (!processor) {
                // Try to determine type from extension
                const extension = file.name.split('.').pop().toLowerCase();
                if (extension === 'txt') return processTextDocument(file);
                if (extension === 'pdf') return processPdfDocument(file);
                if (extension === 'docx') return processDocxDocument(file);
                if (extension === 'csv') return processCsvDocument(file);
                if (extension === 'json') return processJsonDocument(file);
                if (extension === 'md') return processMarkdownDocument(file);
                
                throw new Error(`Unsupported file type: ${file.type}`);
            }
            
            // Process the document
            return await processor(file);
        } catch (error) {
            console.error('Error processing document:', error);
            throw error;
        }
    }
    
    /**
     * Process a plain text document
     * @param {File} file - The text file
     * @returns {Promise<Object>} - Processing result
     */
    async function processTextDocument(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    console.log('Processing text document:', file.name);
                    const content = e.target.result;
                    const documentId = 'doc-' + Date.now();
                    
                    // Create document object
                    const docObj = {
                        id: documentId,
                        name: file.name,
                        type: 'text',
                        size: file.size,
                        content: content,
                        chunks: [],
                        timestamp: new Date().toISOString()
                    };
                    
                    // Make sure content is a non-empty string before chunking
                    if (typeof content === 'string' && content.trim().length > 0) {
                        console.log(`Document content length: ${content.length} characters`);
                        
                        // Chunk the document
                        const documentChunks = chunkDocument(content, docObj.id);
                        console.log(`Created ${documentChunks.length} chunks for document ${docObj.id}`);
                        
                        if (documentChunks.length > 0) {
                            docObj.chunks = documentChunks.map(chunk => chunk.id);
                        } else {
                            console.warn('No chunks were created for the document');
                        }
                    } else {
                        console.warn('Document content is empty or invalid, skipping chunking');
                    }
                    
                    // Add to documents array - with additional safety check
                    ensureDocumentsIsArray();
                    documents.push(docObj);
                    
                    // Add chunks to vector store
                    vectorStore.addDocuments(documentChunks);
                    
                    // Save to local storage
                    saveDocuments();
                    
                    resolve({
                        success: true,
                        documentId: documentId,
                        name: file.name,
                        type: 'text',
                        chunkCount: documentChunks.length
                    });
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = function() {
                reject(new Error('Error reading file'));
            };
            
            reader.readAsText(file);
        });
    }
    
    /**
     * Process a PDF document using PDF.js
     * @param {File} file - The PDF file
     * @returns {Promise<Object>} - Processing result
     */
    async function processPdfDocument(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async function(e) {
                try {
                    console.log(`Processing PDF document: ${file.name}, size: ${(file.size / 1024).toFixed(2)} KB`);
                    const documentId = 'doc-' + Date.now();
                    const arrayBuffer = e.target.result;
                    
                    // Use PDF.js to extract text
                    const pdfjsLib = window.pdfjsLib;
                    if (!pdfjsLib) {
                        throw new Error('PDF.js not available! Make sure it is loaded properly.');
                    }
                    
                    console.log('Loading PDF document with PDF.js');
                    
                    try {
                        // Load the PDF document
                        const loadingTask = pdfjsLib.getDocument({data: arrayBuffer});
                        const pdfDocument = await loadingTask.promise;
                        
                        console.log(`PDF loaded successfully. It has ${pdfDocument.numPages} pages.`);
                        
                        // Extract text from all pages
                        let fullText = '';
                        const pageTextPromises = [];
                        
                        // Function to process a single page
                        async function processPage(pageNum) {
                            try {
                                const page = await pdfDocument.getPage(pageNum);
                                const textContent = await page.getTextContent();
                                
                                // Extract text from the page
                                let pageText = '';
                                for (const item of textContent.items) {
                                    if (item.str) {
                                        pageText += item.str + ' ';
                                    }
                                }
                                
                                return `Page ${pageNum}: ${pageText}`;
                            } catch (pageError) {
                                console.warn(`Error extracting text from page ${pageNum}:`, pageError);
                                return `Page ${pageNum}: [Error extracting text]`;
                            }
                        }
                        
                        // Process pages in batches to avoid memory issues
                        const BATCH_SIZE = 10;
                        for (let batch = 0; batch < pdfDocument.numPages; batch += BATCH_SIZE) {
                            const batchPageNums = [];
                            for (let i = batch + 1; i <= Math.min(batch + BATCH_SIZE, pdfDocument.numPages); i++) {
                                batchPageNums.push(i);
                            }
                            
                            console.log(`Processing batch of ${batchPageNums.length} pages (${batchPageNums[0]}-${batchPageNums[batchPageNums.length-1]})`);
                            
                            // Process each page in the batch
                            const batchPromises = batchPageNums.map(pageNum => processPage(pageNum));
                            const batchResults = await Promise.all(batchPromises);
                            
                            // Add batch results to full text
                            fullText += batchResults.join('\n\n');
                        }
                        
                        console.log(`Extracted ${fullText.length} characters from PDF`);
                        
                        if (fullText.trim().length === 0) {
                            console.warn('Extracted text is empty, this may be a scanned PDF without text layer');
                            fullText = `The document ${file.name} appears to be a scanned PDF without an extractable text layer. ` +
                                      `In a production environment, we would use OCR to extract text from images.`;
                        }
                        
                        // Create document object
                        const docObj = {
                            id: documentId,
                            name: file.name,
                            type: 'pdf',
                            size: file.size,
                            content: fullText,
                            pageCount: pdfDocument.numPages,
                            chunks: [],
                            timestamp: new Date().toISOString()
                        };
                        
                        // Chunk the document
                        console.log('Creating chunks for PDF document');
                        const documentChunks = chunkDocument(fullText, docObj.id);
                        console.log(`Created ${documentChunks.length} chunks for PDF document`);
                        
                        if (documentChunks.length > 0) {
                            docObj.chunks = documentChunks.map(chunk => chunk.id);
                            
                            // Add chunks to global chunks array
                            chunks.push(...documentChunks);
                            
                            // Initialize vector store with the chunks
                            if (vectorStore) {
                                vectorStore.addDocuments(documentChunks);
                            }
                        } else {
                            console.warn('No chunks were created for the PDF document');
                        }
                        
                        // Add to documents array
                        ensureDocumentsIsArray();
                        documents.push(docObj);
                        
                        // Save to local storage
                        saveDocuments();
                        
                        resolve({
                            success: true,
                            documentId: documentId,
                            name: file.name,
                            type: 'pdf',
                            pageCount: pdfDocument.numPages,
                            chunkCount: documentChunks.length,
                            contentPreview: fullText.substring(0, 100) + '...',
                            note: "PDF processed successfully with PDF.js"
                        });
                    } catch (pdfError) {
                        console.error('PDF.js processing error:', pdfError);
                        
                        // Fallback to simpler processing
                        const fallbackContent = `Could not process the content of ${file.name} with PDF.js. ` +
                            `This may be due to the PDF format or structure. Error: ${pdfError.message}`;
                        
                        // Create document object with fallback content
                        const docObj = {
                            id: documentId,
                            name: file.name,
                            type: 'pdf',
                            size: file.size,
                            content: fallbackContent,
                            chunks: [],
                            timestamp: new Date().toISOString()
                        };
                        
                        // Chunk the fallback content
                        const documentChunks = chunkDocument(fallbackContent, docObj.id);
                        if (documentChunks.length > 0) {
                            docObj.chunks = documentChunks.map(chunk => chunk.id);
                            chunks.push(...documentChunks);
                            if (vectorStore) vectorStore.addDocuments(documentChunks);
                        }
                        
                        // Add to documents array
                        ensureDocumentsIsArray();
                        documents.push(docObj);
                        
                        // Save to storage
                        saveDocuments();
                        
                        resolve({
                            success: true,
                            documentId: documentId,
                            name: file.name,
                            type: 'pdf',
                            chunkCount: documentChunks.length,
                            note: "PDF processing encountered issues with PDF.js, using fallback method"
                        });
                    }
                } catch (error) {
                    console.error('Error processing PDF document:', error);
                    reject(error);
                }
            };
            
            reader.onerror = function() {
                reject(new Error('Error reading file'));
            };
            
            reader.readAsArrayBuffer(file);
        });
    }
    
    /**
     * Process a DOCX document using mammoth.js
     * @param {File} file - The DOCX file
     * @returns {Promise<Object>} - Processing result
     */
    async function processDocxDocument(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async function(e) {
                try {
                    console.log(`Processing DOCX document: ${file.name}`);
                    const documentId = 'doc-' + Date.now();
                    const arrayBuffer = e.target.result;
                    
                    // Use mammoth.js to extract text from the DOCX
                    const mammoth = window.mammoth;
                    if (!mammoth) {
                        throw new Error('Mammoth.js not available! Loading it dynamically...');
                    }
                    
                    console.log('Extracting text from DOCX using mammoth.js');
                    
                    try {
                        // Extract text with mammoth
                        const result = await mammoth.extractRawText({arrayBuffer: arrayBuffer});
                        const extractedContent = result.value || '';
                        console.log(`Extracted ${extractedContent.length} characters from DOCX`);
                        
                        // Create document object
                        const docObj = {
                            id: documentId,
                            name: file.name,
                            type: 'docx',
                            size: file.size,
                            content: extractedContent,
                            chunks: [],
                            timestamp: new Date().toISOString()
                        };
                        
                        // Chunk the document if content exists
                        if (extractedContent && extractedContent.trim().length > 0) {
                            console.log('Creating chunks for DOCX document');
                            const documentChunks = chunkDocument(extractedContent, docObj.id);
                            console.log(`Created ${documentChunks.length} chunks for DOCX document`);
                            
                            if (documentChunks.length > 0) {
                                docObj.chunks = documentChunks.map(chunk => chunk.id);
                                
                                // Add chunks to global chunks array
                                chunks.push(...documentChunks);
                                
                                // Initialize vector store with the chunks
                                if (vectorStore) {
                                    vectorStore.addDocuments(documentChunks);
                                }
                            } else {
                                console.warn('No chunks created for DOCX document');
                            }
                        } else {
                            console.warn('Extracted content is empty');
                        }
                        
                        // Add to documents array
                        ensureDocumentsIsArray();
                        documents.push(docObj);
                        
                        // Save to local storage
                        saveDocuments();
                        
                        resolve({
                            success: true,
                            documentId: documentId,
                            name: file.name,
                            type: 'docx',
                            chunkCount: docObj.chunks.length,
                            content: extractedContent.substring(0, 100) + '...',
                            note: "DOCX processed with mammoth.js"
                        });
                    } catch (mammothError) {
                        console.error('Mammoth processing error:', mammothError);
                        
                        // Fallback to simpler processing
                        const fallbackContent = `Could not process the content of ${file.name} with mammoth.js. `+
                            `This may be due to the DOCX format or structure. Error: ${mammothError.message}`;
                            
                        // Create document object with fallback content
                        const docObj = {
                            id: documentId,
                            name: file.name,
                            type: 'docx',
                            size: file.size,
                            content: fallbackContent,
                            chunks: [],
                            timestamp: new Date().toISOString()
                        };
                        
                        // Chunk the fallback content
                        const documentChunks = chunkDocument(fallbackContent, docObj.id);
                        if (documentChunks.length > 0) {
                            docObj.chunks = documentChunks.map(chunk => chunk.id);
                            chunks.push(...documentChunks);
                            if (vectorStore) vectorStore.addDocuments(documentChunks);
                        }
                        
                        // Add to documents array
                        ensureDocumentsIsArray();
                        documents.push(docObj);
                        
                        // Save to storage
                        saveDocuments();
                        
                        resolve({
                            success: true,
                            documentId: documentId,
                            name: file.name,
                            type: 'docx',
                            chunkCount: documentChunks.length,
                            note: "DOCX processing failed with mammoth.js, using fallback processing"
                        });
                    }
                } catch (error) {
                    console.error('Error processing DOCX document:', error);
                    reject(error);
                }
            };
            
            reader.onerror = function() {
                reject(new Error('Error reading file'));
            };
            
            reader.readAsArrayBuffer(file);
        });
    }
    
    /**
     * Process a CSV document
     * @param {File} file - The CSV file
     * @returns {Promise<Object>} - Processing result
     */
    async function processCsvDocument(file) {
        return processTextDocument(file);
    }
    
    /**
     * Process a JSON document
     * @param {File} file - The JSON file
     * @returns {Promise<Object>} - Processing result
     */
    async function processJsonDocument(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const content = e.target.result;
                    let jsonContent;
                    
                    try {
                        jsonContent = JSON.stringify(JSON.parse(content), null, 2);
                    } catch (e) {
                        jsonContent = "Invalid JSON: " + content;
                    }
                    
                    const documentId = 'doc-' + Date.now();
                    
                    // Create document object
                    const docObj = {
                        id: documentId,
                        name: file.name,
                        type: 'json',
                        size: file.size,
                        content: jsonContent,
                        chunks: [],
                        timestamp: new Date().toISOString()
                    };
                    
                    // Make sure content is a non-empty string before chunking
                    if (typeof jsonContent === 'string' && jsonContent.trim().length > 0) {
                        console.log(`JSON document content length: ${jsonContent.length} characters`);
                        
                        // Chunk the document
                        const documentChunks = chunkDocument(jsonContent, docObj.id);
                        console.log(`Created ${documentChunks.length} chunks for JSON document ${docObj.id}`);
                        
                        if (documentChunks.length > 0) {
                            docObj.chunks = documentChunks.map(chunk => chunk.id);
                        } else {
                            console.warn('No chunks were created for the JSON document');
                        }
                    } else {
                        console.warn('JSON document content is empty or invalid, skipping chunking');
                    }
                    
                    // Add to documents array - with additional safety check
                    ensureDocumentsIsArray();
                    documents.push(docObj);
                    
                    // Add chunks to vector store
                    vectorStore.addDocuments(documentChunks);
                    
                    // Save to local storage
                    saveDocuments();
                    
                    resolve({
                        success: true,
                        documentId: documentId,
                        name: file.name,
                        type: 'json',
                        chunkCount: documentChunks.length
                    });
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = function() {
                reject(new Error('Error reading file'));
            };
            
            reader.readAsText(file);
        });
    }
    
    /**
     * Process a Markdown document
     * @param {File} file - The Markdown file
     * @returns {Promise<Object>} - Processing result
     */
    async function processMarkdownDocument(file) {
        return processTextDocument(file);
    }
    
    /**
     * Split a document into chunks
     * @param {string} text - Document text
     * @param {string} documentId - Document ID
     * @param {number} maxChunkSize - Maximum chunk size
     * @returns {Array<Object>} - Array of chunk objects
     */
    function chunkDocument(text, documentId, maxChunkSize = 1000) {
        console.log(`Chunking document ${documentId}, text length: ${text.length}`);
        
        if (!text || text.length === 0) {
            console.warn('Empty text provided for chunking');
            return [];
        }
        
        const documentChunks = [];
        
        // For large documents, increase chunk size to reduce number of chunks
        // This helps with memory usage and vector store performance
        let chunkSize = maxChunkSize;
        if (text.length > 100000) { // 100KB
            chunkSize = 2000;
            console.log(`Large document detected (${text.length} chars), using larger chunk size: ${chunkSize}`);
        }
        
        // Set overlap for chunks
        const chunkOverlap = 100; // characters of overlap between chunks
        
        // Try to split on paragraph or sentence boundaries when possible
        // This creates more meaningful chunks for semantic search
        let startIndex = 0;
        let chunkIndex = 0;
        
        while (startIndex < text.length) {
            // Calculate where this chunk should end
            let endIndex = Math.min(startIndex + chunkSize, text.length);
            
            // Try to find paragraph boundary near the end of the chunk
            if (endIndex < text.length) {
                // Look for paragraph break within 200 chars of the calculated end
                const paragraphBreak = text.indexOf('\n\n', endIndex - 200);
                if (paragraphBreak !== -1 && paragraphBreak < endIndex + 200) {
                    endIndex = paragraphBreak + 2; // include the newlines
                } else {
                    // Try to find sentence boundary (period followed by space)
                    const sentenceBreak = text.indexOf('. ', endIndex - 100);
                    if (sentenceBreak !== -1 && sentenceBreak < endIndex + 100) {
                        endIndex = sentenceBreak + 2; // include the period and space
                    }
                }
            }
            
            // Extract the chunk text
            const chunkText = text.substring(startIndex, endIndex);
            
            // Create chunk object
            const chunkId = `${documentId}-chunk-${chunkIndex}`;
            const chunk = {
                id: chunkId,
                documentId: documentId,
                text: chunkText,
                index: chunkIndex,
                metadata: {
                    startIndex: startIndex,
                    endIndex: endIndex
                }
            };
            
            // Add to chunks array
            documentChunks.push(chunk);
            
            // Move to next chunk with overlap
            startIndex = endIndex - chunkOverlap;
            chunkIndex++;
            
            // Avoid tiny chunks at the end
            if (text.length - startIndex < chunkSize / 4) {
                // If the remaining content is small, include it in the last chunk
                if (documentChunks.length > 0 && startIndex < text.length) {
                    const lastChunk = documentChunks[documentChunks.length - 1];
                    lastChunk.text += text.substring(endIndex);
                    lastChunk.metadata.endIndex = text.length;
                }
                break;
            }
        }
        
        console.log(`Created ${documentChunks.length} chunks for document ${documentId}`);
        return documentChunks;
    }
    
    /**
     * Query documents based on a search string
     * @param {string} query - The search query
     * @param {number} topK - Number of results to return
     * @returns {Array<Object>} - Search results with document context
     */
    function queryDocuments(query, topK = 3) {
        console.log(`Querying documents with: "${query}", requesting ${topK} results`);
        
        // If no documents or chunks, return empty results
        if (!vectorStore || chunks.length === 0) {
            console.warn('No vector store or chunks available for query');
            
            // If there are documents but no chunks, return the newest document as a fallback
            if (documents.length > 0) {
                console.log('No chunks available, falling back to newest document');
                const sortedDocs = [...documents].sort((a, b) => {
                    return new Date(b.timestamp) - new Date(a.timestamp);
                });
                
                const newestDoc = sortedDocs[0];
                console.log(`Using newest document as fallback: ${newestDoc.name}`);
                
                // Create a synthetic result based on document content
                return [{
                    id: 'synthetic-chunk-1',
                    score: 1.0,
                    chunk: {
                        id: 'synthetic-chunk-1',
                        documentId: newestDoc.id,
                        text: newestDoc.content.substring(0, 1000),
                        index: 0
                    },
                    document: {
                        id: newestDoc.id,
                        name: newestDoc.name,
                        type: newestDoc.type
                    }
                }];
            }
            
            return [];
        }
        
        // Extract document name from query if it exists
        const extractDocumentName = (query) => {
            // Look for specific document patterns
            const patterns = [
                /document(?:\s+called)?\s+["'](.+?)["']/i,  // "document called 'X'" or "document 'X'"
                /["'](.+?)(?:\.\w+)?["']\s+document/i,  // "'X.pdf' document"
                /\b(\w+\.(?:pdf|docx|txt|json))\b/i,  // Any filename with extension
                /about\s+["'](.+?)["']/i,  // "about 'X'"
                /in\s+["'](.+?)["']/i,  // "in 'X'"
                /from\s+["'](.+?)["']/i,  // "from 'X'"
            ];
            
            for (const pattern of patterns) {
                const match = query.match(pattern);
                if (match && match[1]) {
                    return match[1].trim();
                }
            }
            
            return null;
        };
        
        // Try to extract document name from query
        const extractedDocName = extractDocumentName(query);
        if (extractedDocName) {
            console.log(`Extracted document name from query: "${extractedDocName}"`);
        }
        
        // If we have a specific document name in the query, prioritize that document
        if (extractedDocName) {
            // Find the most matching document
            const matchingDoc = documents.find(doc => 
                doc.name.toLowerCase() === extractedDocName.toLowerCase() ||
                doc.name.toLowerCase().includes(extractedDocName.toLowerCase()) ||
                extractedDocName.toLowerCase().includes(doc.name.toLowerCase().replace(/\.[^.]+$/, ''))
            );
            
            if (matchingDoc) {
                console.log(`Found matching document for extracted name: ${matchingDoc.name}`);
                
                // Get all chunks for this document
                const docChunks = chunks.filter(chunk => chunk.documentId === matchingDoc.id);
                
                if (docChunks.length > 0) {
                    console.log(`Returning ${Math.min(topK, docChunks.length)} chunks from document: ${matchingDoc.name}`);
                    
                    // Sort chunks by index to maintain document order
                    const sortedChunks = [...docChunks].sort((a, b) => a.index - b.index);
                    
                    return sortedChunks.slice(0, topK).map(chunk => ({
                        id: chunk.id,
                        score: 1.0,  // Perfect match
                        chunk: chunk,
                        document: {
                            id: matchingDoc.id,
                            name: matchingDoc.name,
                            type: matchingDoc.type
                        }
                    }));
                }
            }
        }
        
        // Fall back to checking if query contains/matches document name directly
        const directNameMatch = documents.find(doc => 
            query.toLowerCase().includes(doc.name.toLowerCase()) ||
            doc.name.toLowerCase() === query.toLowerCase());
            
        if (directNameMatch) {
            console.log(`Found direct name match for document: ${directNameMatch.name}`);
            
            // Get all chunks for this document
            const docChunks = chunks.filter(chunk => chunk.documentId === directNameMatch.id);
            
            if (docChunks.length > 0) {
                console.log(`Using ${Math.min(topK, docChunks.length)} chunks from matched document`);
                
                // Sort chunks by index to maintain document order
                const sortedChunks = [...docChunks].sort((a, b) => a.index - b.index);
                
                return sortedChunks.slice(0, topK).map(chunk => ({
                    id: chunk.id,
                    score: 1.0,  // Perfect match
                    chunk: chunk,
                    document: {
                        id: directNameMatch.id,
                        name: directNameMatch.name,
                        type: directNameMatch.type
                    }
                }));
            }
        }
        
        // If the query is asking about PDF or DOCX specifically
        if (query.toLowerCase().includes('pdf') || query.toLowerCase().includes('in the pdf')) {
            const pdfDocs = documents.filter(doc => doc.type === 'pdf');
            if (pdfDocs.length > 0) {
                // Get the most recent PDF
                const latestPdf = [...pdfDocs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
                console.log(`Query mentions PDF, using latest PDF: ${latestPdf.name}`);
                
                const pdfChunks = chunks.filter(chunk => chunk.documentId === latestPdf.id);
                if (pdfChunks.length > 0) {
                    // Sort chunks by index and take the first topK
                    const sortedChunks = [...pdfChunks].sort((a, b) => a.index - b.index);
                    
                    return sortedChunks.slice(0, topK).map(chunk => ({
                        id: chunk.id,
                        score: 1.0,
                        chunk: chunk,
                        document: {
                            id: latestPdf.id,
                            name: latestPdf.name,
                            type: latestPdf.type
                        }
                    }));
                }
            }
        } else if (query.toLowerCase().includes('docx') || query.toLowerCase().includes('word') || 
                  query.toLowerCase().includes('in the document') || query.toLowerCase().includes('in the docx')) {
            const docxDocs = documents.filter(doc => doc.type === 'docx');
            if (docxDocs.length > 0) {
                // Get the most recent DOCX
                const latestDocx = [...docxDocs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
                console.log(`Query mentions DOCX/document, using latest DOCX: ${latestDocx.name}`);
                
                const docxChunks = chunks.filter(chunk => chunk.documentId === latestDocx.id);
                if (docxChunks.length > 0) {
                    // Sort chunks by index and take the first topK
                    const sortedChunks = [...docxChunks].sort((a, b) => a.index - b.index);
                    
                    return sortedChunks.slice(0, topK).map(chunk => ({
                        id: chunk.id,
                        score: 1.0,
                        chunk: chunk,
                        document: {
                            id: latestDocx.id,
                            name: latestDocx.name,
                            type: latestDocx.type
                        }
                    }));
                }
            }
        }
        
        // Perform regular vector search - but include document source in results
        console.log('Performing vector search with no specific document targeting');
        const results = vectorStore.search(query, topK + 5); // Get a few extra to filter
        console.log(`Vector search returned ${results.length} results`);
        
        if (results.length === 0) {
            return [];
        }
        
        // Enhance results with document information
        let enhancedResults = results.map(result => {
            const chunk = chunks.find(c => c.id === result.id);
            if (!chunk) {
                console.warn(`Chunk not found for id: ${result.id}`);
                return null;
            }
            
            const docObj = documents.find(d => d.id === chunk.documentId);
            if (!docObj) {
                console.warn(`Document not found for id: ${chunk.documentId}`);
                return null;
            }
            
            return {
                ...result,
                chunk: chunk,
                document: {
                    id: docObj.id,
                    name: docObj.name,
                    type: docObj.type
                }
            };
        }).filter(Boolean);  // Remove any null results
        
        // Check if results contain chunks from multiple documents
        const docIds = new Set(enhancedResults.map(r => r.document.id));
        
        // If we have results from multiple documents, try to select from just one document
        if (docIds.size > 1) {
            console.log(`Results contain chunks from ${docIds.size} different documents, selecting most relevant document`);
            
            // Group results by document
            const resultsByDoc = {};
            enhancedResults.forEach(r => {
                if (!resultsByDoc[r.document.id]) {
                    resultsByDoc[r.document.id] = [];
                }
                resultsByDoc[r.document.id].push(r);
            });
            
            // Find document with highest average score
            let bestDocId = null;
            let bestAvgScore = -1;
            
            for (const [docId, results] of Object.entries(resultsByDoc)) {
                const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
                if (avgScore > bestAvgScore) {
                    bestAvgScore = avgScore;
                    bestDocId = docId;
                }
            }
            
            if (bestDocId) {
                const docObj = documents.find(d => d.id === bestDocId);
                console.log(`Selected document with highest relevance: ${docObj?.name || bestDocId}`);
                
                // Filter to only results from this document
                enhancedResults = enhancedResults.filter(r => r.document.id === bestDocId);
            }
        }
        
        // Ensure we return at most topK results
        return enhancedResults.slice(0, topK);
    }
    
    /**
     * Get a document by ID
     * @param {string} documentId - Document ID
     * @returns {Object|null} - Document object or null if not found
     */
    function getDocument(documentId) {
        return documents.find(doc => doc.id === documentId) || null;
    }
    
    /**
     * Get all documents
     * @returns {Array<Object>} - All documents
     */
    function getAllDocuments() {
        return documents;
    }
    
    /**
     * Delete a document by ID
     * @param {string} documentId - Document ID
     * @returns {boolean} - Success status
     */
    function deleteDocument(documentId) {
        const index = documents.findIndex(doc => doc.id === documentId);
        if (index === -1) return false;
        
        // Remove document
        const document = documents[index];
        documents.splice(index, 1);
        
        // Remove chunks
        const documentChunks = chunks.filter(chunk => chunk.documentId === documentId);
        documentChunks.forEach(chunk => {
            const chunkIndex = chunks.findIndex(c => c.id === chunk.id);
            if (chunkIndex !== -1) {
                chunks.splice(chunkIndex, 1);
            }
        });
        
        // Remove from vector store
        if (vectorStore) {
            vectorStore.removeDocuments(documentChunks.map(chunk => chunk.id));
        }
        
        // Save changes
        saveDocuments();
        
        return true;
    }
    
    /**
     * Save documents to local storage
     */
    function saveDocuments() {
        try {
            console.log(`Saving ${documents.length} documents and ${chunks.length} chunks to storage`);
            
            // Validate chunks array
            if (!Array.isArray(chunks)) {
                console.warn('Chunks is not an array, resetting');
                chunks = [];
            }
            
            // Check for invalid chunks
            const validChunks = chunks.filter(chunk => 
                chunk && typeof chunk === 'object' && 
                chunk.id && chunk.documentId && 
                typeof chunk.text === 'string');
                
            if (validChunks.length !== chunks.length) {
                console.warn(`Found ${chunks.length - validChunks.length} invalid chunks, filtering them out`);
                chunks = validChunks;
            }
            
            // Strip large content from documents to save space
            const streamlinedDocuments = documents.map(doc => ({
                id: doc.id,
                name: doc.name,
                type: doc.type,
                size: doc.size,
                // Only keep the first 1000 chars of content for preview
                content: typeof doc.content === 'string' ? 
                    (doc.content.substring(0, 1000) + (doc.content.length > 1000 ? '...' : '')) : 
                    'Content not available',
                chunks: Array.isArray(doc.chunks) ? doc.chunks : [],
                timestamp: doc.timestamp
            }));
            
            // Save documents and chunks separately to avoid localStorage size limits
            localStorage.setItem('offlineAIChatbot_documents', JSON.stringify(streamlinedDocuments));
            
            // Save chunks in batches to avoid exceeding localStorage limits
            const maxChunksPerBatch = 50;
            
            // First clear any existing chunk data
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('offlineAIChatbot_chunks_')) {
                    keysToRemove.push(key);
                }
            }
            
            // Remove keys outside the loop to avoid index shifting
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            // Log chunk information
            if (chunks.length > 0) {
                console.log(`First chunk example: ID=${chunks[0].id}, DocumentID=${chunks[0].documentId}, TextLength=${chunks[0].text ? chunks[0].text.length : 0}`);
            }
            
            // Save chunks in batches
            for (let i = 0; i < chunks.length; i += maxChunksPerBatch) {
                const batchChunks = chunks.slice(i, i + maxChunksPerBatch);
                const batchKey = `offlineAIChatbot_chunks_${Math.floor(i / maxChunksPerBatch)}`;
                localStorage.setItem(batchKey, JSON.stringify(batchChunks));
            }
            
            // Save chunk count for loading reference
            localStorage.setItem('offlineAIChatbot_chunks_count', chunks.length.toString());
            
            console.log(`Successfully saved ${streamlinedDocuments.length} documents and ${chunks.length} chunks to storage`);
            
            // Initialize vector store with chunks if needed
            if (vectorStore && chunks.length > 0 && vectorStore.getCount() === 0) {
                vectorStore.addDocuments(chunks);
                console.log(`Added ${chunks.length} chunks to vector store`);
            }
        } catch (error) {
            console.error('Error saving documents to local storage:', error);
        }
    }
    
    /**
     * Load documents from local storage
     */
    function loadStoredDocuments() {
        try {
            // Ensure documents is an array before loading
            ensureDocumentsIsArray();
            
            // Load documents
            const docData = localStorage.getItem('offlineAIChatbot_documents');
            if (!docData) return;
            
            // Make sure documents is an array
            const parsedData = JSON.parse(docData);
            if (Array.isArray(parsedData)) {
                documents = parsedData;
            } else {
                console.warn('Stored documents data is not an array, resetting');
                documents = [];
            }
            
            // Load chunk count
            const chunkCountData = localStorage.getItem('offlineAIChatbot_chunks_count');
            const totalChunks = chunkCountData ? parseInt(chunkCountData, 10) : 0;
            
            // Load chunks in batches
            chunks = [];
            const maxBatches = Math.ceil(totalChunks / 50);
            
            for (let i = 0; i < maxBatches; i++) {
                const batchKey = `offlineAIChatbot_chunks_${i}`;
                const batchData = localStorage.getItem(batchKey);
                
                if (batchData) {
                    const batchChunks = JSON.parse(batchData);
                    chunks = chunks.concat(batchChunks);
                }
            }
            
            // Restore chunks to vector store
            if (vectorStore && chunks.length > 0) {
                vectorStore.addDocuments(chunks);
            }
            
            console.log(`Loaded ${documents.length} documents with ${chunks.length} chunks from storage`);
        } catch (error) {
            console.error('Error loading documents from local storage:', error);
        }
    }
    
    // Public API
    return {
        init,
        processDocument,
        queryDocuments,
        getDocument,
        getAllDocuments,
        deleteDocument
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocumentProcessor;
}
