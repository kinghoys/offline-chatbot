/**
 * Simple Vector Store
 * A lightweight in-browser vector store for document embeddings
 * This is a simplified version that uses cosine similarity for search
 */

const SimpleVectorStore = (function() {
    /**
     * Create a new vector store instance
     * @returns {Object} Vector store instance
     */
    function create() {
        // Private variables
        const documents = [];
        const vectors = [];
        const metadata = [];
        
        /**
         * Add documents to the vector store
         * @param {Array<Object>} docs - Array of document objects
         */
        function addDocuments(docs) {
            if (!docs || !Array.isArray(docs) || docs.length === 0) return;
            
            docs.forEach(doc => {
                // Generate a simple embedding from the text
                // In a real implementation, this would use a proper embedding model
                const embedding = generateSimpleEmbedding(doc.text);
                
                // Store document, embedding, and metadata
                documents.push(doc);
                vectors.push(embedding);
                metadata.push({
                    id: doc.id,
                    documentId: doc.documentId,
                    index: doc.index
                });
            });
            
            console.log(`Added ${docs.length} documents to vector store`);
        }
        
        /**
         * Remove documents from the vector store
         * @param {Array<string>} docIds - Array of document IDs to remove
         */
        function removeDocuments(docIds) {
            if (!docIds || !Array.isArray(docIds) || docIds.length === 0) return;
            
            const indicesToRemove = [];
            
            // Find indices to remove
            docIds.forEach(id => {
                const index = metadata.findIndex(meta => meta.id === id);
                if (index !== -1) {
                    indicesToRemove.push(index);
                }
            });
            
            // Remove in reverse order to avoid index shifting
            indicesToRemove.sort((a, b) => b - a).forEach(index => {
                documents.splice(index, 1);
                vectors.splice(index, 1);
                metadata.splice(index, 1);
            });
            
            console.log(`Removed ${indicesToRemove.length} documents from vector store`);
        }
        
        /**
         * Search for similar documents
         * @param {string} query - The search query
         * @param {number} k - Number of results to return
         * @returns {Array<Object>} - Search results
         */
        function search(query, k = 3) {
            if (!query || vectors.length === 0) return [];
            
            // Generate query embedding
            const queryEmbedding = generateSimpleEmbedding(query);
            
            // Calculate similarity scores
            const scores = vectors.map(vec => cosineSimilarity(queryEmbedding, vec));
            
            // Get top k results
            const indexedScores = scores.map((score, index) => ({ score, index }));
            indexedScores.sort((a, b) => b.score - a.score);
            
            const topK = Math.min(k, indexedScores.length);
            const indices = indexedScores.slice(0, topK).map(item => item.index);
            
            // Return results
            return indices.map(idx => ({
                id: metadata[idx].id,
                documentId: metadata[idx].documentId,
                score: scores[idx],
                text: documents[idx].text
            }));
        }
        
        /**
         * Generate a simple embedding from text
         * This is a very naive implementation for demonstration purposes
         * In a real system, you would use a proper embedding model
         * @param {string} text - The text to embed
         * @returns {Array<number>} - The embedding vector
         */
        function generateSimpleEmbedding(text) {
            // Normalize and tokenize text
            const normalizedText = text.toLowerCase().replace(/[^\w\s]/g, '');
            const words = normalizedText.split(/\s+/).filter(word => word.length > 0);
            
            // Create a simple bag-of-words vector
            // For simplicity, we'll use a fixed dimension of 100
            const dimension = 100;
            const embedding = new Array(dimension).fill(0);
            
            // Hash each word to a dimension and increment the count
            words.forEach(word => {
                const hash = simpleHash(word) % dimension;
                embedding[hash] += 1;
            });
            
            // Normalize the vector
            const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
            if (magnitude > 0) {
                for (let i = 0; i < embedding.length; i++) {
                    embedding[i] /= magnitude;
                }
            }
            
            return embedding;
        }
        
        /**
         * Simple string hash function
         * @param {string} str - String to hash
         * @returns {number} - Hash value
         */
        function simpleHash(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return Math.abs(hash);
        }
        
        /**
         * Calculate cosine similarity between two vectors
         * @param {Array<number>} a - First vector
         * @param {Array<number>} b - Second vector
         * @returns {number} - Similarity score (0-1)
         */
        function cosineSimilarity(a, b) {
            if (a.length !== b.length) return 0;
            
            let dotProduct = 0;
            let aMagnitude = 0;
            let bMagnitude = 0;
            
            for (let i = 0; i < a.length; i++) {
                dotProduct += a[i] * b[i];
                aMagnitude += a[i] * a[i];
                bMagnitude += b[i] * b[i];
            }
            
            aMagnitude = Math.sqrt(aMagnitude);
            bMagnitude = Math.sqrt(bMagnitude);
            
            if (aMagnitude === 0 || bMagnitude === 0) return 0;
            
            return dotProduct / (aMagnitude * bMagnitude);
        }
        
        /**
         * Get the number of documents in the store
         * @returns {number} - Document count
         */
        function getCount() {
            return documents.length;
        }
        
        // Return public API
        return {
            addDocuments,
            removeDocuments,
            search,
            getCount
        };
    }
    
    // Return factory function
    return {
        create
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleVectorStore;
}
