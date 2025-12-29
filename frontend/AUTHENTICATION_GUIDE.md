# Enhanced Keycloak Authentication System

This document explains how to use the enhanced Keycloak authentication system that supports token capture, storage, role mapping, session management, and local development simulation.

## 🆕 New Features

**Session-Based Authentication** - The frontend now supports backend session storage for improved performance and security. See [BACKEND_SESSION_INTEGRATION.md](./BACKEND_SESSION_INTEGRATION.md) and [QUICK_START_SESSION.md](./QUICK_START_SESSION.md) for details.

## Overview

The authentication system supports:
- ✅ **Token Capture & Storage**: Automatically captures and stores JWT tokens and refresh tokens
- ✅ **Session Management**: Optional session-based authentication with backend (NEW)
- ✅ **Role Mapping**: Maps Keycloak roles (`marketplace-approver`, `marketplace-requestor`) to app roles
- ✅ **Local Development**: Enhanced mock system that simulates real Keycloak behavior
- ✅ **Role-Based UI**: Conditional rendering based on user roles
- ✅ **Automatic Token Refresh**: Handles token expiration and refresh automatically

## Environment Configuration

### Production Environment (.env)
```bash
# Set to false for production
VITE_BYPASS_AUTH=false

# Keycloak Configuration
VITE_KEYCLOAK_URL=https://keycloak.cdao.us/auth
VITE_KEYCLOAK_REALM=baby-yoda
VITE_KEYCLOAK_CLIENT_ID=marketplace
VITE_KEYCLOAK_CHECK_LOGIN_IFRAME=false
```

### Development Environment (.env)
```bash
# Set to true for development
VITE_BYPASS_AUTH=true

# Mock user configuration
VITE_MOCK_USER_ID=dev-user-123
VITE_MOCK_USERNAME=developer
VITE_MOCK_USER_EMAIL=developer@advana.mil
VITE_MOCK_USER_FIRST_NAME=Dev
VITE_MOCK_USER_LAST_NAME=User
# Use actual Keycloak role names
VITE_MOCK_USER_ROLES=marketplace-approver
```

## Role Mapping

The system automatically maps Keycloak roles to application roles:

| Keycloak Role | App Role | Description |
|---------------|----------|-------------|
| `marketplace-approver` | `APPROVER` | Can approve/reject requests, view all requests |
| `marketplace-requestor` | `REQUESTOR` | Can browse products, create requests |

Legacy roles (`APPROVER`, `REQUESTOR`) are also supported for backward compatibility.

## Usage Examples

### 1. Basic Role Checking

```tsx
import { useAuth } from '../hooks/useAuth';
import { AppRoles } from '../types/auth';

const MyComponent = () => {
  const { hasRole, isApprover, isRequestor } = useAuth();

  return (
    <div>
      {/* Check for specific role */}
      {hasRole(AppRoles.APPROVER) && (
        <button>Approve Request</button>
      )}

      {/* Use convenience methods */}
      {isApprover() && (
        <div>Approver Dashboard</div>
      )}

      {isRequestor() && (
        <div>Product Catalog</div>
      )}
    </div>
  );
};
```

### 2. Role-Based Routing

```tsx
import { useAuth } from '../hooks/useAuth';
import { AppRoles } from '../types/auth';

const App = () => {
  const { hasRole } = useAuth();

  // Role-based home component selection
  const getHomeComponent = () => {
    if (hasRole(AppRoles.APPROVER)) {
      return <RequestsPage />;
    } else if (hasRole(AppRoles.REQUESTOR)) {
      return <ProductCatalog />;
    } else {
      return <UnauthorizedPage />;
    }
  };

  return (
    <Routes>
      <Route path="/" element={getHomeComponent()} />
      {/* Other routes */}
    </Routes>
  );
};
```

### 3. Getting User Information

```tsx
import { useAuth } from '../hooks/useAuth';

const UserProfile = () => {
  const { getUserInfo, getUserRoles, getKeycloakRoles } = useAuth();
  
  const userInfo = getUserInfo();
  const appRoles = getUserRoles();
  const keycloakRoles = getKeycloakRoles();

  return (
    <div>
      <h2>Welcome, {userInfo?.firstName} {userInfo?.lastName}</h2>
      <p>Email: {userInfo?.email}</p>
      <p>App Roles: {appRoles.join(', ')}</p>
      <p>Keycloak Roles: {keycloakRoles.join(', ')}</p>
    </div>
  );
};
```

### 4. Protected Routes

