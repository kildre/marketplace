#!/bin/bash

# Local SonarQube Analysis Script
# This script runs SonarQube analysis locally for development

set -e  # Exit on error

echo "🔍 Local SonarQube Analysis"
echo "======================================"
echo ""

# Check if SONAR_TOKEN is set
if [ -z "$SONAR_TOKEN" ]; then
  echo "⚠️  Warning: SONAR_TOKEN not set"
  echo ""
  echo "To set your token:"
  echo "  1. Copy .env.example to .env"
  echo "  2. Add your SonarQube token to .env"
  echo "  3. Run: source .env"
  echo "  4. Run this script again"
  echo ""
  echo "Or set it temporarily:"
  echo "  export SONAR_TOKEN='your-token-here'"
  echo ""
  exit 1
fi

# Default values
SONAR_HOST_URL="${SONAR_HOST_URL:-https://sonarqube.cdao.us}"
PROJECT_KEY="tenant-metrostar-advana-marketplace"

echo "📊 Configuration:"
echo "  Project: $PROJECT_KEY"
echo "  Host: $SONAR_HOST_URL"
echo ""

# Step 1: Run tests with coverage
echo "🧪 Step 1/2: Running tests with coverage..."
echo "--------------------------------------"
cd frontend
npm run test:coverage

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Tests failed! Please fix test failures before running SonarQube analysis."
  exit 1
fi

cd ..
echo ""
echo "✅ Tests completed successfully"
echo ""

# Step 2: Run SonarQube scanner
echo "🔍 Step 2/2: Running SonarQube scanner..."
echo "--------------------------------------"

# Check if sonarqube-scanner is available
if ! command -v sonar-scanner &> /dev/null && ! npx sonarqube-scanner --version &> /dev/null 2>&1; then
  echo "⚠️  Installing sonarqube-scanner..."
  npm install -g sonarqube-scanner
fi

npx sonarqube-scanner \
  -Dsonar.projectKey=$PROJECT_KEY \
  -Dsonar.host.url=$SONAR_HOST_URL \
  -Dsonar.token=$SONAR_TOKEN

echo ""
echo "======================================"
echo "✅ Analysis complete!"
echo ""
echo "📊 View results at:"
echo "   $SONAR_HOST_URL/dashboard?id=$PROJECT_KEY"
echo ""
