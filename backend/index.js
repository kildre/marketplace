#!/usr/bin/env node
// backend/index.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Determine the static files path based on environment
// In Docker, the built files are moved to './build'
// In local development, they remain in '../frontend/dist'
const staticPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, 'build')
  : path.join(__dirname, '../frontend/dist');

const indexPath = path.join(staticPath, 'index.html');

// Development logging
if (process.env.NODE_ENV !== 'production') {
  console.log(`🔍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Static files path: ${staticPath}`);
  console.log(`📄 Index.html path: ${indexPath}`);
}

// Check if the static directory exists
if (!fs.existsSync(staticPath)) {
  console.error(`❌ Static directory does not exist: ${staticPath}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Current working directory: ${process.cwd()}`);
    console.log(`__dirname: ${__dirname}`);
  }
  process.exit(1);
}

// Check if index.html exists
if (!fs.existsSync(indexPath)) {
  console.error(`❌ index.html not found at: ${indexPath}`);
  console.log(`📂 Contents of ${staticPath}:`);
  try {
    const files = fs.readdirSync(staticPath);
    files.forEach(file => console.log(`  - ${file}`));
  } catch (err) {
    console.error(`Failed to read directory: ${err.message}`);
  }
  process.exit(1);
}

if (process.env.NODE_ENV !== 'production') {
  console.log(`✅ Found index.html at: ${indexPath}`);
}

// Serve static files from the React build
app.use(express.static(staticPath));

// All other requests return the React index.html
app.get('*', (req, res) => {
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
