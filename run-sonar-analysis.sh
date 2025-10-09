#!/bin/bash

# SonarQube Analysis Script
# Set these environment variables before running:
#   export SONAR_TOKEN="your-token-here"
#   export SONAR_HOST_URL="https://sonarqube.cdao.us"
# Or create a .env file and source it: source .env

# Default values (can be overridden by environment variables)
SONAR_HOST_URL="${SONAR_HOST_URL:-https://sonarqube.cdao.us}"
PROJECT_KEY="tenant-metrostar-advana-marketplace"

# Check if token is set
if [ -z "$SONAR_TOKEN" ]; then
  echo "Error: SONAR_TOKEN environment variable is not set"
  echo "Please set it with: export SONAR_TOKEN='your-token-here'"
  echo "Or create a .env file with SONAR_TOKEN=your-token-here and run: source .env"
  exit 1
fi

echo "Running SonarQube analysis..."
echo "Project: $PROJECT_KEY"
echo "Host: $SONAR_HOST_URL"

npx sonarqube-scanner \
  -Dsonar.projectKey=$PROJECT_KEY \
  -Dsonar.sources=frontend/src \
  -Dsonar.host.url=$SONAR_HOST_URL \
  -Dsonar.token=$SONAR_TOKEN

echo "Analysis complete! Check your SonarQube dashboard at $SONAR_HOST_URL"
