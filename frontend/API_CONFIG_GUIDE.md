# API Configuration Guide

## Overview

The Advana Marketplace uses a flexible, environment-aware API configuration system that supports:

- ✅ Local development with Vite proxy
- ✅ Local development with explicit backend URL
- ✅ Type-safe endpoint management
- ✅ Easy debugging and validation

## Architecture

### Files

```
frontend/
├── src/utils/api-config.ts          # Core API configuration module
├── .env.local                        # Local overrides (gitignored)
└── vite.config.ts                    # Vite proxy configuration
```

### Environment Priority

Vite loads environment files in this order (later files override earlier ones):

1. `.env` - Common defaults
2. `.env.local` - Local overrides (gitignored, for your machine only)

## Usage

### 1. Basic API Call

```typescript
import { getApiUrl } from '@/utils/api-config';

// Simple path-based URL
const url = getApiUrl('/api/requests');
fetch(url, { ... });
```

### 2. Using Typed Endpoints (Recommended)

```typescript
import { getEndpointUrl } from '@/utils/api-config';

// Type-safe endpoint access
const url = getEndpointUrl('SUBMIT_REQUEST');
fetch(url, { ... });
```

### 3. Available Endpoints

All endpoints are defined in `api-config.ts`:

```typescript
API_ENDPOINTS = {
  SUBMIT_REQUEST: "/api/requests",
  VIEW_FOR_REQUESTOR: "/api/requests/viewForRequestor",
  VIEW_PENDING: "/api/requests/viewPending",
  VIEW_ALL: "/api/requests/viewAll",
  REPORT_SUMMARY: "/api/report/summary",
};
```

### 4. Environment Helpers

```typescript
import { isBypassAuth, getEnvironmentInfo } from "@/utils/api-config";

// Check bypass auth setting
if (isBypassAuth) {
  console.log("Auth bypass is enabled");
}

// Debug configuration
console.log(getEnvironmentInfo());
// Returns: { mode, apiBaseUrl, bypassAuth }
```

## Environment Configuration

### Local Development (Vite Proxy)

**File:** `.env.local` or use default `.env.development`

```bash
# Leave empty to use Vite proxy
VITE_API_BASE_URL=

# Mock auth for local testing
VITE_BYPASS_AUTH=true
VITE_MOCK_USER_EMAIL=developer@advana.mil
```

**How it works:**

- Vite proxy (in `vite.config.ts`) forwards `/api/*` → `http://localhost:8082`
- No CORS issues
- Fast hot-reload

**Start:**

```bash
npm run dev
```

### Local Development (Direct Backend)

**File:** `.env.local`

```bash
# Point directly to local backend
VITE_API_BASE_URL=http://localhost:8082

# Mock auth
VITE_BYPASS_AUTH=true
```

**Use when:**

- Testing CORS configurations
- Debugging full request/response cycle
- Backend is in Docker

### Staging Environment

**File:** `.env.staging`

```bash
VITE_API_BASE_URL=https://advana-marketplace-monolith-node.staging.mtt.cdao.us
VITE_KEYCLOAK_URL=https://keycloak.staging.cdao.us/auth
VITE_KEYCLOAK_REALM=baby-yoda
VITE_KEYCLOAK_CLIENT_ID=marketplace
```

**Build:**

```bash
npm run build -- --mode staging
```

### Production Environment

**File:** `.env.production` (overridden by Kubernetes)

In production, environment variables are injected via:

- Kubernetes ConfigMap (from `chart/values.yaml`)
- Helm chart environment-specific values (`chart-env/dev/values.yaml`)

**Build:**

```bash
npm run build
```

## Debugging

### 1. Check Current Configuration

```typescript
import { logApiConfig } from "@/utils/api-config";

// In your component or main.tsx
logApiConfig();
```

**Output for localhost/development:**

```text
📡 API Configuration
┌────────────┬─────────────────────────┐
│ (index)    │ Values                  │
├────────────┼─────────────────────────┤
│ mode       │ 'test'                  │
│ apiBaseUrl │ 'http://localhost:8082' │
│ bypassAuth │ true                    │
└────────────┴─────────────────────────┘
Example endpoint: http://localhost:8082/api/requests
```

**Output for IL-2 environment:**

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

**Output for IL-5 environment (when available):**

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

**Note:** Currently IL-2 and IL-5 use the same endpoint. When IL-5 becomes available, update `.env.il5` with the proper IL-5 specific endpoints.

### 2. Browser Console Debugging

The application exposes debugging utilities via `window.debugAdvana` for easy testing:

