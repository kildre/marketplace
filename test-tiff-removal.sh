#!/bin/bash
set -e

echo "🔍 Testing Docker images for tiff vulnerability..."

# Function to test a dockerfile
test_dockerfile() {
    local dockerfile=$1
    local image_name=$2
    
    echo "📦 Building $dockerfile..."
    if docker build -f "$dockerfile" -t "$image_name" . 2>/dev/null; then
        echo "✅ Build successful for $dockerfile"
        
        echo "🔍 Checking for tiff packages in $image_name..."
        if docker run --rm "$image_name" sh -c "apk info 2>/dev/null | grep -i tiff || echo 'No tiff packages found'"; then
            echo "📋 Package check completed for $image_name"
        fi
        
        echo "🔍 Checking for tiff files in $image_name..."
        if docker run --rm "$image_name" sh -c "find / -name '*tiff*' 2>/dev/null | head -10 || echo 'No tiff files found'"; then
            echo "📋 File check completed for $image_name"
        fi
        
        echo "🧹 Cleaning up $image_name..."
        docker rmi "$image_name" 2>/dev/null || true
        echo ""
    else
        echo "❌ Build failed for $dockerfile"
        echo ""
    fi
}

# Test different Dockerfiles
test_dockerfile "Dockerfile" "advana-test-main"
test_dockerfile "Dockerfile.secure" "advana-test-secure" 
test_dockerfile "Dockerfile.distroless" "advana-test-distroless"
test_dockerfile "Dockerfile.local" "advana-test-local"
test_dockerfile "Dockerfile.minimal" "advana-test-minimal"

echo "🎯 Testing completed!"
echo ""
echo "💡 Recommendations:"
echo "   - If tiff packages are still found, use Dockerfile.distroless"
echo "   - Run your compliance scan after building with the updated files"
echo "   - Consider using a different base image if tiff persists"
