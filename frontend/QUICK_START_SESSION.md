# Frontend Session Integration - Quick Start

## TL;DR

Your frontend now supports session-based authentication with the backend. Here's what you need to know:

## Setup (5 minutes)

### 1. Add Environment Variable

Add to `.env`:
```bash
# Optional: Enable session storage (recommended for production)
VITE_USE_SESSION_STORAGE=true
```

### 2. That's It!

The frontend automatically:
- ✅ Registers sessions on login
- ✅ Uses session IDs for API calls
- ✅ Falls back to direct tokens if registration fails
- ✅ Cleans up sessions on logout

## Two Authentication Modes

### Mode 1: Session Storage (Production)
```
User → Keycloak → Frontend → Backend (/api/session/register)
                                 ↓
                           Store in DB
                                 ↓
Frontend → Backend (session ID) → Validate → Process
```

**When to use:**
- ✅ Production deployments
- ✅ High traffic applications
- ✅ When you need session management

### Mode 2: Direct Token (Development)
```
User → Keycloak → Frontend → Backend (JWT token) → Keycloak → Process
```

**When to use:**
- ✅ Local development
- ✅ Simple deployments
- ✅ When you want stateless auth

## Configuration Examples

### Development
```bash
# .env.development
VITE_USE_SESSION_STORAGE=false  # Direct token mode
VITE_API_BASE_URL=http://localhost:8082
```

### Production
```bash
# .env.production
VITE_USE_SESSION_STORAGE=true   # Session storage mode
VITE_API_BASE_URL=https://api.cdao.us
```

## How to Test

### 1. Check Session Registration
```javascript
// In browser console after login
localStorage.getItem('marketplace_session_id')
// Should return: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
```

### 2. Verify API Calls
```javascript
// In Network tab, check Authorization header
// Session mode: Authorization: Bearer <uuid>
// Direct mode:  Authorization: Bearer <long-jwt-token>
```

### 3. Check Session Status
```bash
# Test session endpoint
curl http://localhost:8082/api/session/<session-id>
```

## Key Files

### New
- `frontend/src/services/sessionService.ts` - Session management
- `frontend/BACKEND_SESSION_INTEGRATION.md` - Full documentation

### Modified
- `frontend/src/services/apiService.ts` - Uses session ID when available
- `frontend/src/services/keycloakService.ts` - Registers sessions on login
- `frontend/src/main.tsx` - Initializes sessions

## Troubleshooting

### Problem: Session not being created
**Check:**
1. `VITE_USE_SESSION_STORAGE=true` in `.env`
2. Backend has `USE_CLIENT_SESSION_STORAGE=true`
3. Browser console for errors

### Problem: 401 errors after login
**Check:**
1. Session ID in localStorage: `localStorage.getItem('marketplace_session_id')`
2. Backend logs for session registration
3. Database has session record

### Problem: Want to disable sessions
**Solution:**
```bash
# Set in .env
VITE_USE_SESSION_STORAGE=false

# Clear browser storage
localStorage.removeItem('marketplace_session_id')
localStorage.removeItem('marketplace_use_session_storage')

# Reload app
```

## Benefits

### Session Storage Mode
- 🚀 **Faster** - Fewer calls to Keycloak
- 🔒 **Secure** - Tokens stored server-side
- 📊 **Auditable** - Better logging and tracking
- 🎯 **Manageable** - Instant session revocation

### Direct Token Mode
- 🎯 **Simple** - No session management
- 🔄 **Stateless** - No database dependency
- 🐛 **Debuggable** - Easier to trace token flow

## What Changed?

### For Developers
- **No code changes required** in components
- **Backward compatible** with existing code
- **Automatic fallback** if session registration fails

### For API Calls
```typescript
// Before (still works)
const response = await ApiService.submitRequest(data);

// After (automatic)
// If VITE_USE_SESSION_STORAGE=true:
//   Uses session ID in Authorization header
// If VITE_USE_SESSION_STORAGE=false:
//   Uses Keycloak token in Authorization header
```

## Next Steps

1. **Test locally** with `VITE_USE_SESSION_STORAGE=false`
2. **Enable in staging** with `VITE_USE_SESSION_STORAGE=true`
3. **Monitor session table** size and performance
4. **Enable in production** after validation

## Questions?

See [BACKEND_SESSION_INTEGRATION.md](./BACKEND_SESSION_INTEGRATION.md) for:
- Detailed architecture
- API endpoint documentation
- Security considerations
- Migration guide
- Best practices

## Emergency Rollback

If you need to disable session storage immediately:

```bash
# 1. Update environment
VITE_USE_SESSION_STORAGE=false

# 2. Rebuild and deploy
npm run build

# 3. No other changes needed - frontend automatically uses direct token mode
```
