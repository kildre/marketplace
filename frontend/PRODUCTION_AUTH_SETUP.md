# Keycloak Production Authentication Setup for kberres

## Overview
The authentication system is properly configured to handle both development (mock) and production (real Keycloak) authentication. When kberres logs in through production Keycloak, their `marketplace-requestor` role will be automatically extracted and mapped correctly.

## How it Works for kberres in Production

### 1. Keycloak Token Structure Expected
When kberres authenticates through production Keycloak, their JWT token should contain:

```json
{
  "preferred_username": "kberres",
  "email": "kberres@advana.mil",
  "given_name": "Kevin", 
  "family_name": "Berres",
  "resource_access": {
    "marketplace": {
      "roles": ["marketplace-requestor"]
    },
    "account": {
      "roles": ["manage-account", "manage-account-links", "view-profile"]
    }
  }
}
```

### 2. Role Extraction and Mapping Process

1. **Token Processing** (`keycloakService.ts`):
   - Captures the JWT token on successful authentication
   - Logs detailed token information including marketplace roles
   - Stores token and user info in localStorage

2. **Role Extraction** (`authService.ts`):
   - `extractRolesFromToken()` extracts all roles from both `realm_access` and `resource_access`
   - Specifically looks for `resource_access.marketplace.roles`
   - Returns all roles as a flat array

3. **Role Mapping** (`authService.ts`):
   - `mapKeycloakRolesToAppRoles()` maps Keycloak roles to application roles:
     - `"marketplace-requestor"` → `AppRoles.REQUESTOR`
     - `"marketplace-approver"` → `AppRoles.APPROVER`

4. **User Info Creation** (`authService.ts`):
   - Creates a `UserInfo` object with mapped app roles
   - Stores both original Keycloak roles and mapped app roles

### 3. Authentication Flow for kberres

1. **Environment Check**: App checks `VITE_BYPASS_AUTH` environment variable
   - If `"true"`: Uses mock authentication (development)
   - If `"false"` or unset: Uses real Keycloak (production)

2. **Keycloak Initialization**: 
   - Loads Keycloak configuration from environment variables
   - Initializes with `onLoad: "login-required"`
   - Forces user to authenticate

3. **Token Capture**:
   - On successful authentication, token is captured and processed
   - Roles are extracted from `resource_access.marketplace.roles`
   - User info is stored in localStorage

4. **Role-Based Access**:
   - `useAuth()` hook provides role checking functions
   - `hasRole(AppRoles.REQUESTOR)` returns true for kberres
   - UI components conditionally render based on roles

### 4. Debugging and Verification

When kberres logs in, the following logs will appear in the browser console:

```javascript
// From keycloakService.ts
🔐 Keycloak JWT Token Captured: {
  user: "kberres",
  email: "kberres@advana.mil",
  marketplaceRoles: ["marketplace-requestor"],
  resourceAccess: { marketplace: { roles: ["marketplace-requestor"] } }
}

// From authService.ts  
🎯 Marketplace roles found: ["marketplace-requestor"]

// From authService.ts
👤 User authenticated: {
  username: "kberres",
  email: "kberres@advana.mil", 
  keycloakRoles: ["marketplace-requestor"],
  mappedAppRoles: ["REQUESTOR"],
  marketplaceRoles: ["marketplace-requestor"]
}
```

### 5. UI Behavior for kberres

As a requestor, kberres will have access to:
- **Product Catalog**: Can browse and view products
- **Cart Functionality**: Can add items to cart and submit requests
- **Request Tracking**: Can view their own submitted requests
- **Home Page**: Defaults to Product Catalog

kberres will **NOT** have access to:
- **Request Approval**: Cannot approve other users' requests
- **Admin Functions**: No access to approver-only features

### 6. Environment Variables for Production

Ensure these environment variables are set for production Keycloak:

```bash
# Production Keycloak Configuration
VITE_KEYCLOAK_URL=https://your-keycloak-server.com/auth
VITE_KEYCLOAK_REALM=your-realm-name
VITE_KEYCLOAK_CLIENT_ID=marketplace

# Authentication Mode (false or unset for production)
VITE_BYPASS_AUTH=false

# Optional Keycloak Settings
VITE_KEYCLOAK_CHECK_LOGIN_IFRAME=false
```

### 7. Troubleshooting

If kberres cannot access requestor features:

1. **Check Browser Console**: Look for authentication logs
2. **Verify Token Structure**: Ensure `resource_access.marketplace.roles` contains `"marketplace-requestor"`
3. **Check Role Mapping**: Verify role is being mapped to `AppRoles.REQUESTOR`
4. **Inspect localStorage**: Check if user info is stored correctly

#### Common Issues:
- **Role not in marketplace resource**: Role might be in `realm_access` instead
- **Incorrect role name**: Should be exactly `"marketplace-requestor"`
- **Client configuration**: Ensure marketplace client is configured in Keycloak

### 8. Keycloak Client Configuration

Ensure the marketplace client in Keycloak is configured with:
- **Access Type**: public or confidential
- **Valid Redirect URIs**: Include your application URLs
- **Web Origins**: Include your application domain
- **Client Roles**: Define `marketplace-requestor` and `marketplace-approver`
- **User Role Mapping**: Assign `marketplace-requestor` role to kberres

## Summary

The authentication system is properly configured to handle kberres's production login. The role extraction, mapping, and UI rendering are all set up correctly. When kberres logs in through Keycloak with the `marketplace-requestor` role in their token's `resource_access.marketplace.roles`, they will automatically get the appropriate requestor permissions and UI access.
