import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import {
  RoleGuard,
  PermissionGuard,
  RequestorOnly,
  ApproverOnly,
} from "./RoleGuard";
import { AppRoles, Resources, Actions } from "../../types/auth";

// Mock the useAuth hook
const mockUseAuth = vi.fn();

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("RoleGuard", () => {
  const TestComponent = () => (
    <div data-testid="protected-content">Protected Content</div>
  );
  const FallbackComponent = () => (
    <div data-testid="fallback-content">Access Denied</div>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication Requirements", () => {
    it("should render fallback when user is not authenticated", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        hasAnyRole: vi.fn(),
        hasAllRoles: vi.fn(),
      });

      render(
        <RoleGuard
          roles={[AppRoles.REQUESTOR]}
          fallback={<FallbackComponent />}
        >
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByTestId("fallback-content")).toBeInTheDocument();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("should render null fallback when user is not authenticated and no fallback provided", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        hasAnyRole: vi.fn(),
        hasAllRoles: vi.fn(),
      });

      const { container } = render(
        <RoleGuard roles={[AppRoles.REQUESTOR]}>
          <TestComponent />
        </RoleGuard>
      );

      expect(container.firstChild).toBeNull();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });
  });

  describe("Role-Based Access Control", () => {
    it("should render children when no roles are specified", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasAnyRole: vi.fn(),
        hasAllRoles: vi.fn(),
      });

      render(
        <RoleGuard>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    it("should render children when user has any required role (requireAll=false)", () => {
      const mockHasAnyRole = vi.fn().mockReturnValue(true);
      const mockHasAllRoles = vi.fn().mockReturnValue(false);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasAnyRole: mockHasAnyRole,
        hasAllRoles: mockHasAllRoles,
      });

      render(
        <RoleGuard
          roles={[AppRoles.REQUESTOR, AppRoles.APPROVER]}
          requireAll={false}
        >
          <TestComponent />
        </RoleGuard>
      );

      expect(mockHasAnyRole).toHaveBeenCalledWith([
        AppRoles.REQUESTOR,
        AppRoles.APPROVER,
      ]);
      expect(mockHasAllRoles).not.toHaveBeenCalled();
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    it("should render children when user has all required roles (requireAll=true)", () => {
      const mockHasAnyRole = vi.fn().mockReturnValue(false);
      const mockHasAllRoles = vi.fn().mockReturnValue(true);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasAnyRole: mockHasAnyRole,
        hasAllRoles: mockHasAllRoles,
      });

      render(
        <RoleGuard
          roles={[AppRoles.REQUESTOR, AppRoles.APPROVER]}
          requireAll={true}
        >
          <TestComponent />
        </RoleGuard>
      );

      expect(mockHasAllRoles).toHaveBeenCalledWith([
        AppRoles.REQUESTOR,
        AppRoles.APPROVER,
      ]);
      expect(mockHasAnyRole).not.toHaveBeenCalled();
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    it("should render fallback when user does not have any required role", () => {
      const mockHasAnyRole = vi.fn().mockReturnValue(false);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasAnyRole: mockHasAnyRole,
        hasAllRoles: vi.fn(),
      });

      render(
        <RoleGuard roles={[AppRoles.APPROVER]} fallback={<FallbackComponent />}>
          <TestComponent />
        </RoleGuard>
      );

      expect(mockHasAnyRole).toHaveBeenCalledWith([AppRoles.APPROVER]);
      expect(screen.getByTestId("fallback-content")).toBeInTheDocument();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("should render fallback when user does not have all required roles", () => {
      const mockHasAllRoles = vi.fn().mockReturnValue(false);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasAnyRole: vi.fn(),
        hasAllRoles: mockHasAllRoles,
      });

      render(
        <RoleGuard
          roles={[AppRoles.REQUESTOR, AppRoles.APPROVER]}
          requireAll={true}
          fallback={<FallbackComponent />}
        >
          <TestComponent />
        </RoleGuard>
      );

      expect(mockHasAllRoles).toHaveBeenCalledWith([
        AppRoles.REQUESTOR,
        AppRoles.APPROVER,
      ]);
      expect(screen.getByTestId("fallback-content")).toBeInTheDocument();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });
  });

  describe("Single Role Access", () => {
    it("should render children when user has the single required role", () => {
      const mockHasAnyRole = vi.fn().mockReturnValue(true);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasAnyRole: mockHasAnyRole,
        hasAllRoles: vi.fn(),
      });

      render(
        <RoleGuard roles={[AppRoles.REQUESTOR]}>
          <TestComponent />
        </RoleGuard>
      );

      expect(mockHasAnyRole).toHaveBeenCalledWith([AppRoles.REQUESTOR]);
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    it("should render fallback when user does not have the single required role", () => {
      const mockHasAnyRole = vi.fn().mockReturnValue(false);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasAnyRole: mockHasAnyRole,
        hasAllRoles: vi.fn(),
      });

      render(
        <RoleGuard roles={[AppRoles.APPROVER]} fallback={<FallbackComponent />}>
          <TestComponent />
        </RoleGuard>
      );

      expect(mockHasAnyRole).toHaveBeenCalledWith([AppRoles.APPROVER]);
      expect(screen.getByTestId("fallback-content")).toBeInTheDocument();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });
  });

  describe("Default Props", () => {
    it("should use default requireAll=false", () => {
      const mockHasAnyRole = vi.fn().mockReturnValue(true);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasAnyRole: mockHasAnyRole,
        hasAllRoles: vi.fn(),
      });

      render(
        <RoleGuard roles={[AppRoles.REQUESTOR]}>
          <TestComponent />
        </RoleGuard>
      );

      expect(mockHasAnyRole).toHaveBeenCalledWith([AppRoles.REQUESTOR]);
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    it("should use default empty roles array", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasAnyRole: vi.fn(),
        hasAllRoles: vi.fn(),
      });

      render(
        <RoleGuard>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    it("should use default null fallback", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        hasAnyRole: vi.fn(),
        hasAllRoles: vi.fn(),
      });

      const { container } = render(
        <RoleGuard roles={[AppRoles.REQUESTOR]}>
          <TestComponent />
        </RoleGuard>
      );

      expect(container.firstChild).toBeNull();
    });
  });
});

