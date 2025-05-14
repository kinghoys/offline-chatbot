/**
 * Ollama API Client
 * Connects the chatbot to the local Ollama instance
 */

const OllamaClient = (function() {
    // Default configuration
    const config = {
        baseUrl: 'http://localhost:11434', // Default Ollama API endpoint
        model: 'llama3:8b',                // Default model
        timeout: 60000,                    // Default timeout (60 seconds)
        temperature: 0.7,                  // Controls randomness (0.0 to 1.0)
        maxTokens: 500                     // Maximum tokens to generate
    };

    /**
     * Initialize the Ollama client with custom config
     * @param {Object} customConfig - Override default configuration
     */
    function init(customConfig = {}) {
        Object.assign(config, customConfig);
        console.log('Ollama client initialized with model:', config.model);
        
        // Test connection to Ollama
        testConnection()
            .then(result => console.log('Ollama connection test:', result))
            .catch(err => console.error('Ollama connection failed:', err));
    }

    /**
     * Test the connection to Ollama API
     * @returns {Promise} - Connection test result
     */
    async function testConnection() {
        try {
            const response = await fetch(`${config.baseUrl}/api/tags`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return {
                status: 'connected',
                models: data.models || []
            };
        } catch (error) {
            console.error('Error connecting to Ollama:', error);
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    /**
     * Generate a completion from the Ollama model
     * @param {string} prompt - The user's prompt
     * @param {Array} history - Previous conversation history
     * @returns {Promise} - Generated completion
     */
    async function generateCompletion(prompt, history = []) {
        try {
            const messages = formatMessages(prompt, history);
            
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: messages,
                    stream: false,
                    temperature: config.temperature,
                    max_tokens: config.maxTokens
                })
            };

            const response = await fetch(`${config.baseUrl}/api/chat`, requestOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            return {
                text: data.message?.content || '',
                model: config.model,
                tokenUsage: data.eval_count || 0
            };
        } catch (error) {
            console.error('Error generating completion:', error);
            return {
                text: 'Sorry, I encountered an error while generating a response. Please check if Ollama is running correctly.',
                error: error.message
            };
        }
    }

    /**
     * Generate a streaming completion from Ollama
     * @param {string} prompt - The user's prompt
     * @param {Array} history - Previous conversation history
     * @param {Function} onChunk - Callback for each text chunk
     * @param {Function} onComplete - Callback when stream completes
     * @param {Function} onError - Callback for errors
     */
    async function generateCompletionStream(prompt, history = [], onChunk, onComplete, onError) {
        try {
            const messages = formatMessages(prompt, history);
            
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: messages,
                    stream: true,
                    temperature: config.temperature,
                    max_tokens: config.maxTokens
                })
            };

            const response = await fetch(`${config.baseUrl}/api/chat`, requestOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let completeText = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim() !== '');
                
                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.message?.content) {
                            const textChunk = data.message.content;
                            completeText += textChunk;
                            if (onChunk) onChunk(textChunk);
                        }
                    } catch (e) {
                        console.warn('Error parsing JSON from stream:', e);
                    }
                }
            }
            
            if (onComplete) onComplete(completeText);
            
        } catch (error) {
            console.error('Error in streaming completion:', error);
            if (onError) onError(error);
        }
    }

    /**
     * Format conversation history into Ollama-compatible message format
     * @param {string} userPrompt - The current user prompt
     * @param {Array} history - Conversation history
     * @returns {Array} - Formatted messages
     */
    function formatMessages(userPrompt, history) {
        // Start with system message for context
        const messages = [
            {
                role: 'system',
                content: 'You are an AI assistant helping users with their questions. Provide helpful, accurate, and concise responses.'
            }
        ];
        
        // Add conversation history
        if (history && history.length > 0) {
            for (const msg of history) {
                messages.push({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.text
                });
            }
        }
        
        // Add the current user prompt
        messages.push({
            role: 'user',
            content: userPrompt
        });
        
        return messages;
    }

    /**
     * Modify the model parameters
     * @param {Object} params - Parameters to modify
     */
    function setParameters(params = {}) {
        Object.assign(config, params);
        console.log('Ollama parameters updated:', config);
    }

    /**
     * Get available models from Ollama
     * @returns {Promise} - List of available models
     */
    async function getModels() {
        try {
            const response = await fetch(`${config.baseUrl}/api/tags`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data.models || [];
        } catch (error) {
            console.error('Error fetching models:', error);
            return [];
        }
    }

    // Public API
    return {
        init,
        generateCompletion,
        generateCompletionStream,
        testConnection,
        setParameters,
        getModels
    };
})();

// Export the client for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OllamaClient;
}
