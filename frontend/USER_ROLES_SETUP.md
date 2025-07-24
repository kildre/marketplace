# User Role Setup Guide

## Overview

This application uses **Keycloak** for authentication and role-based access control (RBAC). Users can have different roles that determine what actions they can perform within the application.

## Available Roles

| Role          | Description          | Permissions                                    |
| ------------- | -------------------- | ---------------------------------------------- |
| **REQUESTOR** | Standard user access | Create and manage own requests, view products  |
| **APPROVER**  | Approval access      | Review, approve/reject requests, view products |

## Environment Configuration

### Production Setup (Keycloak)

1. **Environment Variables** (set `VITE_BYPASS_AUTH=false`):

   ```bash
   VITE_ENVIRONMENT=IL2
   VITE_KEYCLOAK_URL=https://keycloak.cdao.us/auth
   VITE_KEYCLOAK_REALM=baby-yoda
   VITE_KEYCLOAK_CLIENT_ID=marketplace
   VITE_BYPASS_AUTH=false
   ```

2. **Keycloak Admin Setup**:
   - Access: <https://keycloak.cdao.us/auth/admin>
   - Navigate to: `baby-yoda` realm → Roles → Realm Roles
   - Create roles: `REQUESTOR`, `APPROVER`
   - Assign roles to users in: Users → [Select User] → Role Mappings

### Development Setup (Mock Authentication)

1. **Environment Variables** (set `VITE_BYPASS_AUTH=true`):

   ```bash
   VITE_BYPASS_AUTH=true
   VITE_MOCK_USER_ID=dev-user-123
   VITE_MOCK_USERNAME=developer
   VITE_MOCK_USER_EMAIL=developer@advana.mil
   VITE_MOCK_USER_FIRST_NAME=Dev
   VITE_MOCK_USER_LAST_NAME=User
   VITE_MOCK_USER_ROLES=REQUESTOR
   ```

2. **Testing Different Roles**:

   ```bash
   # Test as Requestor
   VITE_MOCK_USER_ROLES=REQUESTOR

   # Test as Approver
   VITE_MOCK_USER_ROLES=APPROVER

   # Test both roles
   VITE_MOCK_USER_ROLES=REQUESTOR,APPROVER
   VITE_MOCK_USER_ROLES=USER,MANAGER
   ```

## Implementation Examples

### 1. Using Role Guards in Components

```tsx
import { RoleGuard, AdminOnly, ManagerOrAdmin } from '../components/auth/RoleGuard';
import { AppRoles } from '../types/auth';

// Admin-only button
<AdminOnly fallback={<p>Admin access required</p>}>
  <button onClick={deleteUser}>Delete User</button>
</AdminOnly>

// Manager or Admin access
<ManagerOrAdmin>
  <button onClick={approveRequest}>Approve Request</button>
</ManagerOrAdmin>

// Specific roles
<RoleGuard roles={[AppRoles.USER, AppRoles.DEVELOPER]}>
  <button onClick={createRequest}>Create Request</button>
</RoleGuard>
```

### 2. Using Permission Guards

```tsx
import { PermissionGuard } from "../components/auth/RoleGuard";
import { Resources, Actions } from "../types/auth";

// Check specific permissions
<PermissionGuard
  resource={Resources.REQUESTS}
  action={Actions.APPROVE}
  fallback={<p>Cannot approve requests</p>}
>
  <button>Approve Request</button>
</PermissionGuard>;
```

### 3. Using Auth Hooks

```tsx
import { useAuth } from "../hooks/useAuth";

const MyComponent = () => {
  const { isAuthenticated, isAdmin, canApproveRequests, getUserInfo } =
    useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      {isAdmin() && <AdminPanel />}
      {canApproveRequests() && <ApprovalButtons />}
    </div>
  );
};
```

## Available Permissions by Role

### ADMIN

- **Requests**: Create, Read, Update, Delete, Approve, Reject
- **Products**: Create, Read, Update, Delete
- **Users**: Create, Read, Update, Delete
- **Approvals**: Create, Read, Update, Delete, Approve, Reject
- **Reports**: Read

### MANAGER

- **Requests**: Read, Update, Approve, Reject
- **Products**: Read
- **Users**: Read
- **Approvals**: Read, Approve, Reject
- **Reports**: Read

### USER

- **Requests**: Create, Read, Update (own requests)
- **Products**: Read

### VIEWER

- **Requests**: Read
- **Products**: Read

### DEVELOPER

- **Requests**: Create, Read, Update, Delete
- **Products**: Create, Read, Update, Delete
- **Users**: Read

## Deployment Configuration

### Kubernetes/Helm Values

Update `chart-env/dev/values.yaml`:

```yaml
secret:
  env:
    secret:
      "public-env-platform-ui":
        data:
          VITE_KEYCLOAK_URL: "https://keycloak.cdao.us/auth"
          VITE_KEYCLOAK_REALM: "baby-yoda"
          VITE_KEYCLOAK_CLIENT_ID: "marketplace"
          VITE_BYPASS_AUTH: "false" # Set to false for production
```

### Environment-Specific Settings

For different environments (IL2/IL5), update the `.env` file:

```bash
# IL2 Environment
VITE_ENVIRONMENT=IL2
VITE_KEYCLOAK_URL=https://keycloak.cdao.us/auth
VITE_KEYCLOAK_REALM=baby-yoda

# IL5 Environment
VITE_ENVIRONMENT=IL5
VITE_KEYCLOAK_URL=https://sso.data.mil/auth
VITE_KEYCLOAK_REALM=local-uot-prod
```

## Troubleshooting

### Common Issues

1. **User has no roles**:

   - Check Keycloak user role assignments
   - Verify role names match exactly (case-sensitive)

2. **Permission denied**:

   - Check if user has the required role
   - Verify permission configuration in `types/auth.ts`

3. **Mock authentication not working**:
   - Ensure `VITE_BYPASS_AUTH=true`
   - Check mock user roles in environment variables

### Debug Commands

```bash
# Check current user info
console.log(getUserInfo());

# Check user roles
console.log(getUserRoles());

# Check specific permission
console.log(hasPermission(Resources.REQUESTS, Actions.CREATE));
```

## Security Best Practices

1. **Never rely on frontend-only authorization**

   - Always validate permissions on the backend
   - Frontend guards are for UX only

2. **Use principle of least privilege**

   - Grant minimum necessary permissions
   - Regular role audits

3. **Test role configurations**

   - Test all role combinations
   - Verify permission boundaries

4. **Keep roles simple**
   - Avoid too many granular roles
   - Group related permissions

## Next Steps

1. Set up Keycloak roles in your realm
2. Assign roles to users
3. Test the application with different role configurations
4. Implement role-based navigation and UI elements
5. Add backend authorization validation
