import React, { createContext, ReactNode, useContext, useState } from "react";
import { AuthService } from "../services/authService";

// Mock role options for development testing
export enum MockRoleOptions {
  MARKETPLACE_APPROVER = "marketplace-approver",
  MARKETPLACE_REQUESTOR = "marketplace-requestor",
  LEGACY_APPROVER = "APPROVER",
  LEGACY_REQUESTOR = "REQUESTOR",
}

// Type for token parsed data
interface MockTokenParsed {
  sub: string;
  preferred_username: string;
  email: string;
  given_name: string;
  family_name: string;
  realm_access: {
    roles: string[];
  };
  resource_access: {
    marketplace: {
      roles: string[];
    };
  };
  exp: number;
  iat: number;
  iss: string;
  aud: string;
  designation?: string;
  agency?: string;
}

// Mock user configurations for different scenarios
const mockUserConfigurations = {
  approver_joanna: {
    id: "approver-user-joanna",
    username: "joanna.c.ramsey",
    email: "joanna.c.ramsey.civ@mail.mil",
    firstName: "Joanna",
    lastName: "Ramsey",
    roles: [MockRoleOptions.MARKETPLACE_APPROVER],
    designation: "CDAO Approver",
    agency: "CDAO",
  },
  approver_jennifer: {
    id: "approver-user-jennifer",
    username: "jennifer.a.cowley",
    email: "jennifer.a.cowley.civ@mail.mil",
    firstName: "Jennifer",
    lastName: "Cowley",
    roles: [MockRoleOptions.MARKETPLACE_APPROVER],
    designation: "CDAO Approver",
    agency: "CDAO",
  },
  approver_jane: {
    id: "approver-user-jane",
    username: "jane.f.roberts",
    email: "jane.f.roberts.civ@mail.mil",
    firstName: "Jane",
    lastName: "Roberts",
    roles: [MockRoleOptions.MARKETPLACE_APPROVER],
    designation: "CDAO Approver",
    agency: "CDAO",
  },
  requestor_vinoth: {
    id: "requestor-user-vinoth",
    username: "vinoth.jagannathan",
    email: "vinoth.jagannathan.civ@mail.mil",
    firstName: "Vinoth",
    lastName: "Jagannathan",
    roles: [MockRoleOptions.MARKETPLACE_REQUESTOR],
    designation: "CDAO Requestor",
    agency: "CDAO",
  },
  requestor_elizabeth: {
    id: "requestor-user-elizabeth",
    username: "elizabeth.y.ahn",
    email: "elizabeth.y.ahn.civ@mail.mil",
    firstName: "Elizabeth",
    lastName: "Ahn",
    roles: [MockRoleOptions.MARKETPLACE_REQUESTOR],
    designation: "CDAO Requestor",
    agency: "CDAO",
  },
  requestor_daniel: {
    id: "requestor-user-daniel",
    username: "daniel.e.allen",
    email: "daniel.e.allen.civ@mail.mil",
    firstName: "Daniel",
    lastName: "Allen",
    roles: [MockRoleOptions.MARKETPLACE_REQUESTOR],
    designation: "CDAO Requestor",
    agency: "CDAO",
  },
  custom: {
    id: import.meta.env.VITE_MOCK_USER_ID || "dev-user-123",
    username: import.meta.env.VITE_MOCK_USERNAME || "developer",
    email: import.meta.env.VITE_MOCK_USER_EMAIL || "developer@advana.mil",
    firstName: import.meta.env.VITE_MOCK_USER_FIRST_NAME || "Dev",
    lastName: import.meta.env.VITE_MOCK_USER_LAST_NAME || "User",
    roles: import.meta.env.VITE_MOCK_USER_ROLES?.split(",").map(
      (role: string) => role.trim()
    ) || [MockRoleOptions.MARKETPLACE_REQUESTOR],
  },
};

