# Mock Keycloak Login Implementation Plan

## Executive Summary

This document outlines a plan to replace the current `MockUserSwitcher` component (floating panel) with a proper mock Keycloak login page that mimics the real Keycloak authentication flow while maintaining user session consistency.

---

## Current State Analysis

### Frontend Authentication Modes

The application currently supports two authentication modes controlled by `VITE_BYPASS_AUTH`:

**Mode 1: Real Keycloak (`VITE_BYPASS_AUTH=false`)**
- Uses `@react-keycloak/web` library
- Redirects to external Keycloak server (`https://keycloak.cdao.us/auth`)
- Uses OIDC Authorization Code Flow with PKCE
- Token stored and managed by Keycloak library

**Mode 2: Mock Keycloak (`VITE_BYPASS_AUTH=true`)**
- Uses `EnhancedMockKeycloakProvider` context
- Displays floating `MockUserSwitcher` panel (bottom-left of screen)
- Allows runtime switching between 6 predefined users
- Stores selected user in `localStorage['mockUserSelection']`
- Generates mock tokens in format: `mock.{base64(payload)}.signature`

### Current Mock User Switcher Issues

1. **UX Inconsistency**: Floating panel doesn't match production login experience
2. **User Switching**: Allows changing users mid-session, causing data inconsistencies
3. **No Login Flow**: Users don't go through a login process, app loads pre-authenticated
4. **State Management**: Uses `window.location.href = "/"` to reload page on user switch
5. **Developer-focused**: Not suitable for demos or stakeholder presentations

### Backend Mock Token Support

The backend (`authConfig.ts`) already supports mock tokens:
- Detects tokens starting with `mock.`
- Parses base64-encoded payload: `Buffer.from(parts[1], 'base64')`
- Extracts user info: `sub`, `email`, `realm_access.roles`, `resource_access`
- Auto-creates users in DB on first request via email
- Bypasses Keycloak introspection when `KEYCLOAK_BYPASS_AUTH=true`

---

## Proposed Architecture

### Goals

1. ✅ Create a realistic mock Keycloak login page
2. ✅ Maintain single user session (no mid-session switching)
3. ✅ Send properly formatted mock tokens to backend
4. ✅ Auto-register users and retrieve their data
5. ✅ Match production authentication UX flow
6. ✅ Remove `MockUserSwitcher` component

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  User visits app (not authenticated)                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  App Entry (main.tsx)                                           │
│  - VITE_BYPASS_AUTH=true → Load MockKeycloakProvider           │
│  - Sets window.keycloak with unauthenticated state             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  ProtectedRoute wrapper detects no authentication               │
│  - Redirects to /mock-login                                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Mock Login Page (/mock-login)                                  │
│  - Styled like Keycloak login page                              │
│  - Dropdown to select user persona                              │
│  - Username/email field (read-only or editable)                 │
│  - Password field (dummy, not validated)                        │
│  - "Sign In" button                                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼ (User clicks "Sign In")
┌─────────────────────────────────────────────────────────────────┐
│  MockAuthService.login(selectedUser)                            │
│  1. Generate mock token with user's data                        │
│  2. Update MockKeycloakContext state                            │
│  3. Store token/user in localStorage                            │
│  4. Call SessionService.initializeSession() if needed           │
│  5. Navigate to "/" or returnUrl                                │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  App loads with authenticated user                              │
│  - window.keycloak.authenticated = true                         │
│  - window.keycloak.token = mock token                           │
│  - window.keycloak.tokenParsed = user payload                   │
│  - All API calls use Authorization header                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend receives mock token                                    │
│  - Recognizes "mock." prefix                                    │
│  - Decodes base64 payload                                       │
│  - Auto-creates user by email if new                            │
│  - Attaches req.currentUser to all requests                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. Mock Keycloak Provider Refactor

**File:** `frontend/src/contexts/MockKeycloakProvider.tsx` (new/enhanced)

