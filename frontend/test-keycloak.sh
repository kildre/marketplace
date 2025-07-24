#!/bin/bash

echo "🔍 Testing Keycloak Configuration..."
echo ""

# Test if Keycloak server is reachable
echo "1. Testing Keycloak server connectivity..."
curl -s -o /dev/null -w "%{http_code}" https://keycloak.cdao.us/auth/realms/baby-yoda/.well-known/openid_configuration

if [ $? -eq 0 ]; then
    echo "✅ Keycloak server is reachable"
else
    echo "❌ Cannot reach Keycloak server"
fi

echo ""
echo "2. Current environment variables:"
echo "VITE_KEYCLOAK_URL: $VITE_KEYCLOAK_URL"
echo "VITE_KEYCLOAK_REALM: $VITE_KEYCLOAK_REALM" 
echo "VITE_KEYCLOAK_CLIENT_ID: $VITE_KEYCLOAK_CLIENT_ID"

echo ""
echo "3. Testing realm configuration..."
curl -s https://keycloak.cdao.us/auth/realms/baby-yoda/.well-known/openid_configuration | head -n 5

echo ""
echo "🚀 Open your browser to: http://localhost:7501"