```javascript
// ✅ View complete API configuration
debugAdvana.logApiConfig()

// ✅ Get environment info
debugAdvana.getEnvironmentInfo()

// ✅ Test API URL generation
debugAdvana.getApiUrl('/api/requests')

// ✅ Access environment variables
debugAdvana.env.VITE_API_BASE_URL
debugAdvana.env.VITE_ENVIRONMENT_NAME
debugAdvana.env.VITE_KEYCLOAK_URL

```javascript
// ✅ Quick verification table
console.table({
  'API Base URL': debugAdvana.env.VITE_API_BASE_URL,
  'Environment': debugAdvana.env.VITE_ENVIRONMENT_NAME,
  'Keycloak URL': debugAdvana.env.VITE_KEYCLOAK_URL,
  'Test Endpoint': debugAdvana.getApiUrl('/api/requests')
});

// ✅ Environment-specific validation
// For localhost:
// Expected: Environment: 'localhost', API Base URL: '', Test Endpoint: '/api/requests'

// For IL-2:
// Expected: Environment: 'IL-2', API Base URL: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us'

// For IL-5 (when available):
// Expected: Environment: 'IL-5', API Base URL: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us' (currently same as IL-2)
```
```

**Note:** ❌ Don't use `import.meta.env` directly in browser console (causes SyntaxError). Use `debugAdvana.env` instead.

## Environment Validation

### Acceptance Criteria Testing

**Given:** The site exists on localhost, IL-2, and IL-5
**When:** A user interacts on either side
**Then:** They only interact with the corresponding environment

### Step-by-Step Validation

#### Test 1: Localhost Environment

```bash
# 1. Start local development
npm run dev
# Opens: http://localhost:8080
```

**Browser Console Validation:**
```javascript
// Should show localhost configuration
debugAdvana.logApiConfig()
// Expected: mode: 'development', apiBaseUrl: '', bypassAuth: true

// Test API URL generation
debugAdvana.getApiUrl('/api/requests')
// Expected: '/api/requests' (relative path for proxy)

// Verify proxy target
debugAdvana.getEnvironmentInfo()
// Expected: { mode: 'development', apiBaseUrl: '', bypassAuth: true }
```

**Network Tab Verification:**
- API calls should go to `localhost:8082` via proxy
- No CORS preflight requests

#### Test 2: IL-2 Environment

```bash
# 1. Build for IL-2
npm run build:il2

# 2. Start preview
npm run preview
# Opens: http://localhost:8080
```

**Browser Console Validation:**
```javascript
// Should show IL-2 configuration
debugAdvana.logApiConfig()
// Expected: mode: 'il2', apiBaseUrl: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us'

// Test environment variables
console.table({
  'Environment': debugAdvana.env.VITE_ENVIRONMENT_NAME,        // Expected: 'IL-2'
  'API Base': debugAdvana.env.VITE_API_BASE_URL,              // Expected: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us'
  'Keycloak': debugAdvana.env.VITE_KEYCLOAK_URL,              // Expected: 'https://keycloak.cdao.us/auth'
  'Realm': debugAdvana.env.VITE_KEYCLOAK_REALM,               // Expected: 'baby-yoda'
  'Bypass Auth': debugAdvana.env.VITE_BYPASS_AUTH             // Expected: 'false'
});

// Test API endpoint generation
debugAdvana.getApiUrl('/api/requests')
// Expected: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us/api/requests'

// Test typed endpoints
import { getEndpointUrl } from '@/utils/api-config'  // In app code, not console
// getEndpointUrl('SUBMIT_REQUEST') should resolve to IL-2 API
```

#### Test 3: IL-5 Environment (Future)

```bash
# 1. Build for IL-5
npm run build:il5

# 2. Start preview  
npm run preview
# Opens: http://localhost:8080
```

**Browser Console Validation:**
```javascript
// Should show IL-5 configuration
debugAdvana.logApiConfig()
// Expected: mode: 'il5', apiBaseUrl: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us'

// Test environment variables
console.table({
  'Environment': debugAdvana.env.VITE_ENVIRONMENT_NAME,        // Expected: 'IL-5'
  'Classification': debugAdvana.env.VITE_CLASSIFICATION_LEVEL, // Expected: 'unclassified'
  'API Base': debugAdvana.env.VITE_API_BASE_URL,              // Expected: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us'
  'Keycloak': debugAdvana.env.VITE_KEYCLOAK_URL,              // Expected: 'https://keycloak.cdao.us/auth'
  'Realm': debugAdvana.env.VITE_KEYCLOAK_REALM,               // Expected: 'baby-yoda'
  'Bypass Auth': debugAdvana.env.VITE_BYPASS_AUTH             // Expected: 'false'
});

// Test API endpoint generation
debugAdvana.getApiUrl('/api/requests')
// Expected: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us/api/requests'

// Verify environment isolation
debugAdvana.getEnvironmentInfo()
// Expected: mode: 'il5', not 'il2' or 'development'
```

