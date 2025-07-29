import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { Header } from "./header-component";
import { CartProvider } from "../../contexts/CartContext";
import { vi } from "vitest";
import { AppRoles } from "@/types/auth";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock the useAuth hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(await import("@/hooks/useAuth")).useAuth;

describe("Header", () => {
  const renderHeader = () => {
    return render(
      <MemoryRouter>
        <CartProvider>
          <Header />
        </CartProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Common Header Elements", () => {
    beforeEach(() => {
      // Mock auth for any role - cart visibility is tested separately
      mockUseAuth.mockReturnValue({
        hasRole: vi.fn().mockReturnValue(false),
        hasAnyRole: vi.fn().mockReturnValue(false),
        hasAllRoles: vi.fn().mockReturnValue(false),
        isRequestor: vi.fn().mockReturnValue(false),
        isApprover: vi.fn().mockReturnValue(false),
        hasPermission: vi.fn().mockReturnValue(false),
        canApproveRequests: vi.fn().mockReturnValue(false),
        canCreateRequests: vi.fn().mockReturnValue(false),
        getUserInfo: vi.fn().mockReturnValue(null),
        getUserRoles: vi.fn().mockReturnValue([]),
        isAuthenticated: true,
        keycloak: {} as any,
      });
    });

    test("should render successfully", () => {
      const { container } = renderHeader();
      const header = container.querySelector(".header");

      expect(header).toBeInTheDocument();
    });

    test("should render header logo with correct attributes", () => {
      renderHeader();

      const logo = screen.getByAltText("Logo");
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute("src", "/assets/logos/LOGOS.png");
      expect(logo).toHaveClass("header__logo");
    });

    test("should wrap logo in a link to home page", () => {
      renderHeader();

      const logoLink = screen.getByLabelText("Go to home page");
      const logo = screen.getByAltText("Logo");

      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute("href", "/");
      expect(logoLink).toContainElement(logo);
    });

    test("should render header with correct CSS class", () => {
      const { container } = renderHeader();

      const header = container.querySelector(".header");
      const logo = container.querySelector(".header__logo");

      expect(header).toBeInTheDocument();
      expect(logo).toBeInTheDocument();
    });

    test("should have no accessibility violations", async () => {
      const { container } = renderHeader();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Cart Elements for REQUESTOR Role", () => {
    beforeEach(() => {
      // Mock auth for REQUESTOR role to show cart
      mockUseAuth.mockReturnValue({
        hasRole: vi
          .fn()
          .mockImplementation((role: AppRoles) => role === AppRoles.REQUESTOR),
        hasAnyRole: vi.fn().mockReturnValue(true),
        hasAllRoles: vi.fn().mockReturnValue(false),
        isRequestor: vi.fn().mockReturnValue(true),
        isApprover: vi.fn().mockReturnValue(false),
        hasPermission: vi.fn().mockReturnValue(true),
        canApproveRequests: vi.fn().mockReturnValue(false),
        canCreateRequests: vi.fn().mockReturnValue(true),
        getUserInfo: vi.fn().mockReturnValue({ roles: [AppRoles.REQUESTOR] }),
        getUserRoles: vi.fn().mockReturnValue([AppRoles.REQUESTOR]),
        isAuthenticated: true,
        keycloak: {} as any,
      });
    });

    test("should render cart link with correct attributes", () => {
      renderHeader();

      const cartLink = screen.getByLabelText("Go to cart page");
      expect(cartLink).toBeInTheDocument();
      expect(cartLink).toHaveAttribute("href", "/cart");
      expect(cartLink).toHaveClass("header__cart-wrapper");
    });

    test("should render cart icon with correct attributes", () => {
      renderHeader();

      const cartIcon = screen.getByAltText("Cart Icon");
      expect(cartIcon).toBeInTheDocument();
      expect(cartIcon).toHaveAttribute("src", "/assets/icons/cart-icon.png");
      expect(cartIcon).toHaveClass("header__cart-icon");
    });

    test("should display cart count", () => {
      renderHeader();

      const cartCount = screen.getByText("(0)");
      expect(cartCount).toBeInTheDocument();
      expect(cartCount).toHaveClass("header__cart-count");
    });

    test("should have proper navigation structure", () => {
      renderHeader();

      const homeLink = screen.getByLabelText("Go to home page");
      const cartLink = screen.getByLabelText("Go to cart page");

      expect(homeLink).toBeInTheDocument();
      expect(cartLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute("href", "/");
      expect(cartLink).toHaveAttribute("href", "/cart");
    });
  });

  describe("No Cart Elements for Non-REQUESTOR Roles", () => {
    beforeEach(() => {
      // Mock auth for APPROVER role (no cart access)
      mockUseAuth.mockReturnValue({
        hasRole: vi
          .fn()
          .mockImplementation((role: AppRoles) => role === AppRoles.APPROVER),
        hasAnyRole: vi.fn().mockReturnValue(true),
        hasAllRoles: vi.fn().mockReturnValue(false),
        isRequestor: vi.fn().mockReturnValue(false),
        isApprover: vi.fn().mockReturnValue(true),
        hasPermission: vi.fn().mockReturnValue(true),
        canApproveRequests: vi.fn().mockReturnValue(true),
        canCreateRequests: vi.fn().mockReturnValue(false),
        getUserInfo: vi.fn().mockReturnValue({ roles: [AppRoles.APPROVER] }),
        getUserRoles: vi.fn().mockReturnValue([AppRoles.APPROVER]),
        isAuthenticated: true,
        keycloak: {} as any,
      });
    });

    test("should not render cart elements for non-REQUESTOR roles", () => {
      renderHeader();

      // Cart elements should not be present
      expect(
        screen.queryByLabelText("Go to cart page")
      ).not.toBeInTheDocument();
      expect(screen.queryByAltText("Cart Icon")).not.toBeInTheDocument();
      expect(screen.queryByText("(0)")).not.toBeInTheDocument();

      // But home link should still be present
      expect(screen.getByLabelText("Go to home page")).toBeInTheDocument();
    });
  });
});
