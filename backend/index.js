// backend/index.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8990;

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'dist')));

// All other requests return the React index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
