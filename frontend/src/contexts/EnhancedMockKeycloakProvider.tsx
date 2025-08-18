import React, { createContext, useContext, ReactNode, useState } from "react";
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
}

// Mock user configurations for different scenarios
const mockUserConfigurations = {
  kberres: {
    id: "kberres",
    username: "kberres",
    email: "kberres@advana.mil",
    firstName: "K",
    lastName: "Berres",
    roles: [MockRoleOptions.MARKETPLACE_REQUESTOR],
  },
  approver: {
    id: "approver-user-123",
    username: "approver.user",
    email: "approver@advana.mil",
    firstName: "Alice",
    lastName: "Approver",
    roles: [MockRoleOptions.MARKETPLACE_APPROVER],
  },
  requestor: {
    id: "requestor-user-456",
    username: "requestor.user", 
    email: "requestor@advana.mil",
    firstName: "Bob",
    lastName: "Requestor",
    roles: [MockRoleOptions.MARKETPLACE_REQUESTOR],
  },
  both: {
    id: "admin-user-789",
    username: "admin.user",
    email: "admin@advana.mil", 
    firstName: "Admin",
    lastName: "User",
    roles: [MockRoleOptions.MARKETPLACE_APPROVER, MockRoleOptions.MARKETPLACE_REQUESTOR],
  },
  custom: {
    id: import.meta.env.VITE_MOCK_USER_ID || "dev-user-123",
    username: import.meta.env.VITE_MOCK_USERNAME || "developer",
    email: import.meta.env.VITE_MOCK_USER_EMAIL || "developer@advana.mil",
    firstName: import.meta.env.VITE_MOCK_USER_FIRST_NAME || "Dev",
    lastName: import.meta.env.VITE_MOCK_USER_LAST_NAME || "User",
    roles: import.meta.env.VITE_MOCK_USER_ROLES?.split(",").map((role: string) => role.trim()) || [MockRoleOptions.MARKETPLACE_REQUESTOR],
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

const MockKeycloakContext = createContext<MockKeycloakContextType | undefined>(undefined);

interface MockKeycloakProviderProps {
  children: ReactNode;
  initialUser?: keyof typeof mockUserConfigurations;
}

export const EnhancedMockKeycloakProvider: React.FC<MockKeycloakProviderProps> = ({
  children,
  initialUser = "custom"
}) => {
  const [currentUser, setCurrentUser] = useState<keyof typeof mockUserConfigurations>(initialUser);

  // Get current mock user data
  const getMockUserData = () => mockUserConfigurations[currentUser];

  // Create mock token with proper structure
  const createMockToken = (userData: typeof mockUserConfigurations.custom) => {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600; // 1 hour from now

    return {
      sub: userData.id,
      preferred_username: userData.username,
      email: userData.email,
      given_name: userData.firstName,
      family_name: userData.lastName,
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
  };

  // Switch mock user and update stored data
  const switchMockUser = (userType: keyof typeof mockUserConfigurations) => {
    setCurrentUser(userType);
    
    // Update stored auth data to simulate real behavior
    const userData = mockUserConfigurations[userType];
    const mockTokenData = createMockToken(userData);
    const mockJwtToken = `mock.${window.btoa(JSON.stringify(mockTokenData))}.signature`;
    
    // Store token and user info using AuthService
    AuthService.storeTokens(mockJwtToken, 'mock-refresh-token');
    const userInfo = AuthService.createUserInfoFromToken(mockTokenData);
    AuthService.storeUserInfo(userInfo);

    // eslint-disable-next-line no-console
    console.log(`🎭 Mock user switched to: ${userType}`, {
      user: userData,
      appRoles: userInfo.roles,
      keycloakRoles: userInfo.keycloakRoles,
    });
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
    refreshToken: 'mock-refresh-token',
    login: async () => {
      // eslint-disable-next-line no-console
      console.log('🎭 Mock login called');
    },
    logout: async () => {
      // eslint-disable-next-line no-console
      console.log('🎭 Mock logout called');
      AuthService.clearStoredAuth();
    },
    updateToken: async () => {
      // eslint-disable-next-line no-console
      console.log('🎭 Mock token update called');
      switchMockUser(currentUser); // Refresh the mock data
      return true;
    },
    hasRealmRole: (role: string) => mockUserData.roles.includes(role),
    hasResourceRole: (role: string) => mockUserData.roles.includes(role),
  };

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
    throw new Error('useEnhancedMockKeycloak must be used within EnhancedMockKeycloakProvider');
  }
  return context;
};

// Component for switching mock users during development
export const MockUserSwitcher: React.FC = () => {
  const { switchMockUser, currentMockUser, availableUsers } = useEnhancedMockKeycloak();
  
  // Draggable state - positioned at bottom left
  const [position, setPosition] = useState({ x: 0, y: window.innerHeight - 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = React.useRef<React.ElementRef<'div'>>(null);

  if (import.meta.env.VITE_BYPASS_AUTH !== 'true') {
    return null; // Don't show in production
  }

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!panelRef.current) return;
    
    setIsDragging(true);
    const rect = panelRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: globalThis.MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
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
      
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
      
      return () => {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
      };
    }
  }, [isDragging, dragOffset.x, dragOffset.y]);

  return (
    <div 
      ref={panelRef}
      style={{
        position: 'fixed',
        bottom: 'auto',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '10px',
        fontSize: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        minWidth: '200px',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
    >
      <div style={{ 
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <strong>🎭 Mock User:</strong>
        <span style={{ 
          fontSize: '10px', 
          color: '#666',
          fontWeight: 'normal'
        }}>
          🖱️ Drag to move
        </span>
      </div>
      <div style={{ marginBottom: '8px' }}>
        <select 
          value={currentMockUser} 
          onChange={(e) => switchMockUser(e.target.value as keyof typeof mockUserConfigurations)}
          style={{ marginLeft: '8px', fontSize: '12px', width: '100px' }}
        >
          {availableUsers.map(user => (
            <option key={user} value={user}>
              {user}
            </option>
          ))}
        </select>
      </div>
      <div style={{ marginTop: '5px', fontSize: '10px', color: '#666', marginBottom: '8px' }}>
        Roles: {mockUserConfigurations[currentMockUser as keyof typeof mockUserConfigurations].roles.join(', ')}
      </div>
      <div style={{ borderTop: '1px solid #ddd', paddingTop: '8px' }}>
        <a 
          href="/auth-status" 
          style={{ 
            fontSize: '10px', 
            color: '#0066cc',
            textDecoration: 'none'
          }}
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/auth-status';
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

export default EnhancedMockKeycloakProvider;
