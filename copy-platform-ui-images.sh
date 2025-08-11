#!/bin/bash

# Copy platform-ui images for deployment
echo "Copying platform-ui images..."

# Create the images directory in public assets if it doesn't exist
mkdir -p frontend/public/assets/images

# Copy PNG images from platform-ui to public assets
cp frontend/node_modules/@advana/platform-ui/dist/images/*.png frontend/public/assets/images/ 2>/dev/null || true

# Copy the logos subdirectory
cp -r frontend/node_modules/@advana/platform-ui/dist/images/logos frontend/public/assets/images/ 2>/dev/null || true

# Copy SVG files if any
cp frontend/node_modules/@advana/platform-ui/dist/images/*.svg frontend/public/assets/images/ 2>/dev/null || true

echo "Platform-ui images copied successfully!"

# List copied files for verification
echo "Copied files:"
ls -la frontend/public/assets/images/