```tsx
import { useAuth } from '../hooks/useAuth';
import { AppRoles } from '../types/auth';

const ProtectedRoute = ({ children, requiredRole }: { 
  children: React.ReactNode, 
  requiredRole: AppRoles 
}) => {
  const { hasRole, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  if (!hasRole(requiredRole)) {
    return <div>Access denied</div>;
  }

  return <>{children}</>;
};

// Usage
<ProtectedRoute requiredRole={AppRoles.APPROVER}>
  <ApproverDashboard />
</ProtectedRoute>
```

## Development Features

### Mock User Switching

In development mode (`VITE_BYPASS_AUTH=true`), you can switch between different mock users:

- **approver**: User with `marketplace-approver` role
- **requestor**: User with `marketplace-requestor` role  
- **both**: User with both roles
- **custom**: User defined by environment variables

The `MockUserSwitcher` component appears in the top-right corner during development for easy role testing.

### Available Mock Configurations

```javascript
const mockUserConfigurations = {
  approver: {
    roles: ["marketplace-approver"]
  },
  requestor: {
    roles: ["marketplace-requestor"]
  },
  both: {
    roles: ["marketplace-approver", "marketplace-requestor"]
  },
  custom: {
    roles: [process.env.VITE_MOCK_USER_ROLES] // From .env file
  }
};
```

## Token Management

The system automatically:

1. **Captures tokens** when user authenticates
2. **Stores tokens** securely in localStorage
3. **Refreshes tokens** before expiration
4. **Clears tokens** on logout or error

### Manual Token Operations

```tsx
import { AuthService } from '../services/authService';

// Check stored token
const token = AuthService.getStoredToken();

// Get stored user info
const userInfo = AuthService.getStoredUserInfo();

// Clear authentication data
AuthService.clearStoredAuth();
```

## Testing Role-Based UI

1. **Set up development environment**:
   ```bash
   VITE_BYPASS_AUTH=true
   VITE_MOCK_USER_ROLES=marketplace-approver
   ```

2. **Use the MockUserSwitcher**: Look for the dropdown in the top-right corner to switch between roles

3. **Test different scenarios**:
   - Switch to "approver" → Should see approval workflows
   - Switch to "requestor" → Should see product catalog and cart
   - Switch to "both" → Should see all features
   - Switch to "custom" → Uses your .env configuration

## Production Deployment

1. **Set production environment**:
   ```bash
   VITE_BYPASS_AUTH=false
   VITE_KEYCLOAK_URL=https://keycloak.cdao.us/auth
   VITE_KEYCLOAK_REALM=baby-yoda
   VITE_KEYCLOAK_CLIENT_ID=marketplace
   ```

2. **Configure Keycloak client**:
   - Enable PKCE (OIDC flow)
   - Set valid redirect URIs
   - Configure client roles: `marketplace-approver`, `marketplace-requestor`

3. **Assign roles to users** in Keycloak admin console

## Security Notes

- Tokens are stored in localStorage (consider more secure options for production)
- PKCE is enabled for OAuth2 security
- Token refresh happens automatically 30 seconds before expiration
- All authentication errors clear stored data

## Troubleshooting

### Common Issues

1. **"User has no roles"**: Check that Keycloak roles are assigned and match expected names
2. **Authentication loops**: Verify Keycloak configuration and redirect URIs
3. **Token errors**: Check browser console for authentication errors

### Debug Information

In development mode, components show debug information including:
- Current role checks
- Environment variables
- Token parsing results

## API Reference

### useAuth Hook

```tsx
const {
  // Authentication status
  isAuthenticated,
  
  // User information
  getUserInfo,
  getUserRoles,
  getKeycloakRoles,
  getAppRoles,
  
  // Role checks
  hasRole,
  hasAnyRole,
  hasAllRoles,
  isRequestor,
  isApprover,
  
  // Permission checks
  hasPermission,
  canApproveRequests,
  canCreateRequests,
  
  // Keycloak instance
  keycloak
} = useAuth();
```

### AuthService Methods

```tsx
// Token management
AuthService.storeTokens(token, refreshToken?)
AuthService.getStoredToken()
AuthService.getStoredRefreshToken()
AuthService.clearStoredAuth()

// User info
AuthService.storeUserInfo(userInfo)
AuthService.getStoredUserInfo()

// Role mapping
AuthService.mapKeycloakRolesToAppRoles(keycloakRoles)
AuthService.extractRolesFromToken(tokenParsed)
AuthService.createUserInfoFromToken(tokenParsed)

// Token utilities
AuthService.parseJwtToken(token)
AuthService.isTokenExpired(tokenParsed)
```
