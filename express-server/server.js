// server.js

// Import Express
const express = require('express');

// Create an instance of Express
const app = express();

// Define a port number
const PORT = process.env.PORT || 3001; // Use environment variable or port 3000 as default

// Define a route handler for the root URL
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
