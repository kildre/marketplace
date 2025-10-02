# Authorization Header Test Coverage Summary

This document summarizes the test coverage added for the Authorization header functionality implemented across multiple components.

## Overview

Authorization header support was added to fix 403 Forbidden errors by including JWT tokens in API requests. Test coverage was added to verify this functionality works correctly.

## Files Modified

### Source Files with Authorization Header Support
1. **`src/components/requests-table/requests-table.tsx`**
   - Added `AuthService.getStoredToken()` calls
   - Includes Authorization header in `/api/requests/viewAll` (approvers)
   - Includes Authorization header in `/api/requests/viewForRequestor` (requestors)

2. **`src/hooks/useRequests.ts`**
   - Added `AuthService.getStoredToken()` calls
   - Includes Authorization header for both approver and requestor API calls

3. **`src/pages/request-detail/request-detail.tsx`**
   - Added `AuthService.getStoredToken()` calls
   - Includes Authorization header for viewing individual request details

## Test Files Updated/Created

### 1. `src/components/requests-table/requests-table.test.tsx`

**Added Tests:**
- ✅ Should include Authorization header when token exists for approvers
- ✅ Should include Authorization header when token exists for requestors
- ✅ Should not include Authorization header when no token exists
- ✅ Should handle 403 Forbidden errors gracefully

**Mock Added:**
```typescript
const mockGetStoredToken = vi.fn();
vi.mock("@/services/authService", () => ({
  AuthService: {
    getStoredToken: () => mockGetStoredToken(),
  },
}));
```

### 2. `src/hooks/useRequests.test.ts` (NEW FILE)

**Test Suites:**

#### Authorization Header Tests (5 tests)
- ✅ Should include Authorization header when token exists for approvers
- ✅ Should include Authorization header when token exists for requestors
- ✅ Should not include Authorization header when no token exists
- ✅ Should handle 403 Forbidden errors gracefully
- ✅ Should return empty array when user is not authenticated

#### Request Fetching Logic (2 tests)
- ✅ Should fetch all requests for approvers
- ✅ Should fetch only own requests for requestors

#### Error Handling (2 tests)
- ✅ Should handle network errors gracefully
- ✅ Should handle malformed API responses

**Total: 9 tests - All Passing ✓**

### 3. `src/pages/request-detail/request-detail.test.tsx`

**Added Tests:**
- ✅ Should include Authorization header when token exists for approvers
- ✅ Should include Authorization header when token exists for requestors
- ✅ Should not include Authorization header when no token exists
- ✅ Should display error message when API returns 403 Forbidden

**Mock Added:**
```typescript
const mockGetStoredToken = vi.fn();
vi.mock("@/services/authService", () => ({
  AuthService: {
    getStoredToken: () => mockGetStoredToken(),
  },
}));
```

## Test Coverage Summary

### Total Tests Added: **17 new tests**

| File | New Tests | Status |
|------|-----------|--------|
| requests-table.test.tsx | 4 tests | ✅ Passing |
| useRequests.test.ts | 9 tests | ✅ Passing |
| request-detail.test.tsx | 4 tests | ✅ Passing |

## Test Scenarios Covered

### 1. Authentication Token Present
- ✅ Token is retrieved from AuthService
- ✅ Token is included in Authorization header as `Bearer ${token}`
- ✅ API calls are made successfully with authentication

### 2. No Authentication Token
- ✅ API calls are made without Authorization header
- ✅ Only `Content-Type: application/json` header is included
- ✅ Component handles missing token gracefully

### 3. Invalid/Expired Token (403 Forbidden)
- ✅ Component handles 403 errors gracefully
- ✅ Empty data is returned instead of crashing
- ✅ User experience is maintained despite auth failure

### 4. Network Errors
- ✅ Network failures are caught and handled
- ✅ Components return empty data on error
- ✅ No uncaught exceptions

### 5. Role-Based Access
- ✅ Approvers call `/api/requests/viewAll` endpoint
- ✅ Requestors call `/api/requests/viewForRequestor` endpoint
- ✅ Correct Authorization header for each role type

## Running the Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/hooks/useRequests.test.ts
npm test -- src/components/requests-table/requests-table.test.tsx
npm test -- src/pages/request-detail/request-detail.test.tsx

# Run with coverage
npm test -- --coverage
```

## Expected API Call Format

### With Token:
```javascript
fetch("/api/requests/viewAll", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  body: JSON.stringify({ userEmail: "user@army.mil" })
})
```

### Without Token:
```javascript
fetch("/api/requests/viewAll", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ userEmail: "user@army.mil" })
})
```

## Benefits of This Test Coverage

1. **Prevents Regressions**: Ensures Authorization headers aren't accidentally removed
2. **Documents Behavior**: Tests serve as documentation for how auth should work
3. **Catches Auth Issues Early**: Identifies problems before deployment
4. **Role-Based Testing**: Verifies both approver and requestor flows
5. **Error Handling**: Ensures graceful degradation on auth failures

## Next Steps

- ✅ All tests passing
- ✅ Authorization headers properly included
- ✅ Error handling verified
- ⏭️ Ready for deployment

## Related Files

- `src/services/authService.ts` - Authentication service that manages tokens
- `src/utils/api-config.ts` - API URL configuration
- `src/hooks/useAuth.ts` - Authentication hook for role management
