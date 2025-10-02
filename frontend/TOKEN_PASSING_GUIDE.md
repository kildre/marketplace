# JWT Token Passing Guide - Frontend to Backend

## ✅ Current Setup Status

Your Keycloak token structure is **CORRECT** and matches what your backend expects!

### Token Analysis (from production)

**Your Access Token Contains:**
- ✅ `sub`: User ID (`7a575777-2ffd-4d6b-82f4-22e9c9cf19ba`)
- ✅ `email`: `kilian.l.berres.ctr@usmc.mil`
- ✅ `preferred_username`: `kilian.l.berres.ctr`
- ✅ `name`: `KILIAN BERRES`
- ✅ `resource_access.marketplace.roles`: `["marketplace-approver"]`
- ✅ `realm_access.roles`: `["default-roles-baby-yoda"]`
- ✅ `iss`: `https://keycloak.cdao.us/auth/realms/baby-yoda`
- ✅ `aud`: `account`
- ✅ Token Type: `Bearer`

**Your role:** `marketplace-approver` ✅

---

## 🔧 Updated Code

### 1. `useRequests.ts` - Now Properly Handles Tokens

**What was updated:**
- ✅ Automatic token refresh before each API call (`keycloak.updateToken(30)`)
- ✅ Proper error handling for token refresh failures
- ✅ Token validation (ensures token exists before making requests)
- ✅ Better logging for debugging token issues in production
- ✅ Fixed dependency array to prevent stale closures

**How it works:**
```typescript
// Before EVERY API call:
1. Refresh token if it expires within 30 seconds
2. Get fresh token from keycloak.token (never from localStorage)
3. Validate token exists
4. Add to Authorization header: "Bearer <token>"
5. Make API request
```

### 2. Token Flow

```
┌─────────────────────────────────────────────────────────┐
│ User logs in via Keycloak                               │
│ ↓                                                       │
│ Keycloak stores token in memory (keycloak.token)       │
│ ↓                                                       │
│ Frontend extracts user info and stores in localStorage  │
│ (email, roles, username - NOT the token)               │
│ ↓                                                       │
│ When making API calls:                                  │
│   1. Call keycloak.updateToken(30)                     │
│   2. Get fresh token from keycloak.token               │
│   3. Add to header: "Authorization: Bearer <token>"    │
│   4. Send request to backend                           │
│ ↓                                                       │
│ Backend validates JWT token                             │
│ ↓                                                       │
│ Backend extracts user info and roles from token         │
│ ↓                                                       │
│ Backend processes request                               │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 How Your Frontend Passes Tokens

### In `useRequests.ts`:

```typescript
// Refresh token to ensure it's valid
await keycloak.updateToken(30);

// Get the fresh token from Keycloak
const token = keycloak.token;

// Make API request with token in Authorization header
const response = await fetch(apiUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,  // ← THIS IS THE KEY!
  },
  body: JSON.stringify({ userEmail: userInfo.email }),
});
```

### Backend Receives:

```
Headers:
  Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIs...
  Content-Type: application/json
```

---

## 🔍 Debugging Token Issues

### Check if Token is Being Sent:

**In Browser DevTools (Network tab):**
1. Open Network tab
2. Make a request (e.g., load requests page)
3. Click on the API request (e.g., `/api/requests/viewAll`)
4. Check **Request Headers** section
5. Look for: `Authorization: Bearer eyJhbGci...`

**In Console:**
The updated code now logs:
```
[useRequests] Making API call with valid token
```

If you see errors:
```
[useRequests] Failed to refresh token: <error>
[useRequests] No token available after refresh attempt
```
This means the token refresh failed - user needs to re-authenticate.

### Common Issues:

❌ **Token not in Authorization header**
- Check: `keycloak.token` should have a value
- Solution: Ensure Keycloak is properly initialized

❌ **Token expired**
- Check: Token `exp` claim (expiration time)
- Solution: The code now automatically refreshes tokens

❌ **Backend returns 401 Unauthorized**
- Check: Token issuer matches backend's expected issuer
- Check: Backend is validating against correct Keycloak realm
- Your issuer: `https://keycloak.cdao.us/auth/realms/baby-yoda`

❌ **Backend returns 403 Forbidden**
- Check: User has correct roles in token
- Your roles: `marketplace-approver` ✅
- Backend should check `resource_access.marketplace.roles`

---

## 📝 What NOT to Do

❌ **DON'T store tokens in localStorage for production**
```typescript
// BAD - Token can become stale
localStorage.setItem('token', keycloak.token);
const token = localStorage.getItem('token');
```

✅ **DO get tokens from Keycloak instance**
```typescript
// GOOD - Always fresh
await keycloak.updateToken(30);
const token = keycloak.token;
```

❌ **DON'T send tokens in query parameters**
```typescript
// BAD - Security risk
fetch(`/api/requests?token=${token}`);
```

✅ **DO send tokens in Authorization header**
```typescript
// GOOD - Standard and secure
fetch('/api/requests', {
  headers: { "Authorization": `Bearer ${token}` }
});
```

---

## 🧪 Testing Your Setup

### 1. Check Token in Console:

```javascript
// In browser console (when logged in)
const { keycloak } = window.Keycloak;

// Check if authenticated
console.log('Authenticated:', keycloak.authenticated);

// Check token exists
console.log('Has token:', !!keycloak.token);

// Decode token to see contents
console.log('Token parsed:', keycloak.tokenParsed);

// Check roles
console.log('Has approver role:', 
  keycloak.hasResourceRole('marketplace-approver', 'marketplace')
);
```

### 2. Verify API Request:

Open Network tab in DevTools and check your request:

```
Request URL: https://advana-marketplace.dev.mtt.cdao.us/api/requests/viewAll
Request Method: POST

Request Headers:
  authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6...
  content-type: application/json
  
Request Payload:
  {
    "userEmail": "kilian.l.berres.ctr@usmc.mil"
  }
```

If `authorization` header is present → ✅ Token is being sent correctly!

---

## 🚀 Next Steps

1. **Deploy the updated code** to your dev environment
2. **Test authentication flow:**
   - Log in via Keycloak
   - Open DevTools Network tab
   - Navigate to a page that fetches requests
   - Verify `Authorization` header is present in API calls
3. **Check backend logs** to ensure token is being received and validated
4. **Monitor for token refresh errors** in the console

---

## 📞 Troubleshooting Checklist

If tokens aren't working:

- [ ] Is `keycloak.authenticated` true?
- [ ] Does `keycloak.token` have a value?
- [ ] Is the token in the Authorization header (check Network tab)?
- [ ] Is the token expired? (check `keycloak.tokenParsed.exp`)
- [ ] Does the token have the correct roles?
- [ ] Is the backend configured to accept tokens from your Keycloak realm?
- [ ] Is CORS configured correctly on the backend?
- [ ] Is the backend's SSO enabled? (`DISABLE_SSO: "false"`)

---

## 🎉 Summary

**Your token structure is correct!** The updates ensure:

1. ✅ Tokens are always fresh (automatic refresh)
2. ✅ Tokens are passed in Authorization header (not cookies)
3. ✅ Proper error handling for auth failures
4. ✅ Better debugging with console logs
5. ✅ Token validation before API calls

**Your backend expects tokens in the `Authorization: Bearer <token>` header, and that's exactly what your frontend now does!**
