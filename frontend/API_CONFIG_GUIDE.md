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

Output:

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

### 2. Browser Console

```javascript
// Check loaded environment variables
console.log(import.meta.env);

// Check specific variable
console.log(import.meta.env.VITE_API_BASE_URL);
```

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

If you're migrating from the old `env-switching.ts`:

**Old way:**

```typescript
import getDomainConfig from "./env-switching";
const config = getDomainConfig();
fetch(`${config.apiEndpoint}/api/requests`);
```

**New way:**

```typescript
import { getEndpointUrl } from "@/utils/api-config";
fetch(getEndpointUrl("SUBMIT_REQUEST"));
```

**Benefits:**

- ✅ Type safety
- ✅ Environment variable based (standard)
- ✅ Works with build tools
- ✅ Better debugging
- ✅ No runtime hostname detection needed

## References

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vite Proxy Configuration](https://vitejs.dev/config/server-options.html#server-proxy)
- Project: `chart/values.yaml` - Kubernetes environment configuration
- Project: `vite.config.ts` - Development proxy configuration