interface MockKeycloakContextType {
  keycloak: {
    authenticated: boolean;
    token: string;
    tokenParsed: MockTokenParsed;
    refreshToken?: string;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    updateToken: () => Promise<boolean>;
    hasRealmRole: (role: string) => boolean;
    hasResourceRole: (role: string) => boolean;
  };
  initialized: boolean;
  // Enhanced mock functionality
  switchMockUser: (userType: keyof typeof mockUserConfigurations) => void;
  currentMockUser: string;
  availableUsers: string[];
}

const MockKeycloakContext = createContext<MockKeycloakContextType | undefined>(
  undefined
);

interface MockKeycloakProviderProps {
  children: ReactNode;
  initialUser?: keyof typeof mockUserConfigurations;
}

export const EnhancedMockKeycloakProvider: React.FC<
  MockKeycloakProviderProps
> = ({ children, initialUser = "custom" }) => {
  // Get initial user from localStorage or fallback to default
  const getInitialUser = (): keyof typeof mockUserConfigurations => {
    if (initialUser && initialUser !== "custom") return initialUser;

    try {
      const stored =
        typeof window !== "undefined" && window.localStorage
          ? window.localStorage.getItem("mockUserSelection")
          : null;
      if (stored && stored in mockUserConfigurations) {
        return stored as keyof typeof mockUserConfigurations;
      }
    } catch {
      // Ignore localStorage errors
    }

    return "custom";
  };

  const [currentUser, setCurrentUser] = useState<
    keyof typeof mockUserConfigurations
  >(getInitialUser());

  // Get current mock user data
  const getMockUserData = () => mockUserConfigurations[currentUser];

  interface MockUserData {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: MockRoleOptions[];
    designation?: string;
    agency?: string;
  }

  // Create mock token with proper structure
  const createMockToken = (userData: MockUserData) => {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600; // 1 hour from now

    return {
      sub: userData.id,
      preferred_username: userData.username,
      email: userData.email,
      given_name: userData.firstName,
      family_name: userData.lastName,
      designation: userData.designation || "",
      agency: userData.agency || "",
      realm_access: {
        roles: userData.roles,
      },
      resource_access: {
        marketplace: {
          roles: userData.roles,
        },
      },
      exp,
      iat: now,
      iss: import.meta.env.VITE_KEYCLOAK_URL,
      aud: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    };
  }; // Switch mock user and update stored data
  const switchMockUser = (userType: keyof typeof mockUserConfigurations) => {
    setCurrentUser(userType);

    // Persist selection in localStorage for page reloads
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("mockUserSelection", userType);
      }
    } catch {
      // Ignore localStorage errors
    }

    // Update stored auth data to simulate real behavior
    const userData = mockUserConfigurations[userType];
    const mockTokenData = createMockToken(userData);

    // SECURITY: In development, only store user info, not tokens
    // This matches production behavior where tokens are managed by Keycloak in memory
    const userInfo = AuthService.createUserInfoFromToken(mockTokenData);
    AuthService.storeUserInfo(userInfo);
  };

  // Initialize mock data on mount
  React.useEffect(() => {
    switchMockUser(currentUser);
  }, []);

  const mockUserData = getMockUserData();
  const mockTokenData = createMockToken(mockUserData);

  // Mock Keycloak object that mimics the real Keycloak API
  const mockKeycloak = {
    authenticated: true,
    token: `mock.${window.btoa(JSON.stringify(mockTokenData))}.signature`,
    tokenParsed: mockTokenData,
    refreshToken: "mock-refresh-token",
    login: async () => {
      // no-op in mock
    },
    logout: async () => {
      AuthService.clearStoredAuth();
    },
    updateToken: async () => {
      switchMockUser(currentUser); // Refresh the mock data
      return true;
    },
    hasRealmRole: (role: string) => mockUserData.roles.includes(role),
    hasResourceRole: (role: string) => mockUserData.roles.includes(role),
  };

  // Expose mock Keycloak to window for API service access in bypass mode
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore - Adding mock keycloak to window for bypass auth mode
      window.keycloak = mockKeycloak;
    }
    return () => {
      // Cleanup on unmount
      if (typeof window !== "undefined") {
        // @ts-ignore
        delete window.keycloak;
      }
    };
  }, [mockKeycloak]);

  const contextValue: MockKeycloakContextType = {
    keycloak: mockKeycloak,
    initialized: true,
    switchMockUser,
    currentMockUser: currentUser,
    availableUsers: Object.keys(mockUserConfigurations),
  };

  return (
    <MockKeycloakContext.Provider value={contextValue}>
      {children}
    </MockKeycloakContext.Provider>
  );
};

