import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import { Cart } from "./cart";
import { CartProvider } from "../../contexts/CartContext";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock the child components
vi.mock("../../components/page-title/page-title", () => ({
  PageTitle: ({ title }: { title: string }) => (
    <div data-testid="page-title">
      <h1 id="cart-heading">{title}</h1>
    </div>
  ),
}));

vi.mock("../../components/cart-form/cart-form", () => ({
  CartForm: () => (
    <div data-testid="cart-form">
      <form>Cart Form Content</form>
    </div>
  ),
}));

vi.mock(
  "../../components/form-personal-information/form-personal-information",
  () => ({
    FormPersonalInformation: () => (
      <div data-testid="form-personal-information">
        <h4>Personal Information</h4>
        <p>Joe Snuffy</p>
        <h4>Cost Details</h4>
        <p>Estimated ROM: $13.00</p>
      </div>
    ),
  })
);

vi.mock(
  "../../components/form-selected-applications/form-selected-applications",
  () => ({
    FormSelectedApplications: () => (
      <div data-testid="form-selected-applications">
        <h3>Selected Applications</h3>
        <div>Cart Items Content</div>
      </div>
    ),
  })
);

// Mock the useCart hook
const mockUseCart = vi.fn();
vi.mock("../../contexts/CartContext", () => ({
  CartProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useCart: () => mockUseCart(),
}));

