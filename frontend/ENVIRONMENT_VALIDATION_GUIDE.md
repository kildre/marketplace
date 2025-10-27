# Environment Validation Guide

## Overview

This guide provides step-by-step instructions for validating that the Advana Marketplace properly isolates environments and uses correct API endpoints for each deployment target.

## Acceptance Criteria

**Given:** The site exists on localhost, IL-2, and IL-5  
**When:** A user interacts on either side  
**Then:** They only interact with the corresponding environment

## Environment Configuration Files

### .env.il2 (IL-2 Classified Environment)

Create or verify `.env.il2` contains:

```bash
# IL-2 (Classified) Environment Configuration
# For use in classified environments only

# ============================================================================
# ENVIRONMENT IDENTIFICATION
# ============================================================================
VITE_ENVIRONMENT_NAME=IL-2
VITE_CLASSIFICATION_LEVEL=classified

# ============================================================================
# API CONFIGURATION - CLASSIFIED NETWORK
# ============================================================================
VITE_API_BASE_URL=https://advana-marketplace-monolith-node.dev.mtt.cdao.us
VITE_API_TIMEOUT=30000

# ============================================================================
# KEYCLOAK AUTHENTICATION - CLASSIFIED
# ============================================================================
VITE_BYPASS_AUTH=false
VITE_KEYCLOAK_URL=https://keycloak.cdao.us/auth
VITE_KEYCLOAK_REALM=baby-yoda
VITE_KEYCLOAK_CLIENT_ID=marketplace
VITE_KEYCLOAK_CHECK_LOGIN_IFRAME=false

# ============================================================================
# SECURITY CONFIGURATION
# ============================================================================
VITE_ENABLE_CORS=false
VITE_ALLOWED_DOMAINS=*.cdao.us,*.mtt.cdao.us
VITE_ENABLE_DEBUGGING=false
VITE_LOG_LEVEL=error
```

### .env.il5 (IL-5 Unclassified Environment)

Create or verify `.env.il5` contains:

```bash
# IL-5 (Unclassified) Environment Configuration  
# For use in unclassified production environments

# ============================================================================
# ENVIRONMENT IDENTIFICATION
# ============================================================================
VITE_ENVIRONMENT_NAME=IL-5
VITE_CLASSIFICATION_LEVEL=unclassified

# ============================================================================
# API CONFIGURATION - UNCLASSIFIED NETWORK
# ============================================================================
VITE_API_BASE_URL=https://advana-marketplace-monolith-node.dev.mtt.cdao.us
VITE_API_TIMEOUT=30000

# ============================================================================
# KEYCLOAK AUTHENTICATION - UNCLASSIFIED
# ============================================================================
VITE_BYPASS_AUTH=false
VITE_KEYCLOAK_URL=https://keycloak.cdao.us/auth
VITE_KEYCLOAK_REALM=baby-yoda
VITE_KEYCLOAK_CLIENT_ID=marketplace
VITE_KEYCLOAK_CHECK_LOGIN_IFRAME=false

# ============================================================================
# SECURITY CONFIGURATION
# ============================================================================
VITE_ENABLE_CORS=false
VITE_ALLOWED_DOMAINS=*.cdao.us,*.mtt.cdao.us
VITE_ENABLE_DEBUGGING=false
VITE_LOG_LEVEL=warn
```

## Validation Tests

### Test 1: Localhost Environment

**Build and Start:**
```bash
npm run dev
# Opens: http://localhost:8080
# Backend proxy: localhost:8082
```

**Browser Console Validation:**
```javascript
// Complete configuration check
debugAdvana.logApiConfig()
```

**Expected Output:**
```text
📡 API Configuration
┌────────────┬─────────────────────────┐
│ (index)    │ Values                  │
├────────────┼─────────────────────────┤
│ mode       │ 'development'           │
│ apiBaseUrl │ ''                      │
│ bypassAuth │ true                    │
└────────────┴─────────────────────────┘
Example endpoint: /api/requests
```

