import React, { createContext, useContext, ReactNode } from "react";

// Mock user data for development - can be configured via environment
const getMockUserRoles = (): string[] => {
  const envRoles = import.meta.env.VITE_MOCK_USER_ROLES;
  if (envRoles) {
    return envRoles.split(",").map((role: string) => role.trim());
  }
  return ["REQUESTOR"]; // Default role
};

const getMockUserData = () => ({
  id: import.meta.env.VITE_MOCK_USER_ID || "dev-user-123",
  username: import.meta.env.VITE_MOCK_USERNAME || "developer",
  email: import.meta.env.VITE_MOCK_USER_EMAIL || "developer@advana.mil",
  firstName: import.meta.env.VITE_MOCK_USER_FIRST_NAME || "Dev",
  lastName: import.meta.env.VITE_MOCK_USER_LAST_NAME || "User",
  roles: getMockUserRoles(),
  permissions: ["READ", "WRITE"],
});

// Mock user data for development
const mockUser = getMockUserData();

// Mock Keycloak object that mimics the real Keycloak API
const mockKeycloak = {
  authenticated: true,
  token: "mock-jwt-token",
  tokenParsed: {
    preferred_username: mockUser.username,
    email: mockUser.email,
    given_name: mockUser.firstName,
    family_name: mockUser.lastName,
    realm_access: {
      roles: mockUser.roles,
    },
  },
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  updateToken: () => Promise.resolve(true),
  hasRealmRole: (role: string) => mockUser.roles.includes(role),
  hasResourceRole: (role: string) => mockUser.roles.includes(role),
};

interface MockKeycloakContextType {
  keycloak: typeof mockKeycloak;
  initialized: boolean;
}

const MockKeycloakContext = createContext<MockKeycloakContextType>({
  keycloak: mockKeycloak,
  initialized: true,
});

interface MockKeycloakProviderProps {
  children: ReactNode;
}

export const MockKeycloakProvider: React.FC<MockKeycloakProviderProps> = ({
  children,
}) => {
  return (
    <MockKeycloakContext.Provider
      value={{ keycloak: mockKeycloak, initialized: true }}
    >
      {children}
    </MockKeycloakContext.Provider>
  );
};

// Hook that mimics useKeycloak but returns mock data
export const useMockKeycloak = () => {
  return useContext(MockKeycloakContext);
};

export default MockKeycloakProvider;