describe("PermissionGuard", () => {
  const TestComponent = () => (
    <div data-testid="protected-content">Protected Content</div>
  );
  const FallbackComponent = () => (
    <div data-testid="fallback-content">Access Denied</div>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication Requirements", () => {
    it("should render fallback when user is not authenticated", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        hasPermission: vi.fn(),
      });

      render(
        <PermissionGuard
          resource={Resources.REQUESTS}
          action={Actions.CREATE}
          fallback={<FallbackComponent />}
        >
          <TestComponent />
        </PermissionGuard>
      );

      expect(screen.getByTestId("fallback-content")).toBeInTheDocument();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("should render null fallback when user is not authenticated and no fallback provided", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        hasPermission: vi.fn(),
      });

      const { container } = render(
        <PermissionGuard resource={Resources.REQUESTS} action={Actions.CREATE}>
          <TestComponent />
        </PermissionGuard>
      );

      expect(container.firstChild).toBeNull();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });
  });

  describe("Permission-Based Access Control", () => {
    it("should render children when user has required permission", () => {
      const mockHasPermission = vi.fn().mockReturnValue(true);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasPermission: mockHasPermission,
      });

      render(
        <PermissionGuard resource={Resources.REQUESTS} action={Actions.CREATE}>
          <TestComponent />
        </PermissionGuard>
      );

      expect(mockHasPermission).toHaveBeenCalledWith(
        Resources.REQUESTS,
        Actions.CREATE
      );
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    it("should render fallback when user does not have required permission", () => {
      const mockHasPermission = vi.fn().mockReturnValue(false);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasPermission: mockHasPermission,
      });

      render(
        <PermissionGuard
          resource={Resources.APPROVALS}
          action={Actions.APPROVE}
          fallback={<FallbackComponent />}
        >
          <TestComponent />
        </PermissionGuard>
      );

      expect(mockHasPermission).toHaveBeenCalledWith(
        Resources.APPROVALS,
        Actions.APPROVE
      );
      expect(screen.getByTestId("fallback-content")).toBeInTheDocument();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });
  });

  describe("Different Permission Scenarios", () => {
    it("should handle PRODUCTS READ permission", () => {
      const mockHasPermission = vi.fn().mockReturnValue(true);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasPermission: mockHasPermission,
      });

      render(
        <PermissionGuard resource={Resources.PRODUCTS} action={Actions.READ}>
          <TestComponent />
        </PermissionGuard>
      );

      expect(mockHasPermission).toHaveBeenCalledWith(
        Resources.PRODUCTS,
        Actions.READ
      );
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    it("should handle REQUESTS UPDATE permission", () => {
      const mockHasPermission = vi.fn().mockReturnValue(false);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasPermission: mockHasPermission,
      });

      render(
        <PermissionGuard
          resource={Resources.REQUESTS}
          action={Actions.UPDATE}
          fallback={<FallbackComponent />}
        >
          <TestComponent />
        </PermissionGuard>
      );

      expect(mockHasPermission).toHaveBeenCalledWith(
        Resources.REQUESTS,
        Actions.UPDATE
      );
      expect(screen.getByTestId("fallback-content")).toBeInTheDocument();
    });

    it("should handle REQUESTS DELETE permission", () => {
      const mockHasPermission = vi.fn().mockReturnValue(true);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasPermission: mockHasPermission,
      });

      render(
        <PermissionGuard resource={Resources.REQUESTS} action={Actions.DELETE}>
          <TestComponent />
        </PermissionGuard>
      );

      expect(mockHasPermission).toHaveBeenCalledWith(
        Resources.REQUESTS,
        Actions.DELETE
      );
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });
  });

  describe("Default Props", () => {
    it("should use default null fallback", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        hasPermission: vi.fn(),
      });

      const { container } = render(
        <PermissionGuard resource={Resources.REQUESTS} action={Actions.CREATE}>
          <TestComponent />
        </PermissionGuard>
      );

      expect(container.firstChild).toBeNull();
    });
  });
});

