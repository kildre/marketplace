import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { MockUserProfile } from '../constants/mockUsers';
import { AuthService } from '../services/authService';

interface MockTokenParsed {
  sub: string;
  preferred_username: string;
  email: string;
  given_name: string;
  family_name: string;
  name: string;
  realm_access: {
    roles: string[];
  };
  resource_access: {
    [key: string]: {
      roles: string[];
    };
  };
  exp: number;
  iat: number;
  iss: string;
  aud: string;
}

interface MockKeycloak {
  authenticated: boolean;
  token?: string;
  tokenParsed?: MockTokenParsed;
  refreshToken?: string;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateToken: (minValidity?: number) => Promise<boolean>;
  hasRealmRole: (role: string) => boolean;
  hasResourceRole: (role: string, resource?: string) => boolean;
}

interface MockKeycloakContextType {
  keycloak: MockKeycloak;
  initialized: boolean;
  login: (userProfile: MockUserProfile) => void;
  logout: () => void;
}

const MockKeycloakContext = createContext<MockKeycloakContextType | undefined>(undefined);

interface MockKeycloakProviderProps {
  children: ReactNode;
}

// Helper to create mock token from user profile
function createTokenPayload(user: MockUserProfile): MockTokenParsed {
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
    iss: import.meta.env.VITE_KEYCLOAK_URL || 'https://keycloak.cdao.us/auth/realms/baby-yoda',
    aud: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'marketplace',
  };
}

// Helper to create mock token string
function createMockToken(tokenParsed: MockTokenParsed): string {
  const payload = btoa(JSON.stringify(tokenParsed));
  return `mock.${payload}.signature`;
}

// Create unauthenticated mock keycloak instance
function createUnauthenticatedMockKeycloak(): MockKeycloak {
  return {
    authenticated: false,
    token: undefined,
    tokenParsed: undefined,
    refreshToken: undefined,
    login: async () => {
      console.warn('Mock Keycloak login called on unauthenticated instance');
    },
    logout: async () => {
      console.warn('Mock Keycloak logout called on unauthenticated instance');
    },
    updateToken: async () => false,
    hasRealmRole: () => false,
    hasResourceRole: () => false,
  };
}

// Create authenticated mock keycloak instance
function createAuthenticatedMockKeycloak(token: string, tokenParsed: MockTokenParsed): MockKeycloak {
  return {
    authenticated: true,
    token,
    tokenParsed,
    refreshToken: 'mock-refresh-token',
    login: async () => {
      console.log('Already authenticated');
    },
    logout: async () => {
      AuthService.clearStoredAuth();
    },
    updateToken: async () => true,
    hasRealmRole: (role: string) => {
      return tokenParsed.realm_access?.roles?.includes(role) || false;
    },
    hasResourceRole: (role: string, resource = 'marketplace-ui') => {
      return tokenParsed.resource_access?.[resource]?.roles?.includes(role) || false;
    },
  };
}

export const MockKeycloakProvider: React.FC<MockKeycloakProviderProps> = ({ children }) => {
  const [keycloak, setKeycloak] = useState<MockKeycloak>(() =>
    createUnauthenticatedMockKeycloak()
  );
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedAuth = localStorage.getItem('mock_auth_state');
    if (savedAuth) {
      try {
        const authState = JSON.parse(savedAuth);
        const authenticatedKeycloak = createAuthenticatedMockKeycloak(
          authState.token,
          authState.tokenParsed
        );
        setKeycloak(authenticatedKeycloak);

        // Set window.keycloak for backward compatibility
        if (typeof window !== 'undefined') {
          (window as any).keycloak = authenticatedKeycloak;
        }

        // Store user info in localStorage using AuthService
        const userInfo = AuthService.createUserInfoFromToken(authState.tokenParsed);
        AuthService.storeUserInfo(userInfo);
      } catch (error) {
        console.error('Failed to restore mock auth state:', error);
        localStorage.removeItem('mock_auth_state');
      }
    } else {
      // Set unauthenticated keycloak to window
      if (typeof window !== 'undefined') {
        (window as any).keycloak = keycloak;
      }
    }

    setInitialized(true);
  }, []);

  const login = (userProfile: MockUserProfile) => {
    const tokenParsed = createTokenPayload(userProfile);
    const token = createMockToken(tokenParsed);

    const authenticatedKeycloak = createAuthenticatedMockKeycloak(token, tokenParsed);

    setKeycloak(authenticatedKeycloak);
    localStorage.setItem('mock_auth_state', JSON.stringify({ tokenParsed, token }));

    // Update window.keycloak
    if (typeof window !== 'undefined') {
      (window as any).keycloak = authenticatedKeycloak;
    }

    // Store user info using AuthService
    const userInfo = AuthService.createUserInfoFromToken(tokenParsed);
    AuthService.storeUserInfo(userInfo);
  };

  const logout = () => {
    const unauthenticatedKeycloak = createUnauthenticatedMockKeycloak();
    setKeycloak(unauthenticatedKeycloak);
    localStorage.removeItem('mock_auth_state');
    localStorage.removeItem('marketplace_session_id');
    AuthService.clearStoredAuth();

    // Update window.keycloak
    if (typeof window !== 'undefined') {
      (window as any).keycloak = unauthenticatedKeycloak;
    }
  };

  // Update window.keycloak when keycloak state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).keycloak = keycloak;
    }
  }, [keycloak]);

  const contextValue: MockKeycloakContextType = {
    keycloak,
    initialized,
    login,
    logout,
  };

  return (
    <MockKeycloakContext.Provider value={contextValue}>
      {children}
    </MockKeycloakContext.Provider>
  );
};

// Hook to use mock keycloak
export const useMockKeycloak = () => {
  const context = useContext(MockKeycloakContext);
  if (!context) {
    throw new Error('useMockKeycloak must be used within MockKeycloakProvider');
  }
  return context;
};

export default MockKeycloakProvider;