**When IL-5 becomes available:**
1. Update `.env.il5` with IL-5 specific endpoints
2. Rebuild with `npm run build:il5`
3. Verify new endpoints in browser console
4. Test that IL-5 and IL-2 use different API endpoints
5. Confirm no cross-environment API calls

**Current Status:** IL-5 uses same endpoints as IL-2 but with different environment identifier for future separation.

### Automated Validation Tests

Create comprehensive test suite for environment isolation:

```typescript
// In api-config.test.ts
describe('Environment Isolation Acceptance Tests', () => {
  
  test('localhost environment isolates correctly', async () => {
    mockEnvironment('localhost');
    
    const config = getExpectedConfig('localhost');
    const actualEndpoint = getApiUrl('/api/requests');
    
    expect(actualEndpoint).toBe(config.expectedEndpoint);
    expect(isBypassAuth).toBe(config.expectedBypassAuth);
  });
  
  test('IL-2 environment isolates correctly', async () => {
    mockEnvironment('il2');
    
    const config = getExpectedConfig('il2');
    const actualEndpoint = getApiUrl('/api/requests');
    
    expect(actualEndpoint).toBe(config.expectedEndpoint);
    expect(isBypassAuth).toBe(config.expectedBypassAuth);
    expect(getEnvironmentInfo().apiBaseUrl).toBe(config.expectedApiBaseUrl);
  });
  
  test('IL-5 environment isolates correctly', async () => {
    mockEnvironment('il5');
    
    const config = getExpectedConfig('il5');
    const actualEndpoint = getApiUrl('/api/requests');
    
    expect(actualEndpoint).toBe(config.expectedEndpoint);
    expect(isBypassAuth).toBe(config.expectedBypassAuth);
  });
  
  test('environments do not cross-communicate', () => {
    // Test that each environment uses distinct endpoints
    mockEnvironment('localhost');
    const localhostUrl = getApiUrl('/api/test');
    
    mockEnvironment('il2');
    const il2Url = getApiUrl('/api/test');
    
    mockEnvironment('il5');
    const il5Url = getApiUrl('/api/test');
    
    // Ensure environments are isolated
    expect(localhostUrl).not.toBe(il2Url);
    expect(il2Url).toBe(il5Url); // Currently same endpoint, but different env identifier
  });
});
```

### Manual Integration Testing

**Cross-Environment Verification:**

1. **Build all environments:**
```bash
npm run build:localhost
npm run build:il2  
npm run build:il5
```

2. **Deploy to different domains and verify:**
   - Each environment only calls its designated API endpoints
   - No cross-environment API leakage
   - Authentication flows use correct Keycloak instances

3. **Network monitoring:**
   - Use browser DevTools Network tab
   - Verify API calls match expected environment endpoints
   - Check for any unauthorized cross-environment requests

## Common Scenarios

### Scenario 1: Local Development with Mock Data

```bash
# .env.local
VITE_API_BASE_URL=
VITE_BYPASS_AUTH=true
VITE_MOCK_USER_EMAIL=dev@example.com
```

```bash
npm run dev
# Browser opens at http://localhost:8080
# API calls go to http://localhost:8082 via proxy
```

### Scenario 2: Test Against Dev Environment

```bash
# .env.local
VITE_API_BASE_URL=https://advana-marketplace-monolith-node.dev.mtt.cdao.us
VITE_KEYCLOAK_URL=https://keycloak.cdao.us/auth
VITE_KEYCLOAK_REALM=baby-yoda
VITE_KEYCLOAK_CLIENT_ID=marketplace
```

```bash
npm run dev
# Browser opens at http://localhost:8080
# API calls go directly to dev.mtt.cdao.us
# Keycloak authentication required
```

### Scenario 3: Docker Local Deployment

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8082
```

```bash
docker compose up
# Frontend: http://localhost:8080
# Backend: http://localhost:8082
# No proxy needed, direct connection
```

### Scenario 4: Production Build for Staging

```bash
npm run build -- --mode staging
# Uses .env.staging configuration
# Creates optimized build in dist/
```

## Adding New Endpoints

### Step 1: Add to API_ENDPOINTS

```typescript
// src/utils/api-config.ts
export const API_ENDPOINTS = {
  // ... existing endpoints
  USER_PROFILE: "/api/users/profile",
  ADMIN_DASHBOARD: "/api/admin/dashboard",
} as const;
```

### Step 2: Use in your service

```typescript
import { getEndpointUrl } from "@/utils/api-config";

const response = await fetch(getEndpointUrl("USER_PROFILE"));
```

### Step 3: Benefits

- ✅ Autocomplete in IDE
- ✅ Type checking
- ✅ Easy refactoring
- ✅ Centralized endpoint management

## Troubleshooting

### Issue: API calls return 404

**Check:**

1. Backend is running: `curl http://localhost:8082/api/health`
2. Vite proxy is configured: Check `vite.config.ts`
3. Path is correct: `/api/*` (note the leading slash)