describe("RequestorOnly", () => {
  const TestComponent = () => (
    <div data-testid="protected-content">Protected Content</div>
  );
  const FallbackComponent = () => (
    <div data-testid="fallback-content">Access Denied</div>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Requestor Access Control", () => {
    it("should render children when user has REQUESTOR role", () => {
      const mockHasAnyRole = vi.fn().mockReturnValue(true);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasAnyRole: mockHasAnyRole,
        hasAllRoles: vi.fn(),
      });

      render(
        <RequestorOnly>
          <TestComponent />
        </RequestorOnly>
      );

      expect(mockHasAnyRole).toHaveBeenCalledWith([AppRoles.REQUESTOR]);
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    it("should render fallback when user does not have REQUESTOR role", () => {
      const mockHasAnyRole = vi.fn().mockReturnValue(false);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasAnyRole: mockHasAnyRole,
        hasAllRoles: vi.fn(),
      });

      render(
        <RequestorOnly fallback={<FallbackComponent />}>
          <TestComponent />
        </RequestorOnly>
      );

      expect(mockHasAnyRole).toHaveBeenCalledWith([AppRoles.REQUESTOR]);
      expect(screen.getByTestId("fallback-content")).toBeInTheDocument();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("should render null fallback when user does not have REQUESTOR role and no fallback provided", () => {
      const mockHasAnyRole = vi.fn().mockReturnValue(false);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasAnyRole: mockHasAnyRole,
        hasAllRoles: vi.fn(),
      });

      const { container } = render(
        <RequestorOnly>
          <TestComponent />
        </RequestorOnly>
      );

      expect(mockHasAnyRole).toHaveBeenCalledWith([AppRoles.REQUESTOR]);
      expect(container.firstChild).toBeNull();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("should not render when user is not authenticated", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        hasAnyRole: vi.fn(),
        hasAllRoles: vi.fn(),
      });

      const { container } = render(
        <RequestorOnly>
          <TestComponent />
        </RequestorOnly>
      );

      expect(container.firstChild).toBeNull();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });
  });

  describe("Custom Fallback", () => {
    it("should render custom fallback component", () => {
      const mockHasAnyRole = vi.fn().mockReturnValue(false);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasAnyRole: mockHasAnyRole,
        hasAllRoles: vi.fn(),
      });

      const CustomFallback = () => (
        <div data-testid="custom-fallback">Please become a requestor</div>
      );

      render(
        <RequestorOnly fallback={<CustomFallback />}>
          <TestComponent />
        </RequestorOnly>
      );

      expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
      expect(screen.getByText("Please become a requestor")).toBeInTheDocument();
    });
  });
});

describe("ApproverOnly", () => {
  const TestComponent = () => (
    <div data-testid="protected-content">Protected Content</div>
  );
  const FallbackComponent = () => (
    <div data-testid="fallback-content">Access Denied</div>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Approver Access Control", () => {
    it("should render children when user has APPROVER role", () => {
      const mockHasAnyRole = vi.fn().mockReturnValue(true);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasAnyRole: mockHasAnyRole,
        hasAllRoles: vi.fn(),
      });

      render(
        <ApproverOnly>
          <TestComponent />
        </ApproverOnly>
      );

      expect(mockHasAnyRole).toHaveBeenCalledWith([AppRoles.APPROVER]);
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    it("should render fallback when user does not have APPROVER role", () => {
      const mockHasAnyRole = vi.fn().mockReturnValue(false);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasAnyRole: mockHasAnyRole,
        hasAllRoles: vi.fn(),
      });

      render(
        <ApproverOnly fallback={<FallbackComponent />}>
          <TestComponent />
        </ApproverOnly>
      );

      expect(mockHasAnyRole).toHaveBeenCalledWith([AppRoles.APPROVER]);
      expect(screen.getByTestId("fallback-content")).toBeInTheDocument();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("should render null fallback when user does not have APPROVER role and no fallback provided", () => {
      const mockHasAnyRole = vi.fn().mockReturnValue(false);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasAnyRole: mockHasAnyRole,
        hasAllRoles: vi.fn(),
      });

      const { container } = render(
        <ApproverOnly>
          <TestComponent />
        </ApproverOnly>
      );

      expect(mockHasAnyRole).toHaveBeenCalledWith([AppRoles.APPROVER]);
      expect(container.firstChild).toBeNull();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("should not render when user is not authenticated", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        hasAnyRole: vi.fn(),
        hasAllRoles: vi.fn(),
      });

      const { container } = render(
        <ApproverOnly>
          <TestComponent />
        </ApproverOnly>
      );

      expect(container.firstChild).toBeNull();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });
  });

  describe("Custom Fallback", () => {
    it("should render custom fallback component", () => {
      const mockHasAnyRole = vi.fn().mockReturnValue(false);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasAnyRole: mockHasAnyRole,
        hasAllRoles: vi.fn(),
      });

      const CustomFallback = () => (
        <div data-testid="custom-fallback">
          Please contact admin for approver access
        </div>
      );

      render(
        <ApproverOnly fallback={<CustomFallback />}>
          <TestComponent />
        </ApproverOnly>
      );

      expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
      expect(
        screen.getByText("Please contact admin for approver access")
      ).toBeInTheDocument();
    });
  });
});

