/**
 * Simple Express server for testing the offline AI chatbot
 * This serves both the dummy website and the chatbot widget
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from dummy-website directory
app.use('/', express.static(path.join(__dirname, 'dummy-website')));

// Serve chatbot files
app.use('/chatbot', express.static(path.join(__dirname, 'chatbot')));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Offline AI Chatbot is available on the dummy website`);
});
