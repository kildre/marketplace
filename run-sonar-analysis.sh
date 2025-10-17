#!/bin/bash

# SonarQube Analysis Script
# Automatically sources .env.sonar if it exists

# Source .env.sonar if it exists
if [ -f .env.sonar ]; then
  echo "Loading environment variables from .env.sonar..."
  source .env.sonar
fi

# Default values (can be overridden by environment variables)
SONAR_HOST_URL="${SONAR_HOST_URL:-https://sonarqube.cdao.us}"
PROJECT_KEY="tenant-metrostar-advana-marketplace"

# Check if token is set
if [ -z "$SONAR_TOKEN" ]; then
  echo "Error: SONAR_TOKEN environment variable is not set"
  echo "Please create a .env.sonar file with:"
  echo "  export SONAR_TOKEN='your-token-here'"
  echo "  export SONAR_HOST_URL='https://sonarqube.cdao.us'"
  exit 1
fi

echo "============================================"
echo "Step 1: Running tests with coverage..."
echo "============================================"
cd frontend && npm run test:coverage
if [ $? -ne 0 ]; then
  echo "Error: Tests failed. Fix test failures before running SonarQube analysis."
  exit 1
fi
cd ..

echo ""
echo "============================================"
echo "Step 2: Running SonarQube analysis..."
echo "============================================"
echo "Project: $PROJECT_KEY"
echo "Host: $SONAR_HOST_URL"

npx sonarqube-scanner \
  -Dsonar.projectKey=$PROJECT_KEY \
  -Dsonar.sources=frontend/src \
  -Dsonar.host.url=$SONAR_HOST_URL \
  -Dsonar.token=$SONAR_TOKEN

echo "Analysis complete! Check your SonarQube dashboard at $SONAR_HOST_URL"