describe("Integration Tests", () => {
  const TestComponent = () => (
    <div data-testid="protected-content">Protected Content</div>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Nested Guards", () => {
    it("should work with nested RoleGuard and PermissionGuard", () => {
      const mockHasAnyRole = vi.fn().mockReturnValue(true);
      const mockHasPermission = vi.fn().mockReturnValue(true);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasAnyRole: mockHasAnyRole,
        hasAllRoles: vi.fn(),
        hasPermission: mockHasPermission,
      });

      render(
        <RoleGuard roles={[AppRoles.APPROVER]}>
          <PermissionGuard
            resource={Resources.APPROVALS}
            action={Actions.APPROVE}
          >
            <TestComponent />
          </PermissionGuard>
        </RoleGuard>
      );

      expect(mockHasAnyRole).toHaveBeenCalledWith([AppRoles.APPROVER]);
      expect(mockHasPermission).toHaveBeenCalledWith(
        Resources.APPROVALS,
        Actions.APPROVE
      );
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    it("should fail at first guard when role is missing", () => {
      const mockHasAnyRole = vi.fn().mockReturnValue(false);
      const mockHasPermission = vi.fn().mockReturnValue(true);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasAnyRole: mockHasAnyRole,
        hasAllRoles: vi.fn(),
        hasPermission: mockHasPermission,
      });

      const { container } = render(
        <RoleGuard roles={[AppRoles.APPROVER]}>
          <PermissionGuard
            resource={Resources.APPROVALS}
            action={Actions.APPROVE}
          >
            <TestComponent />
          </PermissionGuard>
        </RoleGuard>
      );

      expect(mockHasAnyRole).toHaveBeenCalledWith([AppRoles.APPROVER]);
      expect(mockHasPermission).not.toHaveBeenCalled();
      expect(container.firstChild).toBeNull();
    });

    it("should fail at second guard when permission is missing", () => {
      const mockHasAnyRole = vi.fn().mockReturnValue(true);
      const mockHasPermission = vi.fn().mockReturnValue(false);

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasAnyRole: mockHasAnyRole,
        hasAllRoles: vi.fn(),
        hasPermission: mockHasPermission,
      });

      const { container } = render(
        <RoleGuard roles={[AppRoles.APPROVER]}>
          <PermissionGuard
            resource={Resources.APPROVALS}
            action={Actions.APPROVE}
          >
            <TestComponent />
          </PermissionGuard>
        </RoleGuard>
      );

      expect(mockHasAnyRole).toHaveBeenCalledWith([AppRoles.APPROVER]);
      expect(mockHasPermission).toHaveBeenCalledWith(
        Resources.APPROVALS,
        Actions.APPROVE
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Combined Role Guards", () => {
    it("should work with RequestorOnly and ApproverOnly in parallel", () => {
      const mockHasAnyRole = vi
        .fn()
        .mockReturnValueOnce(true) // For RequestorOnly
        .mockReturnValueOnce(false); // For ApproverOnly

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        hasAnyRole: mockHasAnyRole,
        hasAllRoles: vi.fn(),
      });

      render(
        <div>
          <RequestorOnly>
            <div data-testid="requestor-content">Requestor Content</div>
          </RequestorOnly>
          <ApproverOnly>
            <div data-testid="approver-content">Approver Content</div>
          </ApproverOnly>
        </div>
      );

      expect(screen.getByTestId("requestor-content")).toBeInTheDocument();
      expect(screen.queryByTestId("approver-content")).not.toBeInTheDocument();
    });
  });
});
