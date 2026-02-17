# Mock Login Flow Implementation Proposal

## Overview
Replace the current mock user switcher with a proper mock login/logout flow to eliminate race conditions and synchronization issues.

## Current Problems
1. **Race Conditions**: User switching mid-session causes `window.keycloak` to update after components have already mounted and made API calls
2. **Synchronization Issues**: Sidebar counts and table data get out of sync when switching users
3. **Complex State Management**: Multiple effects polling for user changes, delayed token updates, and coordination between hooks
4. **Timing Issues**: Components fetch data before `window.keycloak` is ready, leading to 403 errors with dummy bypass tokens

## Proposed Solution

### Mock Login Page
Create a dedicated login page (`/login`) that:
- Shows a list of available mock users (requestor_vinoth, requestor_elizabeth, requestor_daniel, approver_joanna, approver_jennifer, approver_jennifer)
- Displays each user's role clearly
- "Login" button for each user that:
  - Sets up `window.keycloak` with proper token
  - Stores user info in localStorage
  - Redirects to appropriate home page (Product Catalog for requestors, Requests for approvers)

### Mock Logout
- Add "Logout" button in header/navigation
- Clears `window.keycloak`, localStorage auth data, and cart
- Redirects back to `/login` page
- Simple, clean break between user sessions

## Implementation Plan

### 1. Create New Components
**File**: `frontend/src/pages/mock-login/mock-login.tsx`
- Grid/list of mock users with cards
- Each card shows: name, email, role
- Click to login as that user

**File**: `frontend/src/pages/mock-login/mock-login.scss`
- Styling for login page

### 2. Modify Existing Files

**File**: `frontend/src/contexts/EnhancedMockKeycloakProvider.tsx`
- **Remove**: `switchMockUser` function
- **Remove**: User polling mechanism (setInterval checking for user changes)
- **Remove**: User switcher state management
- **Simplify**: Only initialize once on mount from localStorage
- **Keep**: Mock keycloak object creation in useMemo

**File**: `frontend/src/App.tsx`
- **Add**: Route for `/login` page
- **Add**: ProtectedRoute wrapper that redirects to `/login` if no auth
- **Remove**: Mock user switcher dropdown from UI

**File**: `frontend/src/hooks/useRequests.ts`
- **Remove**: User change polling (the setInterval that checks every second)
- **Remove**: `userTracker` state
- **Simplify**: fetchRequests just fetches once, no waiting logic needed

**File**: `frontend/src/components/requests-table/requests-table.tsx`
- Already fixed to use data from props
- No changes needed

**File**: `frontend/src/pages/requests/requests.tsx`
- Already using useRequests hook properly
- No changes needed

### 3. Router Configuration
```typescript
// In App.tsx or router config
<Routes>
  <Route path="/login" element={<MockLogin />} />
  
  <Route element={<ProtectedRoute />}>
    <Route path="/" element={getHomeComponent()} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/requests" element={<Requests />} />
    {/* ... other protected routes */}
  </Route>
</Routes>
```

### 4. Protected Route Component
**File**: `frontend/src/components/auth/ProtectedRoute.tsx`
- Check if user is authenticated (window.keycloak exists and has token)
- If not authenticated, redirect to `/login`
- If authenticated, render children (Outlet)

### 5. Header/Navigation Updates
- Add "Logout" button (only visible when authenticated)
- Remove mock user switcher dropdown
- Show current user's name/email in header

## Benefits

### Technical Benefits
1. **No Race Conditions**: Auth is set up once before any components mount
2. **Simpler State Management**: No user switching state, no polling, no synchronization
3. **Predictable Timing**: `window.keycloak` is guaranteed to be ready when components mount
4. **Cleaner Code**: Remove ~100+ lines of complex switching logic

### UX Benefits
1. **Realistic Flow**: Matches production Keycloak behavior
2. **Clear Separation**: Each user session is isolated and clean
3. **Easy Testing**: Just login as different users to test different scenarios
4. **No Confusion**: Clear who you're logged in as, no mid-session switching surprises

### Development Benefits
1. **Easier Debugging**: No complex timing issues to track down
2. **Better Tests**: Can test login/logout flows properly
3. **Maintainability**: Simpler code is easier to maintain
4. **Production-Ready**: Easy to swap mock login for real Keycloak later

## Files to Remove/Clean Up
- Mock user switcher component (currently in App.tsx or sidebar)
- User polling logic in useRequests hook
- switchMockUser function in EnhancedMockKeycloakProvider
- userTracker state and associated effects

## Migration Path
1. Create login page
2. Create ProtectedRoute component
3. Update App.tsx with new routes
4. Add logout functionality
5. Remove switcher UI
6. Clean up EnhancedMockKeycloakProvider
7. Simplify useRequests hook
8. Test all user flows

## Rollback Plan
- Keep switcher code in git history
- Feature flag to enable/disable new login flow if needed
- Gradual migration: can keep both flows initially

## Estimated Effort
- Implementation: 2-3 hours
- Testing: 1 hour
- Total: 3-4 hours

## Questions/Considerations
1. Should we persist login across page refreshes? (Currently yes via localStorage)
2. Do we want a session timeout for mock users?
3. Should logout also clear cart data?
4. Do we want to track "last logged in as" for convenience?

## Next Steps
1. **Review this proposal** - confirm approach makes sense
2. **Implement** - start with login page
3. **Test** - verify no 403 errors, data syncs properly
4. **Clean up** - remove old switcher code
5. **Document** - update LOCAL_SETUP.md with new login flow
