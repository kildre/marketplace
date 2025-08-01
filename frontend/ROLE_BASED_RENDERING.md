# Role-Based Conditional Rendering

This guide explains how to implement conditional rendering based on user roles in your marketplace application.

## Token Structure

Your Keycloak tokens have the following structure:

```json
{
  "resource_access": {
    "marketplace": {
      "roles": [
        "marketplace-requestor",
        "marketplace-approver"
      ]
    },
    "account": {
      "roles": [
        "manage-account",
        "manage-account-links",
        "view-profile"
      ]
    }
  }
}
```

## Available Roles

- `marketplace-requestor`: Users who can submit requests
- `marketplace-approver`: Users who can approve requests (typically also have requestor role)

## Usage

### 1. Using React Components

#### ApproverOnly Component
```tsx
import { ApproverOnly } from '../components/RoleGuard';

<ApproverOnly>
  <button>Approve Request</button>
</ApproverOnly>
```

#### RequestorOnly Component
```tsx
import { RequestorOnly } from '../components/RoleGuard';

<RequestorOnly>
  <button>Submit Request</button>
</RequestorOnly>
```

#### RoleGuard Component (Advanced)
```tsx
import { RoleGuard } from '../components/RoleGuard';
import { MARKETPLACE_ROLES } from '../utils/roleUtils';

// Show content only to approvers
<RoleGuard roles={[MARKETPLACE_ROLES.APPROVER]}>
  <AdminPanel />
</RoleGuard>

// Show content to either approvers OR requestors
<RoleGuard 
  roles={[MARKETPLACE_ROLES.APPROVER, MARKETPLACE_ROLES.REQUESTOR]}
  requireAll={false}
>
  <GeneralContent />
</RoleGuard>

// Show content only to users who have BOTH roles
<RoleGuard 
  roles={[MARKETPLACE_ROLES.APPROVER, MARKETPLACE_ROLES.REQUESTOR]}
  requireAll={true}
>
  <SuperUserContent />
</RoleGuard>
```

### 2. Using Hooks

#### useUserRoles Hook
```tsx
import { useUserRoles } from '../components/RoleGuard';

const MyComponent = () => {
  const { isApprover, isRequestor, roles } = useUserRoles();

  return (
    <div>
      {isApprover && <button>Approve</button>}
      {isRequestor && <button>Submit Request</button>}
      <p>Your roles: {roles.join(', ')}</p>
    </div>
  );
};
```

### 3. Navigation Example

```tsx
<nav>
  <Link to="/dashboard">Dashboard</Link>
  
  <RequestorOnly>
    <Link to="/submit-request">Submit Request</Link>
  </RequestorOnly>
  
  <ApproverOnly>
    <Link to="/approve-requests">Approve Requests</Link>
    <Link to="/admin">Admin Panel</Link>
  </ApproverOnly>
</nav>
```

## Development Environment Setup

### Environment Variables

Create a `.env.local` file in your frontend directory:

```bash
# For requestor user
VITE_MOCK_USER_TYPE=requestor
VITE_MOCK_USERNAME=kberres
VITE_MOCK_USER_EMAIL=kberres@advana.mil

# For admin user (has both roles)
# VITE_MOCK_USER_TYPE=admin
# VITE_MOCK_USERNAME=admin
# VITE_MOCK_USER_EMAIL=admin@advana.mil
```

### Switching Between User Types

1. **As Requestor**: Set `VITE_MOCK_USER_TYPE=requestor`
2. **As Admin/Approver**: Set `VITE_MOCK_USER_TYPE=admin`
3. **Custom Roles**: Set `VITE_MOCK_USER_ROLES=marketplace-requestor,marketplace-approver`

## Integration with Real Keycloak

When you switch from mock to real Keycloak:

1. Replace `useMockKeycloak()` with `useKeycloak()` from `@react-keycloak/web`
2. The role checking utilities will work the same way
3. Update the import in `RoleGuard.tsx`:
   ```tsx
   // Change this:
   import { useMockKeycloak } from '../contexts/MockKeycloakProvider';
   
   // To this:
   import { useKeycloak } from '@react-keycloak/web';
   ```

## Available Utilities

### roleUtils.ts
- `hasMarketplaceRole(tokenParsed, role)`: Check if user has specific role
- `isApprover(tokenParsed)`: Check if user is approver
- `isRequestor(tokenParsed)`: Check if user is requestor
- `hasAnyRole(tokenParsed, roles[])`: Check if user has any of the specified roles
- `hasAllRoles(tokenParsed, roles[])`: Check if user has all of the specified roles

### Components
- `<ApproverOnly>`: Only show content to approvers
- `<RequestorOnly>`: Only show content to requestors
- `<RoleGuard>`: Advanced role-based rendering with multiple options
- `useUserRoles()`: Hook for role information

## Example Use Cases

1. **Admin Dashboard**: Only show to approvers
2. **Submit Button**: Only show to requestors
3. **Navigation Menu**: Different items based on roles
4. **Action Buttons**: Approve/Reject vs Submit/Edit
5. **Data Tables**: Different columns/actions based on permissions
