#!/bin/bash

# Build script for nginx-based React app
set -e

echo "🏗️  Building React frontend..."
cd frontend
npm install
npm run build
cd ..

echo "✅ Frontend build complete!"
echo "📁 Built files are in frontend/dist/"

echo "🐳 To build and run with Docker:"
echo "   docker build -t advana-marketplace ."
echo "   docker run -p 8080:8080 advana-marketplace"

echo "🌐 To serve locally with nginx:"
echo "   nginx -c $(pwd)/nginx.conf -p $(pwd) -g 'daemon off;'"