**Key Changes:**
- Remove automatic authentication on mount
- Start with `authenticated: false` state
- Provide `login()` and `logout()` methods in context
- Persist authentication state in localStorage
- Check localStorage on mount to restore previous session

```typescript
interface MockKeycloakContextType {
  keycloak: MockKeycloak;
  initialized: boolean;
  login: (userProfile: MockUserProfile) => void;
  logout: () => void;
}

const MockKeycloakProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [keycloak, setKeycloak] = useState<MockKeycloak>(() =>
    createUnauthenticatedMockKeycloak()
  );
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedAuth = localStorage.getItem('mock_auth_state');
    if (savedAuth) {
      const authState = JSON.parse(savedAuth);
      setKeycloak(createAuthenticatedMockKeycloak(authState));
    }
    setInitialized(true);
  }, []);

  const login = (userProfile: MockUserProfile) => {
    const tokenParsed = createTokenPayload(userProfile);
    const token = createMockToken(tokenParsed);

    const authenticatedKeycloak = {
      authenticated: true,
      token,
      tokenParsed,
      // ... other keycloak methods
    };

    setKeycloak(authenticatedKeycloak);
    localStorage.setItem('mock_auth_state', JSON.stringify({ tokenParsed, token }));
    window.keycloak = authenticatedKeycloak; // Ensure window object is updated
  };

  const logout = () => {
    setKeycloak(createUnauthenticatedMockKeycloak());
    localStorage.removeItem('mock_auth_state');
    localStorage.removeItem('marketplace_session_id');
    window.keycloak = createUnauthenticatedMockKeycloak();
  };

  return (
    <MockKeycloakContext.Provider value={{ keycloak, initialized, login, logout }}>
      {children}
    </MockKeycloakContext.Provider>
  );
};
```

**Helper Functions:**
```typescript
function createMockToken(tokenParsed: any): string {
  const payload = btoa(JSON.stringify(tokenParsed));
  return `mock.${payload}.signature`;
}

function createTokenPayload(user: MockUserProfile): any {
  const now = Math.floor(Date.now() / 1000);
  return {
    sub: user.sub,
    email: user.email,
    preferred_username: user.username,
    given_name: user.firstName,
    family_name: user.lastName,
    name: `${user.firstName} ${user.lastName}`,
    realm_access: {
      roles: user.roles,
    },
    resource_access: {
      'marketplace-ui': {
        roles: user.roles,
      },
    },
    exp: now + 3600, // 1 hour expiry
    iat: now,
    iss: 'https://keycloak.cdao.us/auth/realms/baby-yoda',
    aud: 'marketplace',
  };
}
```

---

### 2. Mock Login Page Component

**File:** `frontend/src/pages/MockLogin.tsx` (new)

**Features:**
- Styled to resemble Keycloak login page
- Dropdown for quick user selection (development convenience)
- Manual fields for custom user creation
- Form validation
- Loading state during "authentication"

```tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMockKeycloak } from '../hooks/useMockKeycloak';
import { MOCK_USER_PROFILES } from '../constants/mockUsers';
import './MockLogin.css';

interface MockUserProfile {
  sub: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

const MockLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useMockKeycloak();

  const [selectedPreset, setSelectedPreset] = useState<string>('approver_joanna');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>(''); // Not validated, just for UX
  const [isLoading, setIsLoading] = useState(false);

  // Get return URL from state or default to home
  const returnUrl = (location.state as any)?.from?.pathname || '/';

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetId = e.target.value;
    setSelectedPreset(presetId);
    const preset = MOCK_USER_PROFILES.find(u => u.id === presetId);
    if (preset) {
      setEmail(preset.email);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));

    const selectedUser = MOCK_USER_PROFILES.find(u => u.id === selectedPreset);
    if (!selectedUser) {
      console.error('No user selected');
      setIsLoading(false);
      return;
    }

    // Perform mock login
    login(selectedUser);

    // Redirect to return URL
    navigate(returnUrl, { replace: true });
  };

  return (
    <div className="mock-login-container">
      <div className="mock-login-card">
        <div className="mock-login-header">
          <h1>Advana Marketplace</h1>
          <p className="mock-login-subtitle">Mock Authentication (Development Only)</p>
        </div>

        <form className="mock-login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="preset">Select User Profile</label>
            <select
              id="preset"
              value={selectedPreset}
              onChange={handlePresetChange}
              className="form-control"
              disabled={isLoading}
            >
              <optgroup label="Approvers">
                {MOCK_USER_PROFILES.filter(u => u.roles.includes('marketplace-approver')).map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} - {user.email}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Requestors">
                {MOCK_USER_PROFILES.filter(u => u.roles.includes('marketplace-requestor')).map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} - {user.email}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="user@example.com"
              required
              disabled={isLoading}
              readOnly // Since we're using presets
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="Not validated in mock mode"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn-login"
            disabled={isLoading || !email}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mock-login-footer">
          <small>Mock authentication enabled for local development</small>
        </div>
      </div>
    </div>
  );
};

export default MockLogin;
```

**CSS File:** `frontend/src/pages/MockLogin.css`

```css
.mock-login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.mock-login-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 450px;
  width: 100%;
  padding: 40px;
}

.mock-login-header {
  text-align: center;
  margin-bottom: 30px;
}

.mock-login-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.mock-login-subtitle {
  color: #ff6b6b;
  font-size: 13px;
  font-weight: 500;
  background: #fff5f5;
  padding: 6px 12px;
  border-radius: 4px;
  display: inline-block;
}

.mock-login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-control {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-control:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.btn-login {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 10px;
}

.btn-login:hover:not(:disabled) {
  background: #5568d3;
}

.btn-login:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.mock-login-footer {
  margin-top: 30px;
  text-align: center;
  color: #999;
  font-size: 12px;
}
```

---

### 3. Mock User Profiles Constants

**File:** `frontend/src/constants/mockUsers.ts` (new)

Centralize all mock user definitions:

```typescript
export interface MockUserProfile {
  id: string;
  sub: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export const MOCK_USER_PROFILES: MockUserProfile[] = [
  {
    id: 'approver_joanna',
    sub: 'c0a80101-0000-0000-0000-000000000001',
    email: 'joanna.ramsey@example.com',
    username: 'joanna.ramsey',
    firstName: 'Joanna',
    lastName: 'Ramsey',
    roles: ['marketplace-approver'],
  },
  {
    id: 'approver_jennifer',
    sub: 'c0a80101-0000-0000-0000-000000000002',
    email: 'jennifer.cowley@example.com',
    username: 'jennifer.cowley',
    firstName: 'Jennifer',
    lastName: 'Cowley',
    roles: ['marketplace-approver'],
  },
  {
    id: 'approver_jane',
    sub: 'c0a80101-0000-0000-0000-000000000003',
    email: 'jane.roberts@example.com',
    username: 'jane.roberts',
    firstName: 'Jane',
    lastName: 'Roberts',
    roles: ['marketplace-approver'],
  },
  {
    id: 'requestor_vinoth',
    sub: 'c0a80101-0000-0000-0000-000000000004',
    email: 'vinoth.jagannathan@example.com',
    username: 'vinoth.jagannathan',
    firstName: 'Vinoth',
    lastName: 'Jagannathan',
    roles: ['marketplace-requestor'],
  },
  {
    id: 'requestor_elizabeth',
    sub: 'c0a80101-0000-0000-0000-000000000005',
    email: 'elizabeth.ahn@example.com',
    username: 'elizabeth.ahn',
    firstName: 'Elizabeth',
    lastName: 'Ahn',
    roles: ['marketplace-requestor'],
  },
  {
    id: 'requestor_daniel',
    sub: 'c0a80101-0000-0000-0000-000000000006',
    email: 'daniel.allen@example.com',
    username: 'daniel.allen',
    firstName: 'Daniel',
    lastName: 'Allen',
    roles: ['marketplace-requestor'],
  },
];
```