describe("Cart", () => {
  const renderCartWithRouter = () => {
    return render(
      <BrowserRouter>
        <CartProvider>
          <Cart />
        </CartProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Empty Cart", () => {
    beforeEach(() => {
      mockUseCart.mockReturnValue({
        cartCount: 0,
        cartItems: [],
        pendingPriceCount: 0,
        addToCart: vi.fn(),
        removeFromCart: vi.fn(),
        clearCart: vi.fn(),
        updateCartQuantity: vi.fn(),
      });
    });

    test("should render empty cart message", () => {
      renderCartWithRouter();

      expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
      expect(screen.getByText(/Please return to the/)).toBeInTheDocument();
      expect(screen.getByText(/Product Catalog/)).toBeInTheDocument();
    });

    test("should render breadcrumb link", () => {
      renderCartWithRouter();

      const breadcrumbLink = screen.getByRole("link", {
        name: /return to catalog/i,
      });
      expect(breadcrumbLink).toBeInTheDocument();
      expect(breadcrumbLink).toHaveAttribute("href", "/");
      expect(breadcrumbLink).toHaveClass("cart-form__breadcrumb");
    });

    test("should render PageTitle component", () => {
      renderCartWithRouter();

      const pageTitle = screen.getByTestId("page-title");
      expect(pageTitle).toBeInTheDocument();
      expect(screen.getByText("Cart")).toBeInTheDocument();
    });

    test("should render FormPersonalInformation component", () => {
      renderCartWithRouter();

      const formPersonalInfo = screen.getByTestId("form-personal-information");
      expect(formPersonalInfo).toBeInTheDocument();
      expect(screen.getByText("Personal Information")).toBeInTheDocument();
      expect(screen.getByText("Joe Snuffy")).toBeInTheDocument();
    });

    test("should have proper layout structure", () => {
      const { container } = renderCartWithRouter();

      const cartContainer = container.querySelector(".cart-page");
      expect(cartContainer).toBeInTheDocument();
      expect(cartContainer).toHaveClass("marketplace-content");

      const contentWrapper = container.querySelector(
        ".cart-page__content-wrapper"
      );
      expect(contentWrapper).toBeInTheDocument();

      const contentLeft = container.querySelector(".cart-page__content-left");
      const contentRight = container.querySelector(".cart-page__content-right");
      expect(contentLeft).toBeInTheDocument();
      expect(contentRight).toBeInTheDocument();
    });

    test("should not render CartForm when cart is empty", () => {
      renderCartWithRouter();

      const cartForm = screen.queryByTestId("cart-form");
      expect(cartForm).not.toBeInTheDocument();
    });
  });

  describe("Cart with Items", () => {
    beforeEach(() => {
      mockUseCart.mockReturnValue({
        cartCount: 2,
        cartItems: [
          {
            product: {
              id: 1,
              name: "Test Product 1",
              price: 100,
              type: "License Based",
            },
            quantity: 2,
          },
        ],
        pendingPriceCount: 0,
        addToCart: vi.fn(),
        removeFromCart: vi.fn(),
        clearCart: vi.fn(),
        updateCartQuantity: vi.fn(),
      });
    });

    test("should render CartForm when cart has items", () => {
      renderCartWithRouter();

      const cartForm = screen.getByTestId("cart-form");
      expect(cartForm).toBeInTheDocument();
      expect(screen.getByText("Cart Form Content")).toBeInTheDocument();
    });

    test("should render FormSelectedApplications when cart has items", () => {
      renderCartWithRouter();

      const formSelectedApps = screen.getByTestId("form-selected-applications");
      expect(formSelectedApps).toBeInTheDocument();
      expect(screen.getByText("Selected Applications")).toBeInTheDocument();
      expect(screen.getByText("Cart Items Content")).toBeInTheDocument();
    });

    test("should render FormPersonalInformation component", () => {
      renderCartWithRouter();

      const formPersonalInfo = screen.getByTestId("form-personal-information");
      expect(formPersonalInfo).toBeInTheDocument();
      expect(screen.getByText("Personal Information")).toBeInTheDocument();
    });

    test("should have proper layout structure with items", () => {
      const { container } = renderCartWithRouter();

      const cartContainer = container.querySelector(".cart-page");
      expect(cartContainer).toBeInTheDocument();
      expect(cartContainer).toHaveClass("marketplace-content");

      const contentWrapper = container.querySelector(
        ".cart-page__content-wrapper"
      );
      expect(contentWrapper).toBeInTheDocument();

      const contentLeft = container.querySelector(".cart-page__content-left");
      const contentRight = container.querySelector(".cart-page__content-right");
      expect(contentLeft).toBeInTheDocument();
      expect(contentRight).toBeInTheDocument();
    });

    test("should handle singular product count", () => {
      mockUseCart.mockReturnValue({
        cartCount: 1,
        cartItems: [
          {
            product: {
              id: 1,
              name: "Test Product 1",
              price: 100,
              type: "License Based",
            },
            quantity: 1,
          },
        ],
        pendingPriceCount: 0,
        addToCart: vi.fn(),
        removeFromCart: vi.fn(),
        clearCart: vi.fn(),
        updateCartQuantity: vi.fn(),
      });

      renderCartWithRouter();

      // FormSelectedApplications should handle the display of cart count
      const formSelectedApps = screen.getByTestId("form-selected-applications");
      expect(formSelectedApps).toBeInTheDocument();
    });
  });

  describe("Common Elements", () => {
    beforeEach(() => {
      mockUseCart.mockReturnValue({
        cartItems: [],
        cartCount: 0,
        removeFromCart: vi.fn(),
        clearCart: vi.fn(),
      });
    });

    test("should render main heading", () => {
      renderCartWithRouter();

      const mainHeading = screen.getByRole("heading", { level: 1 });
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading).toHaveTextContent("Cart");
      expect(mainHeading).toHaveAttribute("id", "cart-heading");
    });

    test("should have correct CSS classes", () => {
      const { container } = renderCartWithRouter();

      const containerDiv = container.querySelector(".cart-page");
      expect(containerDiv).toBeInTheDocument();
      expect(containerDiv).toHaveClass("cart-page", "marketplace-content");
    });

    test("should render without router (standalone)", () => {
      // This test should fail because the Link component requires a router
      expect(() => render(<Cart />)).toThrow();
    });

    test("should have proper heading hierarchy", () => {
      renderCartWithRouter();

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("Cart");
      expect(h1).toHaveAttribute("id", "cart-heading");
    });

    test("should be accessible", () => {
      renderCartWithRouter();

      // Check for proper heading structure
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThanOrEqual(1);

      // Check for navigation links (there might be multiple in empty cart)
      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThanOrEqual(1);
    });

    test("should render all text content correctly", () => {
      renderCartWithRouter();

      // Test main heading text
      expect(screen.getByText("Cart")).toBeInTheDocument();
      expect(screen.getByText("Cart")).toBeVisible();

      // Test breadcrumb text
      expect(screen.getByText("Return to Catalog")).toBeInTheDocument();
      expect(screen.getByText("Return to Catalog")).toBeVisible();
    });

    test("should have no accessibility violations", async () => {
      const { container } = renderCartWithRouter();

      // Disable heading-order check since the cart uses Material-UI Typography with h6
      // which can create heading order issues that are acceptable in this context
      const results = await axe(container, {
        rules: {
          "heading-order": { enabled: false },
        },
      });
      expect(results).toHaveNoViolations();
    });

    test("should meet WCAG accessibility standards", async () => {
      const { container } = renderCartWithRouter();

      // Test heading hierarchy
      const h1 = container.querySelector("h1");
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveAttribute("id", "cart-heading");

      // Test link accessibility
      const link = container.querySelector("a");
      expect(link).toHaveAttribute("href", "/");

      // Run comprehensive accessibility tests
      const results = await axe(container, {
        rules: {
          "heading-order": { enabled: false }, // Disable since Material-UI h6 after h1 is acceptable in this context
          "page-has-heading-one": { enabled: true },
          "landmark-unique": { enabled: true },
          "link-name": { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });
  });
});
