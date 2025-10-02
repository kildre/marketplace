# 🔴 DEBUG: 403 Forbidden - Missing Token Issue

## 🐛 Problem Identified

**Your Authorization header shows `Bearer` with NO token after it!**

Looking at your Network tab screenshot:
```
Authorization: Bearer
```

Should be:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6...
```

This means `keycloak.token` is **undefined** or **empty**.

---

## 🔍 Root Cause

Your Keycloak is storing tokens in **cookies** (visible in your DevTools):
- `KEYCLOAK_SESSION`
- `KEYCLOAK_IDENTITY`  
- `KEYCLOAK_SESSION_LEGACY`
- `KEYCLOAK_IDENTITY_LEGACY`

BUT your code expects tokens in **memory** (`keycloak.token`).

**Why?** The Keycloak initialization was missing the `flow: "standard"` option, causing it to use **implicit flow** which stores tokens in cookies but doesn't populate `keycloak.token` properly.

---

## ✅ Fixes Applied

### 1. Updated Keycloak Initialization (`main.tsx`)

**Added `flow: "standard"` to ensure tokens are available in memory:**

```typescript
const keycloakInitOptions = {
  onLoad: "login-required" as const,
  checkLoginIframe: false,
  pkceMethod: "S256" as const,
  flow: "standard" as const, // ← CRITICAL: Use authorization code flow
  // This ensures tokens are stored in memory (keycloak.token) not just in cookies
};
```

**What this does:**
- Forces Keycloak to use **authorization code flow** with PKCE
- Stores tokens in **memory** (`keycloak.token`)
- Tokens are accessible to your JavaScript code
- Still uses cookies for session management

### 2. Added Comprehensive Logging

**In `main.tsx` - Keycloak initialization:**
```typescript
const handleTokens = (tokens) => {
  console.log("[main] onTokens callback fired:", {
    hasToken: !!tokens.token,
    tokenLength: tokens.token?.length,
  });
};
```

**In `useRequests.ts` - API calls:**
```typescript
console.log("[useRequests] DEBUG - keycloak state:", {
  authenticated: keycloak.authenticated,
  hasToken: !!keycloak.token,
  tokenLength: keycloak.token?.length,
});
```

---

## 🧪 Testing Steps

### 1. Clear Browser State (IMPORTANT!)

You **MUST** clear all cookies and local storage because the old session is using implicit flow:

**Option A: Hard Refresh**
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Close and reopen the tab

**Option B: Clear Storage**
1. Open DevTools → Application tab
2. Go to "Storage" in left sidebar
3. Click "Clear site data"
4. Refresh the page

**Option C: Incognito Mode**
1. Open your app in an incognito/private window
2. This ensures a clean session

### 2. Log In Again

After clearing storage:
1. Navigate to your app: `https://advana-marketplace.dev.mtt.cdao.us`
2. You'll be redirected to Keycloak login
3. Log in with your credentials

### 3. Check Console Logs

Open DevTools → Console and look for:

```
[main] Keycloak instance created, initializing...
[main] onTokens callback fired: {hasToken: true, tokenLength: 872}
[main] User info stored: {email: "...", roles: ["APPROVER"]}
```

If you see `hasToken: true` → ✅ Keycloak is providing tokens!

Then when you navigate to a page that fetches requests:

```
[useRequests] DEBUG - keycloak state: {authenticated: true, hasToken: true, tokenLength: 872}
[useRequests] Token refresh result: false
[useRequests] Token after refresh: {hasToken: true, tokenLength: 872, first50Chars: "eyJhbGci..."}
[useRequests] Making API call with token to: https://...
```

### 4. Check Network Tab

1. Open DevTools → Network tab
2. Navigate to a page that fetches data
3. Click on the API request (e.g., `/api/requests/viewAll`)
4. Check **Request Headers**
5. Verify `Authorization` header:

**❌ BEFORE (broken):**
```
Authorization: Bearer
```

**✅ AFTER (fixed):**
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOQ...
```

---

## 🚨 If Still Getting 403 After Clearing Cache

### Check Console for These Errors:

#### Error: `[useRequests] CRITICAL: No token available!`

**Cause:** Keycloak is authenticated but `token` property is still empty

**Solution:**
```javascript
// In browser console, check:
console.log(window.Keycloak); // Should show Keycloak instance
console.log(window.Keycloak.authenticated); // Should be true
console.log(window.Keycloak.token); // Should have a long string

// If token is undefined, check:
console.log(window.Keycloak.tokenParsed); // Should have user info
```

If `token` is undefined but `authenticated` is true, the issue is with Keycloak configuration on the **server side**.

#### Error: `[useRequests] Failed to refresh token`

**Cause:** Token refresh is failing

**Solution:** Check Keycloak server configuration:
1. Verify your Keycloak client settings
2. Ensure "Standard Flow" is enabled
3. Ensure "Direct Access Grants" is enabled
4. Check token lifespan settings

---

## 🔧 Alternative: Use Cookies Instead of Bearer Tokens

If the above doesn't work, your backend might be configured to read tokens from **cookies** instead of the Authorization header.

### Check if Backend Expects Cookies:

Look for these patterns in backend code:
```javascript
// Cookie-based
req.cookies.KEYCLOAK_SESSION

// vs. Header-based
req.headers.authorization
```

If backend expects cookies, update `useRequests.ts`:

```typescript
response = await window.fetch(getApiUrl("/api/requests/viewAll"), {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    // Remove Authorization header
  },
  credentials: "include", // ← Add this to send cookies
  body: JSON.stringify({
    userEmail: userInfo.email,
  }),
});
```

---

## 📊 Debugging Checklist

- [ ] Cleared browser cache/cookies
- [ ] Logged in with fresh session
- [ ] Checked console for `[main] onTokens callback fired: {hasToken: true}`
- [ ] Checked console for `[useRequests] DEBUG - keycloak state: {hasToken: true}`
- [ ] Checked Network tab for `Authorization: Bearer <long-token>`
- [ ] Verified Keycloak client has "Standard Flow" enabled
- [ ] Confirmed backend expects Authorization header (not cookies)

---

## 🎯 Expected Outcome

After applying these fixes and clearing your browser cache:

1. ✅ Keycloak provides tokens in memory
2. ✅ `keycloak.token` is populated
3. ✅ Authorization header includes full token
4. ✅ Backend receives and validates token
5. ✅ API returns 200 OK (not 403)
6. ✅ No infinite loop

---

## 📞 Still Having Issues?

Run this in your browser console after logging in:

```javascript
// Comprehensive debug info
const keycloak = window.Keycloak;
console.log("=== KEYCLOAK DEBUG INFO ===");
console.log("Authenticated:", keycloak?.authenticated);
console.log("Has token:", !!keycloak?.token);
console.log("Token length:", keycloak?.token?.length);
console.log("Token (first 50 chars):", keycloak?.token?.substring(0, 50));
console.log("Has tokenParsed:", !!keycloak?.tokenParsed);
console.log("User email:", keycloak?.tokenParsed?.email);
console.log("User roles:", keycloak?.tokenParsed?.resource_access?.marketplace?.roles);
console.log("Token expires at:", new Date(keycloak?.tokenParsed?.exp * 1000));
console.log("========================");
```

Share the output for further debugging.

---

## 🔑 Key Takeaway

**The `flow: "standard"` configuration is critical!** Without it, Keycloak uses implicit flow which stores tokens in cookies but doesn't populate `keycloak.token` in JavaScript, causing your Authorization header to be empty.