---

### 4. Protected Route Component

**File:** `frontend/src/components/auth/ProtectedRoute.tsx` (new)

Wraps routes that require authentication:

```tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useKeycloak } from '../../hooks/useKeycloak';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();
  const location = useLocation();

  // Wait for initialization
  if (!initialized) {
    return <div className="loading-screen">Initializing authentication...</div>;
  }

  // Redirect to login if not authenticated
  if (!keycloak.authenticated) {
    return <Navigate to="/mock-login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

---

### 5. User Profile Dropdown Component

**File:** `frontend/src/components/auth/UserProfileDropdown.tsx` (new)

This component displays a user profile icon that opens a dropdown menu with user information and logout functionality. It will be positioned to the right of the shopping cart in the header.

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeycloak } from '../../hooks/useKeycloak';
import { useAuth } from '../../hooks/useAuth';
import { SessionService } from '../../services/sessionService';
import './UserProfileDropdown.css';

export const UserProfileDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();
  const { getUserInfo } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userInfo = getUserInfo();
  const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);

    // Expire backend session if using session storage
    try {
      const sessionId = localStorage.getItem('marketplace_session_id');
      if (sessionId) {
        await SessionService.expireSession(sessionId);
      }
    } catch (error) {
      console.error('Error expiring session:', error);
    }

    // Handle logout based on authentication mode
    if (bypassAuth) {
      // Mock mode: clear localStorage and redirect to mock login
      localStorage.removeItem('mock_auth_state');
      localStorage.removeItem('marketplace_session_id');
      navigate('/mock-login', { replace: true });
    } else {
      // Real Keycloak mode: use Keycloak logout
      keycloak.logout({ redirectUri: window.location.origin });
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!userInfo?.name) return '?';
    const names = userInfo.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return userInfo.name[0].toUpperCase();
  };

  return (
    <div className="user-profile-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="user-profile-icon-btn"
        aria-label="User profile"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
      >
        <div className="user-avatar">
          {getInitials()}
        </div>
      </button>

      {isOpen && (
        <div className="user-profile-dropdown-menu">
          <div className="user-profile-info">
            <div className="user-profile-avatar-large">
              {getInitials()}
            </div>
            <div className="user-profile-details">
              <div className="user-profile-name">{userInfo?.name || 'Unknown User'}</div>
              <div className="user-profile-email">{userInfo?.email || 'No email'}</div>
            </div>
          </div>
          <div className="user-profile-divider"></div>
          <button
            type="button"
            className="user-profile-logout-btn"
            onClick={handleLogout}
          >
            <svg
              className="logout-icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10.6667 11.3333L14 8L10.6667 4.66667"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 8H6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
```

**CSS File:** `frontend/src/components/auth/UserProfileDropdown.css`

```css
.user-profile-dropdown {
  position: relative;
  display: inline-block;
  margin-left: 12px;
}

.user-profile-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-profile-icon-btn:hover .user-avatar {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.user-profile-icon-btn:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
  border-radius: 50%;
}

.user-profile-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 280px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-profile-info {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-profile-avatar-large {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
  flex-shrink: 0;
}

.user-profile-details {
  flex: 1;
  min-width: 0; /* Allow text truncation */
}

.user-profile-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-profile-email {
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-profile-divider {
  height: 1px;
  background: #e5e5e5;
  margin: 0 12px;
}

.user-profile-logout-btn {
  width: 100%;
  padding: 12px 20px;
  background: none;
  border: none;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background-color 0.2s;
  border-radius: 0 0 8px 8px;
}

.user-profile-logout-btn:hover {
  background-color: #f5f5f5;
}

.user-profile-logout-btn:active {
  background-color: #e5e5e5;
}

.logout-icon {
  flex-shrink: 0;
}

/* Ensure dropdown appears above other content */
.user-profile-dropdown-menu::before {
  content: '';
  position: absolute;
  top: -6px;
  right: 12px;
  width: 12px;
  height: 12px;
  background: white;
  transform: rotate(45deg);
  box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.05);
}
```

