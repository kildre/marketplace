#!/bin/bash

# SonarQube Token Validation Script
# Validates that SONAR_TOKEN is set and optionally checks token validity

set -e

echo "🔍 Validating SonarQube configuration..."

# Check if SONAR_TOKEN is set
if [ -z "$SONAR_TOKEN" ]; then
    echo "❌ SONAR_TOKEN environment variable is not set"
    echo ""
    echo "To fix this:"
    echo "  1. Create .env.sonar file with: SONAR_TOKEN=your_token_here"
    echo "  2. Run: source .env.sonar"
    echo "  3. Or run: npm run sonar:local (auto-loads .env.sonar)"
    exit 1
fi

echo "✅ SONAR_TOKEN is set (length: ${#SONAR_TOKEN} characters)"

# Check if sonar-project.properties exists
if [ ! -f "sonar-project.properties" ]; then
    echo "⚠️  Warning: sonar-project.properties not found"
    exit 1
fi

echo "✅ sonar-project.properties found"

# Optional: Validate token format (SonarQube tokens are typically 40 characters)
if [ ${#SONAR_TOKEN} -lt 20 ]; then
    echo "⚠️  Warning: SONAR_TOKEN seems unusually short"
fi

echo "✅ All validations passed"
exit 0
