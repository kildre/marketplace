# Backend Session Integration Guide

This guide explains how the frontend integrates with the backend's session-based token management system.

## Overview

The backend now supports two authentication modes:

1. **Direct Token Mode** (`USE_CLIENT_SESSION_STORAGE=false` on backend)
   - Frontend sends Keycloak JWT token directly in every request
   - Backend validates token with Keycloak on each request
   - Simple, stateless architecture

2. **Session Storage Mode** (`USE_CLIENT_SESSION_STORAGE=true` on backend)
   - Frontend registers token once with backend and receives a session ID
   - Frontend uses session ID for subsequent requests
   - Backend stores token in PostgreSQL and validates it
   - Reduces network calls to Keycloak
   - Enables better session management and audit logging

## Frontend Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Session Storage Mode (optional)
# Set to true to enable session-based authentication
# If not set or false, uses direct token mode
VITE_USE_SESSION_STORAGE=true

# Backend API URL
VITE_API_BASE_URL=http://localhost:8082

# Keycloak Configuration (required for both modes)
VITE_KEYCLOAK_URL=https://keycloak.cdao.us/auth
VITE_KEYCLOAK_REALM=marketplace
VITE_KEYCLOAK_CLIENT_ID=marketplace-ui
VITE_KEYCLOAK_CHECK_LOGIN_IFRAME=false
```

### Development vs Production

**Development (.env.development)**
```bash
VITE_USE_SESSION_STORAGE=false  # Simpler debugging with direct tokens
VITE_API_BASE_URL=http://localhost:8082
VITE_BYPASS_AUTH=false
```

**Production (.env.production)**
```bash
VITE_USE_SESSION_STORAGE=true   # Enable session storage for production
VITE_API_BASE_URL=https://api.cdao.us
VITE_BYPASS_AUTH=false
```

## How It Works

### Session Storage Mode (Recommended for Production)

1. **User Login**
   - User authenticates with Keycloak
   - Keycloak returns access token and refresh token
   - Frontend receives tokens via `@react-keycloak/web`

2. **Session Registration**
   - Frontend automatically calls `POST /api/session/register` with:
     ```json
     {
       "sessionId": "generated-uuid",
       "refreshToken": "optional-refresh-token"
     }
     ```
   - Authorization header contains the Keycloak access token
   - Backend validates token, extracts roles, stores in database
   - Backend returns confirmation

3. **Subsequent API Calls**
   - Frontend uses session ID in Authorization header:
     ```
     Authorization: Bearer <session-id>
     ```
   - Backend looks up session in database
   - Backend retrieves stored access token
   - Backend validates token with Keycloak
   - Backend processes request

4. **Session Cleanup**
   - On logout, frontend calls `POST /api/session/expire`
   - Backend deletes session from database
   - Frontend clears local session ID

### Direct Token Mode (Simpler for Development)

1. **User Login**
   - User authenticates with Keycloak
   - Frontend receives access token

2. **API Calls**
   - Frontend sends Keycloak token directly:
     ```
     Authorization: Bearer <keycloak-jwt-token>
     ```
   - Backend validates token with Keycloak on each request

3. **No Session Management**
   - No session registration needed
   - Stateless authentication

## Key Files Modified

### New Files
- `frontend/src/services/sessionService.ts` - Session management service
  - Handles session registration, status checks, expiration
  - Manages localStorage for session IDs
  - Provides session lifecycle methods

### Updated Files
- `frontend/src/services/apiService.ts`
  - Updated `getAuthHeaders()` to check for session ID first
  - Falls back to direct token mode if no session ID

- `frontend/src/services/keycloakService.ts`
  - Calls `SessionService.initializeSession()` on token updates
  - Calls `SessionService.cleanup()` on logout

- `frontend/src/main.tsx`
  - Added session initialization in `handleTokens` callback

## API Endpoints Used

### Session Registration
```
POST /api/session/register
Authorization: Bearer <keycloak-access-token>
Content-Type: application/json

{
  "sessionId": "uuid",
  "refreshToken": "optional-refresh-token"
}

Response: 201 Created
{
  "sessionId": "uuid",
  "stored": true
}
```

### Session Status Check
```
GET /api/session/{sessionId}

Response: 200 OK
{
  "exists": true,
  "expired": false,
  "username": "user@example.com",
  "roles": ["marketplace-approver"]
}
```

### Session Expiration
```
POST /api/session/expire
Content-Type: application/json

{
  "sessionId": "uuid"
}