**Integration in App.tsx:**

Update the header section to include the user profile dropdown:

```tsx
<div className="advana-menu-override advana-service-desk-style header-with-cart">
  <AdvanaMenu
    menuLogoSection={customLogoSection}
    megaMenuBaseDomain="/"
    isCRA={false}
  />
  <NotificationBellButton />
  <CartOverlayButton />
  <UserProfileDropdown /> {/* Add this line */}
</div>
```

---

### 6. App.tsx Updates

**File:** `frontend/src/App.tsx`

Two key updates needed:

1. **Add UserProfileDropdown to header** (for both mock and real Keycloak modes)
2. **Add mock login route** (only for mock mode)

```tsx
import { Route, Routes } from "react-router-dom";
import { ApproverRedirectGuard } from "./components/auth/ApproverRedirectGuard";
import UserProfileDropdown from "./components/auth/UserProfileDropdown"; // Add this import
import MockLogin from "./pages/MockLogin"; // Add this import for mock mode
// ... other existing imports

function App(): React.ReactElement {
  const { hasRole } = useAuth();
  const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';

  // ... existing code ...

  return (
    <NotificationProvider>
      <div className="app-wrapper">
        <GovernmentBanner />
        <div className="advana-menu-override advana-service-desk-style header-with-cart">
          <AdvanaMenu
            menuLogoSection={customLogoSection}
            megaMenuBaseDomain="/"
            isCRA={false}
          />
          <NotificationBellButton />
          <CartOverlayButton />
          <UserProfileDropdown /> {/* Add this line */}
        </div>
        <main className="main-content">
          <Sidebar />
          <Routes>
            {/* Mock login route - only in bypass mode */}
            {bypassAuth && <Route path="/mock-login" element={<MockLogin />} />}

            {/* Existing routes remain the same */}
            <Route path="/" element={getHomeComponent()} />
            <Route
              path="/cart"
              element={
                <ApproverRedirectGuard>
                  <Cart />
                </ApproverRedirectGuard>
              }
            />
            {/* ... rest of existing routes ... */}
          </Routes>
        </main>
        <Footer />
      </div>
    </NotificationProvider>
  );
}
```

**Important Notes:**
- The `UserProfileDropdown` component works in **both mock and real Keycloak modes** by using the `useKeycloak()` hook which abstracts the authentication provider
- In mock mode: logout clears localStorage and redirects to `/mock-login`
- In real Keycloak mode: logout calls `keycloak.logout()` with redirect to origin
- The component displays user name and email from `getUserInfo()` which works in both modes
- No need to conditionally render this component - it works universally

---

### 7. Main Entry Point Updates

**File:** `frontend/src/main.tsx`

Update to use new provider structure:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MockKeycloakProvider } from './contexts/MockKeycloakProvider';

const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';

