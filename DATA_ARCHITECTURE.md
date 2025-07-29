# Requests Data Architecture

This document outlines the new data architecture for handling requests and user data in the marketplace application.

## Overview

The application now uses a structured approach to simulate API endpoints for requests and user data, moving away from inline data generation to a more maintainable and realistic data structure.

## File Structure

```
src/
├── data/
│   ├── mock-requestsData.ts    # Requests data and API simulation
│   └── mock-usersData.ts       # Users data and API simulation
├── hooks/
│   ├── useRequestsData.ts      # Custom hook for requests data management
│   └── useUsersData.ts         # Custom hook for users data management
└── components/
    └── requests-table/
        ├── requests-table.tsx          # Updated table component
        └── requests-table-examples.tsx # Usage examples
```

## Data Files

### mock-requestsData.ts
- **RequestData interface**: Defines the structure of a request
- **RequestsResponse interface**: Defines API response structure
- **Mock data**: 10 sample requests with realistic data
- **API simulation functions**:
  - `getAllRequests()`: Returns all requests with metadata
  - `getRequestsByUserId(userId)`: Returns requests for specific user
  - `getRequestById(requestId)`: Returns single request by ID

### mock-usersData.ts
- **UserData interface**: Defines the structure of a user
- **UsersResponse interface**: Defines API response structure
- **Mock data**: 5 sample users with realistic profiles
- **API simulation functions**:
  - `getAllUsers()`: Returns all users with metadata
  - `getUserById(userId)`: Returns single user by ID
  - `getUsersByOrganization(org)`: Returns users by organization
  - `searchUsers(query)`: Searches users by name, email, or ID

## Custom Hooks

### useRequestsData.ts
- **useRequestsData(userId?)**: Hook for loading requests data
  - If `userId` provided: loads requests for that user
  - If no `userId`: loads all requests
  - Returns: `{ requests, loading, error, refetch }`
- **useRequestData(requestId)**: Hook for loading single request
  - Returns: `{ request, loading, error, refetch }`

### useUsersData.ts
- **useUsersData(organization?)**: Hook for loading users data
- **useUserData(userId)**: Hook for loading single user
- **useUserSearch()**: Hook for searching users

## Updated RequestsTable Component

The `RequestsTable` component now supports:

### Props
- `data?: RequestData[]` - Optional pre-loaded data
- `userId?: string` - Filter requests for specific user
- `showUserColumn?: boolean` - Show/hide User ID column

### Features
- **Automatic data loading**: Uses hooks when no data prop provided
- **Loading states**: Shows spinner while loading data
- **Error handling**: Displays error messages
- **Dynamic columns**: User ID column can be hidden for user-specific views
- **Filtering and search**: Built-in DataGrid filtering capabilities

### Usage Examples

```tsx
// All requests with loading from API
<RequestsTable />

// User-specific requests without User ID column
<RequestsTable userId="joe.snuffy.ctr" showUserColumn={false} />

// Pre-loaded data (no API call)
<RequestsTable data={myRequestsData} />
```

## API Simulation Features

- **Realistic delays**: 100-150ms to simulate network requests
- **Promise-based**: All functions return Promises
- **TypeScript interfaces**: Fully typed for better development experience
- **Error handling**: Proper error states and messages
- **Metadata**: API responses include total counts and timestamps

## Benefits

1. **Maintainable**: Clear separation between data, business logic, and UI
2. **Reusable**: Hooks and data functions can be used across components
3. **Testable**: Easy to mock and test individual pieces
4. **Realistic**: Simulates real API behavior with loading states
5. **Type-safe**: Full TypeScript support with proper interfaces
6. **Scalable**: Easy to extend with new data types and endpoints

## Future Enhancements

- Add pagination support to data functions
- Implement caching mechanisms in hooks
- Add sorting and filtering parameters to API functions
- Create data mutations (create, update, delete operations)
- Add real-time updates simulation with WebSocket-like behavior