Response: 200 OK
{
  "sessionId": "uuid",
  "expired": true
}
```

## Benefits of Session Storage Mode

### Performance
- Reduces calls to Keycloak introspection endpoint
- Backend caches token validation results
- Lower latency for API calls

### Security
- Tokens stored in database (not localStorage)
- Centralized session management
- Immediate session revocation capability
- Better audit logging

### User Experience
- Faster API responses
- Consistent session state across tabs (optional)
- Better error handling for expired sessions

## Troubleshooting

### Session Not Being Created

**Problem:** API calls still using direct token mode

**Solution:**
1. Check `VITE_USE_SESSION_STORAGE=true` in `.env`
2. Verify backend has `USE_CLIENT_SESSION_STORAGE=true`
3. Check browser console for session registration errors
4. Verify backend `/api/session/register` endpoint is accessible

### Session Registration Fails

**Problem:** 401 error when registering session

**Solution:**
1. Verify Keycloak token is valid
2. Check backend Keycloak configuration
3. Ensure backend can reach Keycloak introspection endpoint
4. Check backend logs for specific error

### Session ID Not Found

**Problem:** 401 errors after initial login

**Solution:**
1. Check localStorage for `marketplace_session_id`
2. Verify session was registered successfully
3. Check backend session table for session record
4. Verify session hasn't expired (check `token_exp` in database)

## Development Workflow

### Local Development (Without Session Storage)

```bash
# .env.development
VITE_USE_SESSION_STORAGE=false
VITE_API_BASE_URL=http://localhost:8082
```

- Simpler debugging
- Direct token validation
- No database dependency for auth

### Local Development (With Session Storage)

```bash
# .env.development
VITE_USE_SESSION_STORAGE=true
VITE_API_BASE_URL=http://localhost:8082
```

- Tests full production flow
- Requires backend PostgreSQL database
- Better for integration testing

### Testing Session Management

```javascript
// In browser console
window.debugAdvana.debugAuth()  // View auth state

// Check session
localStorage.getItem('marketplace_session_id')

// Manual session status check
fetch('/api/session/<session-id>')
  .then(r => r.json())
  .then(console.log)
```

## Migration Guide

### Upgrading from Direct Token Mode

1. **Update environment variables:**
   ```bash
   echo "VITE_USE_SESSION_STORAGE=true" >> .env
   ```

2. **No code changes required** - Session management is automatic

3. **Test login flow:**
   - Login with Keycloak
   - Check browser console for session registration log
   - Verify session ID in localStorage
   - Test API calls work normally

4. **Verify backend configuration:**
   ```bash
   USE_CLIENT_SESSION_STORAGE=true
   ```

### Rolling Back to Direct Token Mode

1. **Update environment variable:**
   ```bash
   VITE_USE_SESSION_STORAGE=false
   ```

2. **Clear existing sessions:**
   ```javascript
   localStorage.removeItem('marketplace_session_id')
   localStorage.removeItem('marketplace_use_session_storage')
   ```

3. **Reload application** - Will use direct token mode

## Security Considerations

### Session Storage Mode
- ✅ Tokens stored server-side in database
- ✅ Session IDs are UUIDs (cryptographically secure)
- ✅ Sessions can be revoked immediately
- ⚠️ Requires secure database backup policies
- ⚠️ Consider encryption at rest for session tokens

### Direct Token Mode
- ✅ Stateless, no session management needed
- ✅ Tokens validated with Keycloak on every request
- ⚠️ More network calls to Keycloak
- ⚠️ Slightly higher latency

## Best Practices

1. **Use Session Storage Mode in Production**
   - Better performance
   - Enhanced security features
   - Better audit logging

2. **Use Direct Token Mode for Development**
   - Simpler setup
   - Easier debugging
   - No database dependency

3. **Monitor Session Table Size**
   - Backend should cleanup expired sessions periodically
   - Monitor `session_tokens` table growth

4. **Handle Session Errors Gracefully**
   - Frontend automatically falls back to direct token mode on errors
   - No user disruption if session registration fails

5. **Test Both Modes**
   - Ensure application works in both modes
   - Test session expiration handling
   - Test logout cleanup

## Future Enhancements

### Potential Improvements
- [ ] Automatic token refresh using stored refresh tokens
- [ ] Session synchronization across browser tabs
- [ ] Session activity monitoring and timeout warnings
- [ ] Admin dashboard for session management
- [ ] Session analytics and reporting

### Backend Enhancements
- [ ] Periodic cleanup of expired sessions (cron job)
- [ ] Session encryption at rest
- [ ] Multi-device session management
- [ ] Suspicious activity detection