// Set window.keycloak early (for backward compatibility)
if (bypassAuth) {
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  root.render(
    <React.StrictMode>
      <MockKeycloakProvider>
        <App />
      </MockKeycloakProvider>
    </React.StrictMode>
  );
} else {
  // Real Keycloak flow (unchanged)
  import('./keycloak').then(({ default: keycloak }) => {
    window.keycloak = keycloak;

    const root = ReactDOM.createRoot(document.getElementById('root')!);
    root.render(
      <React.StrictMode>
        <ReactKeycloakProvider
          authClient={keycloak}
          initOptions={keycloakInitOptions}
          onTokens={handleTokens}
        >
          <App />
        </ReactKeycloakProvider>
      </React.StrictMode>
    );
  });
}
```

---

### 8. Cleanup: Remove MockUserSwitcher

**Files to modify:**
1. `frontend/src/contexts/EnhancedMockKeycloakProvider.tsx` - Remove or archive
2. `frontend/src/main.tsx` - Remove `<MockUserSwitcher />` import and usage
3. Update any components that reference the old mock context

---

## Backend Considerations

### No Changes Required

The backend already fully supports the mock token format:
- `authConfig.ts` detects `mock.` prefix
- Parses base64 payload correctly
- Auto-creates users by email
- Validates roles from token

### Optional Enhancements

**1. Mock Token Validation (Optional)**

Add light validation to ensure mock tokens are well-formed:

```typescript
function parseMockToken(token: string): IntrospectionResult {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid mock token format');
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));

    // Validate required fields
    if (!payload.email || !payload.sub) {
      throw new Error('Mock token missing required fields');
    }

    return {
      active: true,
      sub: payload.sub,
      email: payload.email,
      // ... rest of mapping
    };
  } catch (error) {
    logger.warn('Failed to parse mock token', { error });
    // Fall back to default bypass user
    return createDefaultBypassUser();
  }
}
```

**2. Session Registration Enhancement**

Currently, session registration happens after login. With the new flow, you might want to call `SessionService.initializeSession()` from the mock login handler:

```typescript
// In MockKeycloakProvider login() method
const login = async (userProfile: MockUserProfile) => {
  const tokenParsed = createTokenPayload(userProfile);
  const token = createMockToken(tokenParsed);

  // ... set state ...

  // Initialize backend session if using session storage
  if (import.meta.env.VITE_USE_SESSION_STORAGE === 'true') {
    try {
      await SessionService.initializeSession(token, ''); // No refresh token in mock
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  }
};
```

---

## Migration Plan

### Phase 1: Preparation
1. ✅ Create `mockUsers.ts` constants file
2. ✅ Create new `MockKeycloakProvider.tsx` with login/logout methods
3. ✅ Create `MockLogin.tsx` page component with styling
4. ✅ Create `ProtectedRoute.tsx` wrapper component
5. ✅ Create `UserProfileDropdown.tsx` component with dropdown menu

### Phase 2: Integration
1. ✅ Update `main.tsx` to use new MockKeycloakProvider
2. ✅ Update `App.tsx` routing to include `/mock-login` route
3. ✅ Wrap protected routes with `ProtectedRoute` (for mock mode only)
4. ✅ Add `UserProfileDropdown` to header (right of shopping cart)
5. ✅ Test mock login flow end-to-end

### Phase 3: Cleanup
1. ✅ Remove `MockUserSwitcher` component and imports
2. ✅ Remove or archive `EnhancedMockKeycloakProvider.tsx`
3. ✅ Clean up localStorage keys (remove `mockUserSelection`)
4. ✅ Update documentation and README

### Phase 4: Testing
1. ✅ Test all user roles (approvers and requestors)
2. ✅ Verify backend receives correct tokens
3. ✅ Verify user auto-creation in database
4. ✅ Test logout and re-login flow
5. ✅ Verify session persistence across page refreshes
6. ✅ Test with both `VITE_USE_SESSION_STORAGE` true and false

---

## Testing Checklist

### Functional Tests
- [ ] Mock login page renders correctly
- [ ] User can select from dropdown of predefined users
- [ ] Form validation works (email required)
- [ ] Login button shows loading state
- [ ] After login, user is redirected to home page or return URL
- [ ] Protected routes redirect to login when not authenticated
- [ ] Protected routes render content when authenticated
- [ ] Logout clears authentication and redirects to login
- [ ] Page refresh maintains authentication state
- [ ] Backend receives properly formatted mock token
- [ ] User is auto-created in database on first login
- [ ] User data persists and is retrievable via API
- [ ] Switching between users requires full logout/login (no mid-session switch)

### Role-Based Tests
- [ ] Approver can access approver-only routes
- [ ] Requestor can access requestor-only routes
- [ ] Approver cannot access requestor-only routes (and vice versa)
- [ ] API calls include correct Authorization header
- [ ] Backend correctly parses roles from mock token

### Integration Tests
- [ ] Session storage mode works (`VITE_USE_SESSION_STORAGE=true`)
- [ ] Direct token mode works (`VITE_USE_SESSION_STORAGE=false`)
- [ ] Session expiration handled gracefully
- [ ] Network errors on login handled gracefully

---

## Security Considerations

### Development Only
- Mock login MUST only be accessible when `VITE_BYPASS_AUTH=true`
- Display clear warnings that this is development-only
- Ensure mock mode is disabled in production builds

### Token Security
- Mock tokens should have expiration timestamps (even if not enforced)
- Don't expose sensitive data in mock tokens
- Use UUIDs for `sub` field (matches production format)

### Session Management
- Clear all auth data on logout
- Expire backend sessions properly
- Don't persist passwords (even dummy ones)

---

## Environment Variables

No new environment variables required. Existing variables control the behavior:

```bash
# Frontend (.env.local)
VITE_BYPASS_AUTH=true                    # Enable mock mode
VITE_USE_SESSION_STORAGE=true            # Use session storage
VITE_API_BASE_URL=http://localhost:8082

# Backend (docker-compose.yml or .env)
KEYCLOAK_BYPASS_AUTH=true                # Enable backend mock support
USE_CLIENT_SESSION_STORAGE=false         # Match frontend setting
```

---

## User Experience Improvements

### Visual Feedback
- Loading spinner during authentication
- Success message before redirect
- Error messages for failed login attempts
- Clear indication that this is mock mode

### Developer Experience
- Quick user switching via dropdown
- Pre-filled email based on selection
- Option to add custom users in the future
- Console logs for debugging token flow

### Demo/Stakeholder Experience
- Login flow matches production UX
- No floating developer panels
- Professional appearance
- Consistent user identity throughout session

---

## Future Enhancements

### Phase 2 Features (Optional)
1. **Custom User Creation**: Allow creating ad-hoc users with custom emails/roles
2. **Remember Me**: Persist authentication across browser sessions
3. **Multi-tenant Support**: Add organization/tenant selection
4. **Token Refresh**: Implement mock token refresh flow
5. **2FA Simulation**: Add optional 2FA step for demo purposes
6. **Login History**: Track and display recent logins for testing
7. **Role Toggle**: Allow selecting multiple roles for power users

### Advanced Features
1. **Mock OIDC Flow**: Simulate full authorization code flow with redirect
2. **Mock Consent Screen**: Add consent step for demo purposes
3. **Mock MFA**: Simulate multi-factor authentication
4. **Session Management UI**: View and manage active sessions

---

## Success Criteria

The implementation is successful when:

1. ✅ Users must go through a login page to access the application
2. ✅ User identity remains consistent throughout the session
3. ✅ No mid-session user switching is possible
4. ✅ Backend receives and correctly processes mock tokens
5. ✅ Users are auto-registered in the database
6. ✅ User data persists and is retrievable
7. ✅ UX matches production authentication flow
8. ✅ `MockUserSwitcher` component is completely removed
9. ✅ Code is maintainable and well-documented
10. ✅ No regression in real Keycloak mode

---

## Rollback Plan

If issues arise during implementation:

1. **Quick Rollback**: Revert `main.tsx` to use `EnhancedMockKeycloakProvider`
2. **Partial Rollback**: Keep new login page but re-enable `MockUserSwitcher` as fallback
3. **Feature Flag**: Add `VITE_USE_NEW_MOCK_LOGIN=true` to gradually roll out

---

## Conclusion

This implementation plan provides a comprehensive approach to replacing the `MockUserSwitcher` with a proper mock Keycloak login page. The solution:

- Maintains backend compatibility (no changes needed)
- Improves UX to match production flow
- Prevents mid-session user switching
- Provides consistent user data
- Is developer-friendly with quick user selection
- Is stakeholder-friendly with professional appearance

The phased approach allows for incremental implementation and testing, reducing risk while delivering value at each stage.
