import React, { createContext, useContext, ReactNode } from "react";

// Type definitions for the token structure
interface ResourceAccess {
  roles: string[];
}

interface TokenParsed {
  preferred_username: string;
  email: string;
  given_name: string;
  family_name: string;
  resource_access: {
    marketplace: ResourceAccess;
    account: ResourceAccess;
    [key: string]: ResourceAccess; // Allow for additional resources
  };
}

// Mock user data for development - can be configured via environment
const getMockUserRoles = (): string[] => {
  const envRoles = import.meta.env.VITE_MOCK_USER_ROLES;
  if (envRoles) {
    return envRoles.split(",").map((role: string) => role.trim());
  }
  // Default role - use environment variable to easily switch between admin and requestor
  const userType = import.meta.env.VITE_MOCK_USER_TYPE || "requestor";
  return userType === "admin" 
    ? ["marketplace-requestor", "marketplace-approver"] 
    : ["marketplace-requestor"];
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
    // Match the actual Keycloak token structure with resource_access
    resource_access: {
      marketplace: {
        roles: mockUser.roles,
      },
      account: {
        roles: [
          "manage-account",
          "manage-account-links",
          "view-profile"
        ]
      }
    } as { [key: string]: ResourceAccess },
  } as TokenParsed,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  updateToken: () => Promise.resolve(true),
  hasRealmRole: (role: string) => mockUser.roles.includes(role),
  hasResourceRole: (role: string, resource: string = "marketplace") => {
    const resourceAccess = mockKeycloak.tokenParsed?.resource_access?.[resource];
    return resourceAccess?.roles?.includes(role) || false;
  },
  // Helper method to check if user has marketplace role
  hasMarketplaceRole: (role: string) => {
    const marketplaceRoles = mockKeycloak.tokenParsed?.resource_access?.marketplace?.roles || [];
    return marketplaceRoles.includes(role);
  },
  // Helper method to check if user is approver
  isApprover: () => {
    return mockKeycloak.hasMarketplaceRole("marketplace-approver");
  },
  // Helper method to check if user is requestor
  isRequestor: () => {
    return mockKeycloak.hasMarketplaceRole("marketplace-requestor");
  },
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
