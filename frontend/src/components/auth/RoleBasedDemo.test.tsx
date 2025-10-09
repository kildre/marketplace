import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { RoleBasedDemo } from "./RoleBasedDemo";
import { AppRoles } from "../../types/auth";

// Mock the useAuth hook
const mockUseAuth = vi.fn();

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock import.meta.env
const mockImportMeta = {
  env: {
    DEV: true,
    VITE_BYPASS_AUTH: "true",
    VITE_MOCK_USER_ROLES: "requestor",
  },
};

// Mock the import.meta global
Object.defineProperty(globalThis, "import", {
  value: {
    meta: mockImportMeta,
  },
  writable: true,
});

describe("RoleBasedDemo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment to development by default
    mockImportMeta.env.DEV = true;
    mockImportMeta.env.VITE_BYPASS_AUTH = "true";
    mockImportMeta.env.VITE_MOCK_USER_ROLES = "requestor";
  });

  describe("Unauthenticated User", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        getUserInfo: () => null,
        getUserRoles: () => [],
        getKeycloakRoles: () => [],
        hasRole: () => false,
        isApprover: () => false,
        isRequestor: () => false,
        isAuthenticated: false,
      });
    });

    test("should show not authenticated message", () => {
      render(<RoleBasedDemo />);

      expect(screen.getByText("❌ Not Authenticated")).toBeInTheDocument();
      expect(
        screen.getByText("Please log in to continue.")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("🔐 Authentication Status")
      ).not.toBeInTheDocument();
    });

    test("should have proper styling for unauthenticated state", () => {
      mockUseAuth.mockReturnValue({
        getUserInfo: () => null,
        getUserRoles: () => [],
        getKeycloakRoles: () => [],
        hasRole: () => false,
        isApprover: () => false,
        isRequestor: () => false,
        isAuthenticated: false,
      });

      const { container } = render(<RoleBasedDemo />);

      const unauthenticatedDiv = container.querySelector(
        'div[style*="border: 1px solid rgb(255, 0, 0)"]'
      );
      expect(unauthenticatedDiv).toBeInTheDocument();
    });
  });

  describe("Authenticated User - Basic Information", () => {
    const mockUserInfo = {
      id: "test-user-123",
      username: "testuser",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        getUserInfo: () => mockUserInfo,
        getUserRoles: () => [],
        getKeycloakRoles: () => [],
        hasRole: () => false,
        isApprover: () => false,
        isRequestor: () => false,
        isAuthenticated: true,
      });
    });

    test("should display user information correctly", () => {
      render(<RoleBasedDemo />);

      expect(screen.getByText("🔐 Authentication Status")).toBeInTheDocument();
      expect(screen.getByText("User Information:")).toBeInTheDocument();

      // Check user info display
      expect(screen.getByText("test-user-123")).toBeInTheDocument();
      expect(screen.getByText("testuser")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    test("should display roles section", () => {
      render(<RoleBasedDemo />);

      expect(screen.getByText("Roles:")).toBeInTheDocument();
      expect(screen.getByText("App Roles:")).toBeInTheDocument();
      expect(screen.getByText("Keycloak Roles:")).toBeInTheDocument();
    });

    test("should show 'None' for empty roles", () => {
      render(<RoleBasedDemo />);

      // Should show "None" for both app roles and keycloak roles when arrays are empty
      const noneTexts = screen.getAllByText("None");
      expect(noneTexts).toHaveLength(2);
    });
  });

  describe("Role-Based UI Display", () => {
    const mockUserInfo = {
      id: "test-user-123",
      username: "testuser",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    };

    test("should show content for all authenticated users", () => {
      mockUseAuth.mockReturnValue({
        getUserInfo: () => mockUserInfo,
        getUserRoles: () => [],
        getKeycloakRoles: () => [],
        hasRole: () => false,
        isApprover: () => false,
        isRequestor: () => false,
        isAuthenticated: true,
      });

      render(<RoleBasedDemo />);

      expect(screen.getByText(/All Users:/)).toBeInTheDocument();
      expect(
        screen.getByText(/This content is visible to all authenticated users/)
      ).toBeInTheDocument();
    });

    test("should show approver-only content for approvers", () => {
      mockUseAuth.mockReturnValue({
        getUserInfo: () => mockUserInfo,
        getUserRoles: () => [AppRoles.APPROVER],
        getKeycloakRoles: () => ["marketplace-approver"],
        hasRole: (role: AppRoles) => role === AppRoles.APPROVER,
        isApprover: () => true,
        isRequestor: () => false,
        isAuthenticated: true,
      });

      render(<RoleBasedDemo />);

      expect(screen.getByText(/Approver Only:/)).toBeInTheDocument();
      expect(
        screen.getByText(/You can approve\/reject requests/)
      ).toBeInTheDocument();
    });

    test("should show requestor-only content for requestors", () => {
      mockUseAuth.mockReturnValue({
        getUserInfo: () => mockUserInfo,
        getUserRoles: () => [AppRoles.REQUESTOR],
        getKeycloakRoles: () => ["marketplace-requestor"],
        hasRole: (role: AppRoles) => role === AppRoles.REQUESTOR,
        isApprover: () => false,
        isRequestor: () => true,
        isAuthenticated: true,
      });

      render(<RoleBasedDemo />);

      expect(screen.getByText(/Requestor Only:/)).toBeInTheDocument();
      expect(
        screen.getByText(/You can browse products, add items to cart/)
      ).toBeInTheDocument();
    });

    test("should show dual role content for users with both roles", () => {
      mockUseAuth.mockReturnValue({
        getUserInfo: () => mockUserInfo,
        getUserRoles: () => [AppRoles.APPROVER, AppRoles.REQUESTOR],
        getKeycloakRoles: () => [
          "marketplace-approver",
          "marketplace-requestor",
        ],
        hasRole: (role: AppRoles) =>
          [AppRoles.APPROVER, AppRoles.REQUESTOR].includes(role),
        isApprover: () => true,
        isRequestor: () => true,
        isAuthenticated: true,
      });

      render(<RoleBasedDemo />);

      expect(screen.getByText(/Dual Role:/)).toBeInTheDocument();
      expect(
        screen.getByText(/You have both approver and requestor permissions/)
      ).toBeInTheDocument();
    });

    test("should show no recognized roles warning for users without marketplace roles", () => {
      mockUseAuth.mockReturnValue({
        getUserInfo: () => mockUserInfo,
        getUserRoles: () => [],
        getKeycloakRoles: () => ["some-other-role"],
        hasRole: () => false,
        isApprover: () => false,
        isRequestor: () => false,
        isAuthenticated: true,
      });

      render(<RoleBasedDemo />);

      expect(screen.getByText(/No Recognized Roles:/)).toBeInTheDocument();
      expect(
        screen.getByText(
          /You don't have marketplace-approver or marketplace-requestor roles/
        )
      ).toBeInTheDocument();
    });
  });

  describe("Role Display", () => {
    const mockUserInfo = {
      id: "test-user-123",
      username: "testuser",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    };

    test("should display app roles correctly", () => {
      mockUseAuth.mockReturnValue({
        getUserInfo: () => mockUserInfo,
        getUserRoles: () => [AppRoles.REQUESTOR, AppRoles.APPROVER],
        getKeycloakRoles: () => [],
        hasRole: () => false,
        isApprover: () => false,
        isRequestor: () => false,
        isAuthenticated: true,
      });

      render(<RoleBasedDemo />);

      expect(screen.getByText("REQUESTOR, APPROVER")).toBeInTheDocument();
    });

    test("should display keycloak roles correctly", () => {
      mockUseAuth.mockReturnValue({
        getUserInfo: () => mockUserInfo,
        getUserRoles: () => [],
        getKeycloakRoles: () => [
          "marketplace-requestor",
          "marketplace-approver",
          "admin",
        ],
        hasRole: () => false,
        isApprover: () => false,
        isRequestor: () => false,
        isAuthenticated: true,
      });

      render(<RoleBasedDemo />);

      expect(
        screen.getByText("marketplace-requestor, marketplace-approver, admin")
      ).toBeInTheDocument();
    });
  });

  describe("Development Debug Information", () => {
    const mockUserInfo = {
      id: "test-user-123",
      username: "testuser",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    };

    beforeEach(() => {
      // Ensure we're in development mode
      mockImportMeta.env.DEV = true;
      mockImportMeta.env.VITE_BYPASS_AUTH = "true";
      mockImportMeta.env.VITE_MOCK_USER_ROLES = "requestor";
    });

    test("should show debug information in development mode", () => {
      mockUseAuth.mockReturnValue({
        getUserInfo: () => mockUserInfo,
        getUserRoles: () => [AppRoles.REQUESTOR],
        getKeycloakRoles: () => ["marketplace-requestor"],
        hasRole: (role: AppRoles) => role === AppRoles.REQUESTOR,
        isApprover: () => false,
        isRequestor: () => true,
        isAuthenticated: true,
      });

      render(<RoleBasedDemo />);

      expect(
        screen.getByText("🔍 Debug Information (Dev Only)")
      ).toBeInTheDocument();
      expect(screen.getByText("Role Checks:")).toBeInTheDocument();
      expect(screen.getByText("Environment:")).toBeInTheDocument();
    });

    test("should show correct role check results in debug section", () => {
      mockUseAuth.mockReturnValue({
        getUserInfo: () => mockUserInfo,
        getUserRoles: () => [AppRoles.APPROVER],
        getKeycloakRoles: () => ["marketplace-approver"],
        hasRole: (role: AppRoles) => role === AppRoles.APPROVER,
        isApprover: () => true,
        isRequestor: () => false,
        isAuthenticated: true,
      });

      render(<RoleBasedDemo />);

      expect(screen.getByText("hasRole(APPROVER): ✅")).toBeInTheDocument();
      expect(screen.getByText("hasRole(REQUESTOR): ❌")).toBeInTheDocument();
      expect(screen.getByText("isApprover(): ✅")).toBeInTheDocument();
      expect(screen.getByText("isRequestor(): ❌")).toBeInTheDocument();
    });

    test("should show environment variables in debug section", () => {
      // Use Vitest's environment variable mocking
      vi.stubEnv("VITE_BYPASS_AUTH", "true");
      vi.stubEnv("VITE_MOCK_USER_ROLES", "marketplace-requestor");

      mockUseAuth.mockReturnValue({
        getUserInfo: () => mockUserInfo,
        getUserRoles: () => [],
        getKeycloakRoles: () => [],
        hasRole: () => false,
        isApprover: () => false,
        isRequestor: () => false,
        isAuthenticated: true,
      });

      render(<RoleBasedDemo />);

      expect(screen.getByText("VITE_BYPASS_AUTH: true")).toBeInTheDocument();
      expect(
        screen.getByText("VITE_MOCK_USER_ROLES: marketplace-requestor")
      ).toBeInTheDocument();

      // Clean up the environment variable mock
      vi.unstubAllEnvs();
    });

    test("should not show debug information in production mode", () => {
      // Mock import.meta.env for production
      vi.stubEnv("DEV", false);

      mockUseAuth.mockReturnValue({
        getUserInfo: () => mockUserInfo,
        getUserRoles: () => [AppRoles.REQUESTOR],
        getKeycloakRoles: () => ["marketplace-requestor"],
        hasRole: (role: AppRoles) => role === AppRoles.REQUESTOR,
        isApprover: () => false,
        isRequestor: () => true,
        isAuthenticated: true,
      });

      render(<RoleBasedDemo />);

      expect(screen.queryByText(/Debug Information/)).not.toBeInTheDocument();
      expect(screen.queryByText("Role Checks:")).not.toBeInTheDocument();
      expect(screen.queryByText("Environment:")).not.toBeInTheDocument();

      // Reset environment
      vi.unstubAllEnvs();
    });
  });

  describe("Component Structure and Styling", () => {
    const mockUserInfo = {
      id: "test-user-123",
      username: "testuser",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    };

    test("should have proper main container styling", () => {
      mockUseAuth.mockReturnValue({
        getUserInfo: () => mockUserInfo,
        getUserRoles: () => [],
        getKeycloakRoles: () => [],
        hasRole: () => false,
        isApprover: () => false,
        isRequestor: () => false,
        isAuthenticated: true,
      });

      const { container } = render(<RoleBasedDemo />);

      const mainDiv = container.querySelector(
        'div[style*="border: 1px solid rgb(204, 204, 204)"]'
      );
      expect(mainDiv).toBeInTheDocument();
    });

    test("should render all main sections", () => {
      mockUseAuth.mockReturnValue({
        getUserInfo: () => mockUserInfo,
        getUserRoles: () => [AppRoles.REQUESTOR],
        getKeycloakRoles: () => ["marketplace-requestor"],
        hasRole: (role: AppRoles) => role === AppRoles.REQUESTOR,
        isApprover: () => false,
        isRequestor: () => true,
        isAuthenticated: true,
      });

      render(<RoleBasedDemo />);

      expect(screen.getByText("User Information:")).toBeInTheDocument();
      expect(screen.getByText("Roles:")).toBeInTheDocument();
      expect(screen.getByText("Role-Based UI Examples:")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    test("should handle null user info gracefully", () => {
      mockUseAuth.mockReturnValue({
        getUserInfo: () => null,
        getUserRoles: () => [],
        getKeycloakRoles: () => [],
        hasRole: () => false,
        isApprover: () => false,
        isRequestor: () => false,
        isAuthenticated: true,
      });

      render(<RoleBasedDemo />);

      // Should not crash and should still show the authenticated sections
      expect(screen.getByText("🔐 Authentication Status")).toBeInTheDocument();
      expect(screen.getByText("User Information:")).toBeInTheDocument();
    });

    test("should handle empty user info fields", () => {
      mockUseAuth.mockReturnValue({
        getUserInfo: () => ({
          id: "",
          username: "",
          email: "",
          firstName: "",
          lastName: "",
        }),
        getUserRoles: () => [],
        getKeycloakRoles: () => [],
        hasRole: () => false,
        isApprover: () => false,
        isRequestor: () => false,
        isAuthenticated: true,
      });

      render(<RoleBasedDemo />);

      // Should render without crashing
      expect(screen.getByText("🔐 Authentication Status")).toBeInTheDocument();
    });

    test("should handle partial user info", () => {
      mockUseAuth.mockReturnValue({
        getUserInfo: () => ({
          id: "123",
          username: "testuser",
          email: undefined,
          firstName: "Test",
          lastName: undefined,
        }),
        getUserRoles: () => [],
        getKeycloakRoles: () => [],
        hasRole: () => false,
        isApprover: () => false,
        isRequestor: () => false,
        isAuthenticated: true,
      });

      render(<RoleBasedDemo />);

      expect(screen.getByText("123")).toBeInTheDocument();
      expect(screen.getByText("testuser")).toBeInTheDocument();
      expect(screen.getByText("Test")).toBeInTheDocument();
    });
  });
});
