#!/bin/bash

# SonarQube Analysis Script
# Replace SONAR_HOST_URL with your actual SonarQube server URL
# Common values: http://localhost:9000 (local) or your hosted SonarQube URL

SONAR_HOST_URL="https://sonarqube.cdao.us/dashboard?branch=CA-579&id=tenant-metrostar-advana-marketplace&codeScope=overall"  # Update this with your actual SonarQube URL
SONAR_TOKEN="sqp_11058430c61f5a81d802594adb6dcb61172003f8"
PROJECT_KEY="tenant-metrostar-advana-marketplace"

echo "Running SonarQube analysis..."
echo "Project: $PROJECT_KEY"
echo "Host: $SONAR_HOST_URL"

npx sonarqube-scanner \
  -Dsonar.projectKey=$PROJECT_KEY \
  -Dsonar.sources=frontend/src \
  -Dsonar.host.url=$SONAR_HOST_URL \
  -Dsonar.token=$SONAR_TOKEN

echo "Analysis complete! Check your SonarQube dashboard at $SONAR_HOST_URL"