// Hook that mimics useKeycloak but returns mock data with enhanced functionality
export const useEnhancedMockKeycloak = () => {
  const context = useContext(MockKeycloakContext);
  if (!context) {
    throw new Error(
      "useEnhancedMockKeycloak must be used within EnhancedMockKeycloakProvider"
    );
  }
  return context;
};

// Component for switching mock users during development
export const MockUserSwitcher: React.FC = () => {
  const { switchMockUser, currentMockUser, availableUsers } =
    useEnhancedMockKeycloak();

  // Draggable state - positioned at bottom left
  const [position, setPosition] = useState({
    x: 0,
    y: window.innerHeight - 200,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = React.useRef<React.ElementRef<"div">>(null);

  if (import.meta.env.VITE_BYPASS_AUTH !== "true") {
    return null; // Don't show in production
  }

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!panelRef.current) return;

    setIsDragging(true);
    const rect = panelRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: globalThis.MouseEvent) => {
    if (!isDragging) return;

    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse events when dragging
  React.useEffect(() => {
    if (isDragging) {
      const mouseMoveHandler = (e: globalThis.MouseEvent) => handleMouseMove(e);
      const mouseUpHandler = () => handleMouseUp();

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);

      return () => {
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
      };
    }
  }, [isDragging, dragOffset.x, dragOffset.y]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Mock User Debug Panel"
      tabIndex={0}
      style={{
        position: "fixed",
        bottom: "auto",
        left: position.x,
        top: position.y,
        zIndex: 1000,
        backgroundColor: "#f0f0f0",
        border: "1px solid #ccc",
        borderRadius: "4px",
        padding: "10px",
        fontSize: "12px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        minWidth: "200px",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
      onMouseDown={handleMouseDown}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          // Could add close functionality here if needed
        }
      }}
    >
      <div
        style={{
          marginBottom: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <strong>🎭 Mock User:</strong>
        <span
          style={{
            fontSize: "10px",
            color: "#666",
            fontWeight: "normal",
          }}
        >
          🖱️ Drag to move
        </span>
      </div>
      <div style={{ marginBottom: "8px" }}>
        <select
          value={currentMockUser}
          onChange={(e) => {
            const newUserType = e.target
              .value as keyof typeof mockUserConfigurations;
            switchMockUser(newUserType);

            // Navigate to home page when user switches (in bypass auth mode)
            if (import.meta.env.VITE_BYPASS_AUTH === "true") {
              // Use window.location for immediate navigation since we can't use useNavigate hook here
              window.location.href = "/";
            }
          }}
          style={{ marginLeft: "8px", fontSize: "12px", width: "200px" }}
        >
          {availableUsers.map((user) => (
            <option key={user} value={user}>
              {user}
            </option>
          ))}
        </select>
      </div>
      <div
        style={{
          marginTop: "5px",
          fontSize: "10px",
          color: "#666",
          marginBottom: "8px",
        }}
      >
        Roles:{" "}
        {mockUserConfigurations[
          currentMockUser as keyof typeof mockUserConfigurations
        ].roles.join(", ")}
      </div>
      <div style={{ borderTop: "1px solid #ddd", paddingTop: "8px" }}>
        <a
          href="/auth-status"
          style={{
            fontSize: "10px",
            color: "#0066cc",
            textDecoration: "none",
          }}
          onClick={(e) => {
            e.preventDefault();
            window.location.href = "/auth-status";
          }}
        >
          🔐 View Auth Status →
        </a>
      </div>
    </div>
  );
};

// Legacy export for backward compatibility
export const MockKeycloakProvider = EnhancedMockKeycloakProvider;
export const useMockKeycloak = useEnhancedMockKeycloak;

// Export mock user configurations for lookup functionality
export { mockUserConfigurations };

export default EnhancedMockKeycloakProvider;