**Environment Variables Check:**
```javascript
console.table({
  'Environment': debugAdvana.env.VITE_ENVIRONMENT_NAME,        // Expected: undefined or 'localhost'
  'API Base URL': debugAdvana.env.VITE_API_BASE_URL,          // Expected: '' (empty)
  'Bypass Auth': debugAdvana.env.VITE_BYPASS_AUTH,            // Expected: 'true'
  'Mode': debugAdvana.env.MODE,                               // Expected: 'development'
  'Test Endpoint': debugAdvana.getApiUrl('/api/requests')     // Expected: '/api/requests'
});
```

**Validation Criteria:**
- ✅ API calls use relative paths (proxy to localhost:8082)
- ✅ Authentication is bypassed
- ✅ No CORS issues in Network tab
- ✅ Hot reload works

### Test 2: IL-2 Environment

**Build and Start:**
```bash
npm run build:il2
npm run preview
# Opens: http://localhost:8080
```

**Browser Console Validation:**
```javascript
// Complete configuration check
debugAdvana.logApiConfig()
```

**Expected Output:**
```text
📡 API Configuration
┌────────────┬─────────────────────────┐
│ (index)    │ Values                  │
├────────────┼─────────────────────────┤
│ mode       │ 'il2'                   │
│ apiBaseUrl │ 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us' │
│ bypassAuth │ false                   │
└────────────┴─────────────────────────┘
Example endpoint: https://advana-marketplace-monolith-node.dev.mtt.cdao.us/api/requests
```

**Environment Variables Check:**
```javascript
console.table({
  'Environment': debugAdvana.env.VITE_ENVIRONMENT_NAME,        // Expected: 'IL-2'
  'Classification': debugAdvana.env.VITE_CLASSIFICATION_LEVEL, // Expected: 'classified'
  'API Base URL': debugAdvana.env.VITE_API_BASE_URL,          // Expected: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us'
  'Keycloak URL': debugAdvana.env.VITE_KEYCLOAK_URL,          // Expected: 'https://keycloak.cdao.us/auth'
  'Keycloak Realm': debugAdvana.env.VITE_KEYCLOAK_REALM,      // Expected: 'baby-yoda'
  'Bypass Auth': debugAdvana.env.VITE_BYPASS_AUTH,            // Expected: 'false'
  'Mode': debugAdvana.env.MODE,                               // Expected: 'il2'
  'Test Endpoint': debugAdvana.getApiUrl('/api/requests')     // Expected: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us/api/requests'
});
```

**API Endpoint Testing:**
```javascript
// Test all endpoints resolve correctly
console.log('Submit Request:', debugAdvana.getApiUrl('/api/requests'));
console.log('View Pending:', debugAdvana.getApiUrl('/api/requests/viewPending'));
console.log('Report Summary:', debugAdvana.getApiUrl('/api/report/summary'));

// All should start with: https://advana-marketplace-monolith-node.dev.mtt.cdao.us
```

**Validation Criteria:**
- ✅ API calls go to dev.mtt.cdao.us endpoints
- ✅ Environment shows 'IL-2'
- ✅ Authentication is required (bypassAuth: false)
- ✅ Keycloak points to cdao.us auth
- ✅ Classification level is 'classified'

### Test 3: IL-5 Environment

**Build and Start:**
```bash
npm run build:il5
npm run preview
# Opens: http://localhost:8080
```

**Browser Console Validation:**
```javascript
// Complete configuration check
debugAdvana.logApiConfig()
```

**Expected Output:**
```text
📡 API Configuration
┌────────────┬─────────────────────────┐
│ (index)    │ Values                  │
├────────────┼─────────────────────────┤
│ mode       │ 'il5'                   │
│ apiBaseUrl │ 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us' │
│ bypassAuth │ false                   │
└────────────┴─────────────────────────┘
Example endpoint: https://advana-marketplace-monolith-node.dev.mtt.cdao.us/api/requests
```

**Environment Variables Check:**
```javascript
console.table({
  'Environment': debugAdvana.env.VITE_ENVIRONMENT_NAME,        // Expected: 'IL-5'
  'Classification': debugAdvana.env.VITE_CLASSIFICATION_LEVEL, // Expected: 'unclassified'
  'API Base URL': debugAdvana.env.VITE_API_BASE_URL,          // Expected: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us'
  'Keycloak URL': debugAdvana.env.VITE_KEYCLOAK_URL,          // Expected: 'https://keycloak.cdao.us/auth'
  'Keycloak Realm': debugAdvana.env.VITE_KEYCLOAK_REALM,      // Expected: 'baby-yoda'
  'Bypass Auth': debugAdvana.env.VITE_BYPASS_AUTH,            // Expected: 'false'
  'Mode': debugAdvana.env.MODE,                               // Expected: 'il5'
  'Test Endpoint': debugAdvana.getApiUrl('/api/requests')     // Expected: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us/api/requests'
});
```

