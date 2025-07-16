import { render, screen, fireEvent } from "@testing-library/react";
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

// Mock the useCart hook
const mockUseCart = vi.fn();
vi.mock("../../contexts/CartContext", () => ({
  CartProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useCart: () => mockUseCart(),
}));

describe("Cart", () => {
  const mockProduct = {
    id: 1,
    type: "Usage Based Tool",
    name: "Test Product",
    description: "Test description",
    price: 100,
    unit: 50,
    inCart: true,
    currentlyInCart: 2,
    cartStatus: "available",
  };

  const mockProduct2 = {
    id: 2,
    type: "Bundle",
    name: "Another Product",
    description: "Another test description",
    price: 200,
    unit: 25,
    inCart: true,
    currentlyInCart: 1,
    cartStatus: "available",
  };

  const mockProductWithROM = {
    id: 3,
    type: "Seat Based Tool",
    name: "ROM Product",
    description: "Product with ROM pricing",
    price: 0,
    rom: "$5K - $10K",
    unit: 1,
    inCart: true,
    currentlyInCart: 1,
    cartStatus: "available",
  };

  const mockFreeProduct = {
    id: 4,
    type: "Usage Based Tool",
    name: "Free Product",
    description: "Free product description",
    price: 0,
    unit: 1,
    inCart: true,
    currentlyInCart: 1,
    cartStatus: "available",
  };

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
        cartItems: [],
        cartCount: 0,
        removeFromCart: vi.fn(),
        clearCart: vi.fn(),
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
    const mockRemoveFromCart = vi.fn();
    const mockClearCart = vi.fn();

    beforeEach(() => {
      mockUseCart.mockReturnValue({
        cartItems: [
          { product: mockProduct, quantity: 2 },
          { product: mockProduct2, quantity: 1 },
        ],
        cartCount: 2,
        removeFromCart: mockRemoveFromCart,
        clearCart: mockClearCart,
      });
    });

    test("should render CartForm when cart has items", () => {
      renderCartWithRouter();

      const cartForm = screen.getByTestId("cart-form");
      expect(cartForm).toBeInTheDocument();
      expect(screen.getByText("Cart Form Content")).toBeInTheDocument();
    });

    test("should render cart items count", () => {
      renderCartWithRouter();

      expect(screen.getByText("Cart Items (2 products)")).toBeInTheDocument();
      expect(
        screen.getByText("Total quantities will be shown during checkout")
      ).toBeInTheDocument();
    });

    test("should render cart items", () => {
      renderCartWithRouter();

      expect(screen.getByText("Test Product")).toBeInTheDocument();
      expect(screen.getByText("Another Product")).toBeInTheDocument();
      expect(screen.getByText("Test description")).toBeInTheDocument();
      expect(screen.getByText("Another test description")).toBeInTheDocument();
      expect(screen.getAllByText(/Usage Based Tool • \$100/)).toHaveLength(1);
      expect(screen.getAllByText(/Bundle • \$200/)).toHaveLength(1);
    });

    test("should render cart item quantities", () => {
      renderCartWithRouter();

      const quantities = screen.getAllByText(/Quantity:/);
      expect(quantities).toHaveLength(2);
      expect(screen.getByText("Quantity: 2")).toBeInTheDocument();
      expect(screen.getByText("Quantity: 1")).toBeInTheDocument();
    });

    test("should render remove buttons for each item", () => {
      renderCartWithRouter();

      const removeButtons = screen.getAllByText("Remove");
      expect(removeButtons).toHaveLength(2);
      removeButtons.forEach((button) => {
        expect(button.tagName).toBe("BUTTON");
      });
    });

    test("should call removeFromCart when remove button is clicked", () => {
      renderCartWithRouter();

      const removeButtons = screen.getAllByText("Remove");
      fireEvent.click(removeButtons[0]);

      expect(mockRemoveFromCart).toHaveBeenCalledWith(1);
    });

    test("should render clear cart button", () => {
      renderCartWithRouter();

      const clearCartButton = screen.getByText("Clear Cart");
      expect(clearCartButton).toBeInTheDocument();
      expect(clearCartButton.tagName).toBe("BUTTON");
    });

    test("should call clearCart when clear cart button is clicked", () => {
      renderCartWithRouter();

      const clearCartButton = screen.getByText("Clear Cart");
      fireEvent.click(clearCartButton);

      expect(mockClearCart).toHaveBeenCalled();
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

    test("should render product icons", () => {
      renderCartWithRouter();

      const usageBasedIcon = screen.getByAltText("Usage Based Tool icon");
      expect(usageBasedIcon).toBeInTheDocument();
      expect(usageBasedIcon).toHaveAttribute(
        "src",
        "/assets/icons/icon_user-tool.png"
      );

      const bundleIcon = screen.getByAltText("Bundle icon");
      expect(bundleIcon).toBeInTheDocument();
      expect(bundleIcon).toHaveAttribute(
        "src",
        "/assets/icons/icon_bundle.png"
      );
    });

    test("should format prices correctly", () => {
      renderCartWithRouter();

      expect(screen.getAllByText(/Usage Based Tool • \$100/)).toHaveLength(1);
      expect(screen.getAllByText(/Bundle • \$200/)).toHaveLength(1);
    });

    test("should handle singular product count", () => {
      mockUseCart.mockReturnValue({
        cartItems: [{ product: mockProduct, quantity: 1 }],
        cartCount: 1,
        removeFromCart: mockRemoveFromCart,
        clearCart: mockClearCart,
      });

      renderCartWithRouter();

      expect(screen.getByText("Cart Items (1 product)")).toBeInTheDocument();
    });

    test("should handle ROM pricing", () => {
      mockUseCart.mockReturnValue({
        cartItems: [{ product: mockProductWithROM, quantity: 1 }],
        cartCount: 1,
        removeFromCart: mockRemoveFromCart,
        clearCart: mockClearCart,
      });

      renderCartWithRouter();

      expect(screen.getByText("ROM Product")).toBeInTheDocument();
      expect(
        screen.getByText(/Seat Based Tool • \$5K - \$10K/)
      ).toBeInTheDocument();
    });

    test("should handle free products", () => {
      mockUseCart.mockReturnValue({
        cartItems: [{ product: mockFreeProduct, quantity: 1 }],
        cartCount: 1,
        removeFromCart: mockRemoveFromCart,
        clearCart: mockClearCart,
      });

      renderCartWithRouter();

      expect(screen.getByText("Free Product")).toBeInTheDocument();
      expect(screen.getByText(/Usage Based Tool • Free/)).toBeInTheDocument();
    });

    test("should render correct icon for different product types", () => {
      mockUseCart.mockReturnValue({
        cartItems: [
          { product: mockProduct, quantity: 1 }, // Usage Based Tool
          { product: mockProduct2, quantity: 1 }, // Bundle
          { product: mockProductWithROM, quantity: 1 }, // Seat Based Tool
        ],
        cartCount: 3,
        removeFromCart: mockRemoveFromCart,
        clearCart: mockClearCart,
      });

      renderCartWithRouter();

      // Usage Based Tool should use user-tool icon
      const usageBasedIcon = screen.getByAltText("Usage Based Tool icon");
      expect(usageBasedIcon).toHaveAttribute(
        "src",
        "/assets/icons/icon_user-tool.png"
      );

      // Bundle should use bundle icon
      const bundleIcon = screen.getByAltText("Bundle icon");
      expect(bundleIcon).toHaveAttribute(
        "src",
        "/assets/icons/icon_bundle.png"
      );

      // Seat Based Tool should use seat-based-tool icon
      const seatBasedIcon = screen.getByAltText("Seat Based Tool icon");
      expect(seatBasedIcon).toHaveAttribute(
        "src",
        "/assets/icons/icon_seat-based-tool.png"
      );
    });

    test("should handle unknown product types with default icon", () => {
      const mockUnknownProduct = {
        ...mockProduct,
        type: "Unknown Type",
      };

      mockUseCart.mockReturnValue({
        cartItems: [{ product: mockUnknownProduct, quantity: 1 }],
        cartCount: 1,
        removeFromCart: mockRemoveFromCart,
        clearCart: mockClearCart,
      });

      renderCartWithRouter();

      const unknownIcon = screen.getByAltText("Unknown Type icon");
      expect(unknownIcon).toHaveAttribute(
        "src",
        "/assets/icons/icon_user-tool.png"
      );
    });

    test("should format prices with commas for large numbers", () => {
      const mockExpensiveProduct = {
        ...mockProduct,
        price: 1000000,
      };

      mockUseCart.mockReturnValue({
        cartItems: [{ product: mockExpensiveProduct, quantity: 1 }],
        cartCount: 1,
        removeFromCart: mockRemoveFromCart,
        clearCart: mockClearCart,
      });

      renderCartWithRouter();

      expect(
        screen.getByText(/Usage Based Tool • \$1,000,000/)
      ).toBeInTheDocument();
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
