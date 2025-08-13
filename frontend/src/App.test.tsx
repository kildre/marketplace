import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import App from "./App";
import { AppRoles } from "./types/auth";
import { CartProvider } from "./contexts/CartContext";

// Mock the useAuth hook
const mockUseAuth = vi.fn();
vi.mock("./hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock the child components to focus on App structure
vi.mock("./components/government-banner/government-banner", () => ({
  GovernmentBanner: () => (
    <div data-testid="government-banner">Government Banner</div>
  ),
}));

vi.mock("./components/sidebar/sidebar", () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock("./components/footer/footer-component", () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

vi.mock("./pages/product-catalog/product-catalog", () => ({
  ProductCatalog: () => (
    <div data-testid="product-catalog">Product Catalog</div>
  ),
}));

vi.mock("./pages/cart/cart", () => ({
  Cart: () => <div data-testid="cart">Cart</div>,
}));

vi.mock("./pages/requests/requests", () => ({
  Requests: () => <div data-testid="requests">Requests</div>
}));

vi.mock("./pages/request-detail/request-detail", () => ({
  RequestDetail: () => <div data-testid="request-detail">Request Detail</div>,
}));

vi.mock("./components/debug/RoleDebugInfo", () => ({
  RoleDebugInfo: () => <div data-testid="role-debug-info">Role Debug Info</div>,
}));

vi.mock("./pages/auth-status/auth-status", () => ({
  AuthStatusPage: () => <div data-testid="auth-status">Auth Status</div>,
}));

// Mock the authentication providers
vi.mock("./contexts/EnhancedMockKeycloakProvider", () => ({
  EnhancedMockKeycloakProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div data-testid="mock-keycloak-provider">{children}</div>,
  MockUserSwitcher: () => (
    <div data-testid="mock-user-switcher">Mock User Switcher</div>
  ),
}));

// Mock the Keycloak service
vi.mock("./services/keycloakService", () => ({
  KeycloakService: {
    getInstance: vi.fn(() => ({
      getKeycloak: vi.fn(() => ({
        authenticated: true,
        token: "mock-token",
        tokenParsed: { preferred_username: "testuser" },
      })),
    })),
  },
}));

// Mock the AdvanaMenu component from @advana/platform-ui
vi.mock("@advana/platform-ui/dist/AdvanaMenu", () => ({
  default: ({ menuLogoSection }: { menuLogoSection: React.ReactNode }) => (
    <div data-testid="advana-menu" style={{ height: '180px' }}>
      <div data-testid="menu-logo-section">{menuLogoSection}</div>
    </div>
  ),
}));

// Mock CustomMenuLogoSection component
vi.mock("./components/CustomMenuLogoSection", () => ({
  default: () => (
    <div data-testid="custom-menu-logo-section">Custom Menu Logo Section</div>
  ),
}));

// Mock CartOverlayButton component
vi.mock("./components/CartOverlayButton", () => ({
  default: () => <div data-testid="cart-overlay-btn">Cart Overlay</div>,
}));

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("App", () => {
  const renderAppWithRouter = (
    initialRoute = "/",
    userRole = AppRoles.REQUESTOR
  ) => {
    // Mock the useAuth hook with the specified role
    mockUseAuth.mockReturnValue({
      userInfo: {
        id: "test-user-123",
        username: "testuser",
        email: "test@advana.mil",
        firstName: "Test",
        lastName: "User",
        roles: [userRole],
        permissions: ["READ", "WRITE"],
      },
      keycloak: {},
      isAuthenticated: true,
      isRequestor: () => userRole === AppRoles.REQUESTOR,
      isApprover: () => userRole === AppRoles.APPROVER,
      hasRole: (role: AppRoles) => userRole === role,
      hasPermission: () => true,
      logout: vi.fn(),
      login: vi.fn(),
    });

    window.history.pushState({}, "Test page", initialRoute);
    return render(
      <BrowserRouter>
        <CartProvider>
          <App />
        </CartProvider>
      </BrowserRouter>
    );
  };

  test("should render successfully", () => {
    const { container } = renderAppWithRouter("/", AppRoles.REQUESTOR);

    expect(container.querySelector(".app-wrapper")).toBeInTheDocument();
    expect(container.querySelector("main.main-content")).toBeInTheDocument();
  });

  test("should render all main layout components", () => {
    renderAppWithRouter("/", AppRoles.REQUESTOR);

    expect(screen.getByTestId("government-banner")).toBeInTheDocument();
    expect(screen.getByTestId("advana-menu")).toBeInTheDocument();
    expect(screen.getByTestId("custom-menu-logo-section")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    // RoleDebugInfo is not rendered in the current App implementation
  });

  test("should render AdvanaMenu with Service Desk styling", () => {
    const { container } = renderAppWithRouter("/", AppRoles.REQUESTOR);
    
    const advanaMenuContainer = container.querySelector(".advana-menu-override.advana-service-desk-style");
    expect(advanaMenuContainer).toBeInTheDocument();
    
    expect(screen.getByTestId("advana-menu")).toBeInTheDocument();
    expect(screen.getByTestId("menu-logo-section")).toBeInTheDocument();
  });

  test("should have correct DOM structure", () => {
    const { container } = renderAppWithRouter("/", AppRoles.REQUESTOR);

    const appWrapper = container.querySelector(".app-wrapper");
    const mainContent = container.querySelector("main.main-content");

    expect(appWrapper).toBeInTheDocument();
    expect(mainContent).toBeInTheDocument();
    expect(mainContent?.parentElement).toBe(appWrapper);
  });

  test("should render ProductCatalog component on root route for REQUESTOR role", () => {
    renderAppWithRouter("/", AppRoles.REQUESTOR);

    expect(screen.getByTestId("product-catalog")).toBeInTheDocument();
    expect(screen.queryByTestId("cart")).not.toBeInTheDocument();
    expect(screen.queryByTestId("requests")).not.toBeInTheDocument();
    expect(screen.queryByTestId("request-detail")).not.toBeInTheDocument();
  });

  test("should render Requests component on root route for APPROVER role", () => {
    renderAppWithRouter("/", AppRoles.APPROVER);

    expect(screen.getByTestId("requests")).toBeInTheDocument();
    expect(screen.queryByTestId("product-catalog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cart")).not.toBeInTheDocument();
    expect(screen.queryByTestId("request-detail")).not.toBeInTheDocument();
  });

  test("should render Cart component on /cart route", () => {
    renderAppWithRouter("/cart", AppRoles.REQUESTOR);

    expect(screen.getByTestId("cart")).toBeInTheDocument();
    expect(screen.queryByTestId("product-catalog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("requests")).not.toBeInTheDocument();
    expect(screen.queryByTestId("request-detail")).not.toBeInTheDocument();
  });

  test("should render Requests component on /requests route", () => {
    renderAppWithRouter("/requests", AppRoles.REQUESTOR);

    expect(screen.getByTestId("requests")).toBeInTheDocument();
    expect(screen.queryByTestId("product-catalog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cart")).not.toBeInTheDocument();
    expect(screen.queryByTestId("request-detail")).not.toBeInTheDocument();
  });

  test("should render RequestDetail component on /request-detail route", () => {
    renderAppWithRouter("/request-detail", AppRoles.REQUESTOR);

    expect(screen.getByTestId("request-detail")).toBeInTheDocument();
    expect(screen.queryByTestId("product-catalog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cart")).not.toBeInTheDocument();
    expect(screen.queryByTestId("requests")).not.toBeInTheDocument();
  });

  test("should have proper semantic HTML structure", () => {
    const { container } = renderAppWithRouter("/", AppRoles.REQUESTOR);

    const main = container.querySelector("main");
    expect(main).toHaveClass("main-content");
    expect(main?.tagName).toBe("MAIN");
  });

  test("should maintain layout components across all routes", () => {
    const routes = ["/", "/cart", "/requests", "/request-detail"];

    routes.forEach((route) => {
      const { container } = renderAppWithRouter(route, AppRoles.REQUESTOR);

      expect(
        container.querySelector('[data-testid="government-banner"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('[data-testid="advana-menu"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('[data-testid="sidebar"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('[data-testid="footer"]')
      ).toBeInTheDocument();
    });
  });

  test("should render component snapshot consistently", () => {
    const { container } = renderAppWithRouter("/", AppRoles.REQUESTOR);

    expect(container.innerHTML).toContain('class="app-wrapper"');
    expect(container.innerHTML).toContain('class="main-content"');
    expect(container.innerHTML).toContain("<main");
  });

  test("should have correct CSS classes", () => {
    const { container } = renderAppWithRouter("/", AppRoles.REQUESTOR);

    const appWrapper = container.querySelector(".app-wrapper");
    const mainContent = container.querySelector(".main-content");

    expect(appWrapper).toHaveClass("app-wrapper");
    expect(mainContent).toHaveClass("main-content");
  });

  test("should have no accessibility violations", async () => {
    const { container } = renderAppWithRouter("/", AppRoles.REQUESTOR);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("should meet WCAG accessibility standards", async () => {
    const { container } = renderAppWithRouter("/", AppRoles.REQUESTOR);

    // Test semantic structure
    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();

    // Run comprehensive accessibility tests
    const results = await axe(container, {
      rules: {
        "landmark-unique": { enabled: true },
        "page-has-heading-one": { enabled: false }, // We're testing the overall structure
      },
    });
    expect(results).toHaveNoViolations();
  });

  test("should render routes correctly with different URL paths for REQUESTOR role", () => {
    // Test home route
    const { unmount: unmount1 } = renderAppWithRouter("/", AppRoles.REQUESTOR);
    expect(screen.getByTestId("product-catalog")).toBeInTheDocument();
    unmount1();

    // Test cart route
    const { unmount: unmount2 } = renderAppWithRouter(
      "/cart",
      AppRoles.REQUESTOR
    );
    expect(screen.getByTestId("cart")).toBeInTheDocument();
    unmount2();

    // Test requests route
    const { unmount: unmount3 } = renderAppWithRouter(
      "/requests",
      AppRoles.REQUESTOR
    );
    expect(screen.getByTestId("requests")).toBeInTheDocument();
    unmount3();

    // Test request-detail route
    const { unmount: unmount4 } = renderAppWithRouter(
      "/request-detail",
      AppRoles.REQUESTOR
    );
    expect(screen.getByTestId("request-detail")).toBeInTheDocument();
    unmount4();
  });

  test("should render routes correctly with different URL paths for APPROVER role", () => {
    // Test home route (should show requests for APPROVER)
    const { unmount: unmount1 } = renderAppWithRouter("/", AppRoles.APPROVER);
    expect(screen.getByTestId("requests")).toBeInTheDocument();
    unmount1();

    // Test cart route (should redirect to requests for APPROVER)
    const { unmount: unmount2 } = renderAppWithRouter(
      "/cart",
      AppRoles.APPROVER
    );
    expect(screen.getByTestId("requests")).toBeInTheDocument();
    unmount2();

    // Test requests route
    const { unmount: unmount3 } = renderAppWithRouter(
      "/requests",
      AppRoles.APPROVER
    );
    expect(screen.getByTestId("requests")).toBeInTheDocument();
    unmount3();

    // Test request-detail route
    const { unmount: unmount4 } = renderAppWithRouter(
      "/request-detail",
      AppRoles.APPROVER
    );
    expect(screen.getByTestId("request-detail")).toBeInTheDocument();
    unmount4();
  });

  test("should render ProductCatalog as fallback for users with no specific role", () => {
    // Mock user with no specific role (empty roles array)
    mockUseAuth.mockReturnValue({
      userInfo: {
        id: "test-user-123",
        username: "testuser",
        email: "test@advana.mil",
        firstName: "Test",
        lastName: "User",
        roles: [],
        permissions: [],
      },
      keycloak: {},
      isAuthenticated: true,
      isRequestor: () => false,
      isApprover: () => false,
      hasRole: () => false, // No roles
      hasPermission: () => false,
      logout: vi.fn(),
      login: vi.fn(),
    });

    window.history.pushState({}, "Test page", "/");
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByTestId("product-catalog")).toBeInTheDocument();
    expect(screen.queryByTestId("requests")).not.toBeInTheDocument();
  });

  test("should render requests route with userId parameter", () => {
    renderAppWithRouter("/requests/user123", AppRoles.APPROVER);

    expect(screen.getByTestId("requests")).toBeInTheDocument();
    expect(screen.queryByTestId("product-catalog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cart")).not.toBeInTheDocument();
    expect(screen.queryByTestId("request-detail")).not.toBeInTheDocument();
  });

  test("should render auth status page in development mode", () => {
    // Mock development environment using vi.stubEnv for DEV
    vi.stubEnv("DEV", true);

    renderAppWithRouter("/auth-status", AppRoles.REQUESTOR);

    expect(screen.getByTestId("auth-status")).toBeInTheDocument();
    expect(screen.queryByTestId("product-catalog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cart")).not.toBeInTheDocument();
    expect(screen.queryByTestId("requests")).not.toBeInTheDocument();
    expect(screen.queryByTestId("request-detail")).not.toBeInTheDocument();

    // Restore environment
    vi.unstubAllEnvs();
  });

  test("should not render auth status route in production mode", () => {
    // Mock production environment using vi.stubEnv for DEV
    vi.stubEnv("DEV", false);

    renderAppWithRouter("/auth-status", AppRoles.REQUESTOR);

    expect(screen.queryByTestId("auth-status")).not.toBeInTheDocument();

    // Should not find any route match, so no page component should render
    expect(screen.queryByTestId("product-catalog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cart")).not.toBeInTheDocument();
    expect(screen.queryByTestId("requests")).not.toBeInTheDocument();
    expect(screen.queryByTestId("request-detail")).not.toBeInTheDocument();

    // Restore environment
    vi.unstubAllEnvs();
  });

  test("should not render role debug info component when disabled", () => {
    renderAppWithRouter("/", AppRoles.REQUESTOR);

    expect(screen.queryByTestId("role-debug-info")).not.toBeInTheDocument();
  });
});