**Environment Isolation Check:**
```javascript
// Verify IL-5 is distinct from IL-2
debugAdvana.getEnvironmentInfo()
// Should show mode: 'il5', not 'il2' or 'development'

// Classification should be different
console.log('IL-5 Classification:', debugAdvana.env.VITE_CLASSIFICATION_LEVEL); // Expected: 'unclassified'
```

**Validation Criteria:**
- ✅ API calls go to dev.mtt.cdao.us endpoints (currently same as IL-2)
- ✅ Environment shows 'IL-5' (not 'IL-2')
- ✅ Classification level is 'unclassified' (not 'classified')
- ✅ Authentication is required (bypassAuth: false)
- ✅ Mode is 'il5'

## Cross-Environment Validation

### Environment Isolation Test

Run all environments and verify they use distinct configurations:

```bash
# Test all environments
npm run dev          # localhost
npm run build:il2 && npm run preview    # IL-2
npm run build:il5 && npm run preview    # IL-5
```

**Browser Console Cross-Check:**
```javascript
// This should be run in each environment
debugAdvana.getEnvironmentInfo()

// Localhost should show: mode: 'development', apiBaseUrl: ''
// IL-2 should show: mode: 'il2', apiBaseUrl: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us'
// IL-5 should show: mode: 'il5', apiBaseUrl: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us'
```

### Network Tab Verification

1. **Open Browser DevTools → Network Tab**
2. **Trigger API calls in the application**
3. **Verify endpoints match expected environment:**

**Localhost:** API calls should go to `localhost:8082` (via proxy)
**IL-2:** API calls should go to `advana-marketplace-monolith-node.dev.mtt.cdao.us`
**IL-5:** API calls should go to `advana-marketplace-monolith-node.dev.mtt.cdao.us`

## Troubleshooting

### Issue: Wrong environment detected

**Check:**
```javascript
debugAdvana.env.MODE
debugAdvana.env.VITE_ENVIRONMENT_NAME
```

**Solution:**
- Ensure correct build command was used
- Rebuild if environment seems wrong
- Check `.env.il2` or `.env.il5` files exist

### Issue: API calls going to wrong endpoint

**Check:**
```javascript
debugAdvana.getApiUrl('/api/test')
debugAdvana.env.VITE_API_BASE_URL
```

**Solution:**
- Verify environment file has correct `VITE_API_BASE_URL`
- Rebuild with correct mode: `npm run build:il2` or `npm run build:il5`
- Clear browser cache

### Issue: Authentication not working

**Check:**
```javascript
debugAdvana.env.VITE_BYPASS_AUTH
debugAdvana.env.VITE_KEYCLOAK_URL
```

**Solution:**
- Localhost should have `VITE_BYPASS_AUTH=true`
- IL-2/IL-5 should have `VITE_BYPASS_AUTH=false`
- Verify Keycloak URL is correct for environment

### Issue: Cannot access debugAdvana

**Check if debugging utilities are loaded:**
```javascript
window.debugAdvana
```

**Solution:**
- Ensure app has loaded completely
- Check console for JavaScript errors
- Verify main.tsx includes debugging utilities

## Build Commands Reference

```bash
# Development (localhost)
npm run dev

# Build for localhost
npm run build:localhost

# Build for IL-2
npm run build:il2

# Build for IL-5
npm run build:il5

# Preview built application
npm run preview
```

## Success Criteria

✅ **Environment Isolation:** Each environment uses its designated API endpoints  
✅ **Configuration Validation:** Environment variables load correctly for each mode  
✅ **Authentication Handling:** Bypass works for localhost, required for IL-2/IL-5  
✅ **Network Verification:** API calls go to expected endpoints in Network tab  
✅ **Build Process:** All build commands complete successfully  
✅ **Browser Testing:** Console debugging utilities work in all environments
