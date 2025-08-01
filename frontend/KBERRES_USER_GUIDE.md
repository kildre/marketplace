# KBerres User Configuration Guide

## Overview
This document explains the mock data setup for user 'kberres' and how it translates to production usage.

## Mock Data Created

### User Profile (kberres)
- **Username**: `kberres`
- **Email**: `kberres@advana.mil`
- **Name**: K Berres
- **Role**: `marketplace-requestor`
- **Organization**: CDAO
- **Request Count**: 3

### Three Requests Created

#### 1. Request KBER-REQ-001 (Pending)
- **Ticket Number**: 9001
- **Status**: Pending
- **Products**: Databricks, DataRobot
- **Use Case**: Data analytics platform for ML model training
- **Estimated ROM**: $1,100
- **Submitted**: July 31, 2025

#### 2. Request KBER-REQ-002 (Approved)
- **Ticket Number**: 9002
- **Status**: Approved
- **Products**: AWS (10 licenses), GitLab (5 licenses)
- **Use Case**: Cloud infrastructure for dev/test environments
- **Estimated ROM**: $5,000
- **Submitted**: July 25, 2025
- **Approved By**: Sarah Johnson

#### 3. Request KBER-REQ-003 (Denied)
- **Ticket Number**: 9003
- **Status**: Denied
- **Products**: Palantir (2 licenses), Tableau (5 licenses)
- **Use Case**: Business intelligence and data visualization
- **Estimated ROM**: $1,598
- **Submitted**: July 20, 2025
- **Denial Reason**: Security clearance requirements not met

## Development Testing

### Current Configuration
Your `.env` file is now configured to use the kberres user by default:

```bash
VITE_BYPASS_AUTH=true
VITE_MOCK_USER_ID=kberres
VITE_MOCK_USERNAME=kberres
VITE_MOCK_USER_EMAIL=kberres@advana.mil
VITE_MOCK_USER_FIRST_NAME=K
VITE_MOCK_USER_LAST_NAME=Berres
VITE_MOCK_USER_ROLES=marketplace-requestor
```

### Testing Different Users
You can also switch to other mock users using the MockUserSwitcher:
- **kberres**: The user with 3 test requests
- **approver**: User with approval permissions
- **requestor**: Generic requestor user
- **both**: User with both roles
- **custom**: Uses your .env configuration

## Production Setup

### For Real Production Usage

1. **Keycloak User Setup**:
   ```bash
   # In production Keycloak, ensure user 'kberres' has:
   Username: kberres
   Email: kberres@advana.mil
   First Name: K
   Last Name: Berres
   Assigned Roles: marketplace-requestor
   ```

2. **Production Environment Variables**:
   ```bash
   VITE_BYPASS_AUTH=false
   VITE_KEYCLOAK_URL=https://keycloak.cdao.us/auth
   VITE_KEYCLOAK_REALM=baby-yoda
   VITE_KEYCLOAK_CLIENT_ID=marketplace
   ```

3. **Expected Production Behavior**:
   - When kberres logs in via Keycloak, they'll be redirected to login page
   - After successful authentication, token will contain `marketplace-requestor` role
   - User will see:
     - Product Catalog as home page (requestor role)
     - Cart functionality enabled
     - Their 3 requests in the requests page (if backend has this data)
     - Cannot access approval workflows (no approver role)

### Backend Integration Notes

For production, you'll need to ensure your backend API:

1. **User Requests Endpoint**: 
   - `GET /api/requests?userId=kberres` should return the 3 requests
   - Or create these requests in your actual database

2. **Role-Based Access**: 
   - Backend should validate `marketplace-requestor` role from JWT token
   - Restrict access to approval endpoints for this user

3. **Data Consistency**: 
   - The mock request data structure matches your backend API
   - User profile data is consistent between Keycloak and your user service

## Testing Scenarios

### As kberres User (Requestor Role):

✅ **Should be able to**:
- View product catalog
- Add items to cart
- Submit new requests
- View own requests (3 existing ones)
- See request details and status

❌ **Should NOT be able to**:
- Access approval workflows
- Approve/deny other users' requests
- View all users' requests
- Access admin functions

### Verification Steps:

1. **Login Flow**: 
   - Set `VITE_BYPASS_AUTH=false` 
   - Navigate to app
   - Should redirect to Keycloak
   - Login as kberres
   - Should return to app with requestor role

2. **Role Testing**:
   - Home page should show Product Catalog
   - Sidebar should show: Product Catalog, Cart, Requests
   - Requests page should show 3 requests for kberres
   - Should not see approval interface

## Mock vs Production Data Flow

### Development (Mock):
```
App → EnhancedMockKeycloakProvider → Mock Token → kberres user data
```

### Production:
```
App → Keycloak Server → Real JWT Token → Backend API → Real kberres data
```

The authentication system automatically handles both flows using the same `useAuth` hook and components!

## Quick Setup Commands

```bash
# Test as kberres in development
npm run dev
# Navigate to http://localhost:5173
# User will be logged in as kberres with 3 requests

# Switch to production testing
# Update .env: VITE_BYPASS_AUTH=false
npm run dev
# Will redirect to real Keycloak for authentication
```