### Issue: CORS errors in production

**Solution:**

- Don't use Vite proxy in production
- Set `VITE_API_BASE_URL` to full backend URL
- Ensure backend has correct CORS headers

### Issue: Environment variables not loading

**Check:**

1. Variable starts with `VITE_` prefix
2. Server was restarted after changing `.env` files
3. File is in correct location: `frontend/.env.local`
4. Not using browser-side `process.env` (use `import.meta.env`)

### Issue: Different URLs for different environments

**Solution:**
Use mode-specific build:

```bash
# Development
npm run dev

# Staging
npm run build -- --mode staging

# Production
npm run build -- --mode production
```

## Best Practices

1. ✅ **Use `getEndpointUrl()` for predefined endpoints**
   - Type-safe
   - Easy to refactor
2. ✅ **Use `getApiUrl()` for dynamic paths**

   - Flexible
   - Good for parameterized URLs

3. ✅ **Never hardcode URLs**

   ```typescript
   // ❌ Bad
   fetch("http://localhost:8082/api/requests");

   // ✅ Good
   fetch(getEndpointUrl("SUBMIT_REQUEST"));
   ```

4. ✅ **Keep `.env.local` out of git**

   - Already in `.gitignore`
   - Personal configuration

5. ✅ **Document environment variables**

   - Update this guide
   - Add comments in `.env.example`

6. ✅ **Log configuration for debugging**

   ```typescript
   // main.tsx or any component
   import { logApiConfig } from "@/utils/api-config";

   if (import.meta.env.DEV) {
     logApiConfig();
   }
   ```

## Migration from Old System

If you're migrating from the old `env-switching.ts` and `getDomainConfig`:

**Old way (deprecated):**

```typescript
import getDomainConfig from "./env-switching";
const config = getDomainConfig();
fetch(`${config.apiEndpoint}/api/requests`);

// Old testing approach
const domain = getDomainConfig();
console.log(domain); // Runtime domain detection
```

**New way (current):**

```typescript
import { getEndpointUrl } from "@/utils/api-config";
fetch(getEndpointUrl("SUBMIT_REQUEST"));

// New testing approach - browser console
debugAdvana.logApiConfig();
debugAdvana.getApiUrl('/api/requests');
```

**Testing Migration:**

**Old Test Pattern (❌ Deprecated):**
```typescript
// Don't use this anymore
test('getDomainConfig detects environment', () => {
  const config = getDomainConfig();
  expect(config.apiEndpoint).toBeDefined();
});
```

**New Test Pattern (✅ Current):**
```typescript
// Use this instead
test('environment isolation works correctly', () => {
  mockEnvironment('il2');
  
  const endpoint = getApiUrl('/api/requests');
  expect(endpoint).toBe('https://advana-marketplace-monolith-node.dev.mtt.cdao.us/api/requests');
  
  const envInfo = getEnvironmentInfo();
  expect(envInfo.apiBaseUrl).toBe('https://advana-marketplace-monolith-node.dev.mtt.cdao.us');
});
```

**Benefits:**

- ✅ Type safety with `getEndpointUrl()`
- ✅ Environment variable based (standard Vite approach)
- ✅ Works with build tools and different deployment modes
- ✅ Better debugging with `debugAdvana` utilities
- ✅ No runtime hostname detection needed
- ✅ Proper environment isolation testing
- ✅ Browser console debugging support

## References

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vite Proxy Configuration](https://vitejs.dev/config/server-options.html#server-proxy)

- Project: `chart/values.yaml` - Kubernetes environment configuration
- Project: `vite.config.ts` - Development proxy configuration

### Documentation
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vite Proxy Configuration](https://vitejs.dev/config/server-options.html#server-proxy)

### Project Files
- `chart/values.yaml` - Kubernetes environment configuration
- `vite.config.ts` - Development proxy configuration  
- `src/utils/api-config.ts` - Core API configuration module
- `src/utils/test-utils.ts` - Environment testing utilities
- `.env.il2` - IL-2 environment configuration
- `.env.il5` - IL-5 environment configuration

### Testing & Validation
- Browser console: `debugAdvana.*` utilities for runtime validation
- Unit tests: `mockEnvironment()` helper for environment simulation
- Integration tests: `getExpectedConfig()` for assertion patterns
- Network monitoring: Browser DevTools for API call verification

### Build Commands
- `npm run dev` - Local development with proxy
- `npm run build:localhost` - Build for localhost environment
- `npm run build:il2` - Build for IL-2 environment  
- `npm run build:il5` - Build for IL-5 environment
- `npm run preview` - Preview built application
