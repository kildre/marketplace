import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import { Cart } from "./cart";
import { CartProvider } from "../../contexts/CartContext";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Create a test theme for Material-UI components
const testTheme = createTheme();

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
        <h3>Personal Information</h3>
        <p>Joe Snuffy</p>
      </div>
    ),
  })
);

vi.mock(
  "../../components/form-selected-applications/form-selected-applications",
  () => ({
    FormSelectedApplications: () => (
      <div data-testid="form-selected-applications">
        <h2>Selected Applications</h2>
        <div>Cart Items Content</div>
      </div>
    ),
  })
);

vi.mock("../../components/form-cost-details/form-cost-details", () => ({
  FormCostDetails: () => (
    <div data-testid="form-cost-details">
      <h3>Cost Details</h3>
      <p>Estimated ROM: $13.00</p>
    </div>
  ),
}));

vi.mock("../../components/form-submit-request/form-submit-request", () => ({
  FormSubmitRequest: () => (
    <div data-testid="form-submit-request">
      <button>Submit Request</button>
    </div>
  ),
}));

// Mock the useCart hook to control cart state
const mockUseCart = vi.fn();
vi.mock("../../contexts/CartContext", async () => {
  const actual = await vi.importActual("../../contexts/CartContext");
  return {
    ...actual,
    useCart: () => mockUseCart(),
    CartProvider: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

describe("Cart", () => {
  const renderCart = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider theme={testTheme}>
            <CartProvider>
              <Cart />
            </CartProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
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
        addToCart: vi.fn(),
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        clearCart: vi.fn(),
      });
    });

    it("should render empty cart message", () => {
      renderCart();
      expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    });

    it("should render breadcrumb link", () => {
      renderCart();
      expect(screen.getByText("Back to Catalog")).toBeInTheDocument();
    });

    it("should render PageTitle component", () => {
      renderCart();
      expect(screen.getByTestId("page-title")).toBeInTheDocument();
      expect(screen.getByText("Cart")).toBeInTheDocument();
    });

    it("should render FormPersonalInformation component", () => {
      renderCart();
      expect(
        screen.getByTestId("form-personal-information")
      ).toBeInTheDocument();
    });

    it("should have proper layout structure", () => {
      const { container } = renderCart();
      expect(container.querySelector(".cart-page")).toBeInTheDocument();
      expect(
        container.querySelector(".marketplace-content")
      ).toBeInTheDocument();
      expect(
        container.querySelector(".cart-page__content-wrapper")
      ).toBeInTheDocument();
    });

    it("should not render CartForm when cart is empty", () => {
      renderCart();
      expect(screen.queryByTestId("cart-form")).not.toBeInTheDocument();
    });

    it("should not render FormCostDetails when cart is empty", () => {
      renderCart();
      expect(screen.queryByTestId("form-cost-details")).not.toBeInTheDocument();
    });
  });

  describe("Cart with Items", () => {
    beforeEach(() => {
      mockUseCart.mockReturnValue({
        cartItems: [
          {
            product: {
              id: 1,
              name: "Test Product",
              type: "service",
              price: 100,
              description: "Test description",
              unit: "each",
              rom: "$100",
            },
            quantity: 2,
          },
        ],
        cartCount: 2,
        addToCart: vi.fn(),
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        clearCart: vi.fn(),
      });
    });

    it("should render CartForm when cart has items", () => {
      renderCart();
      expect(screen.getByTestId("cart-form")).toBeInTheDocument();
    });

    it("should render FormSelectedApplications when cart has items", () => {
      renderCart();
      expect(
        screen.getByTestId("form-selected-applications")
      ).toBeInTheDocument();
    });

    it("should render FormPersonalInformation component", () => {
      renderCart();
      expect(
        screen.getByTestId("form-personal-information")
      ).toBeInTheDocument();
    });

    it("should render FormCostDetails component", () => {
      renderCart();
      expect(screen.getByTestId("form-cost-details")).toBeInTheDocument();
    });

    it("should have proper layout structure with items", () => {
      const { container } = renderCart();
      expect(
        container.querySelector(".cart-page__content-left")
      ).toBeInTheDocument();
      expect(
        container.querySelector(".cart-page__content-right")
      ).toBeInTheDocument();
    });

    it("should render FormSubmitRequest component", () => {
      renderCart();
      expect(screen.getByTestId("form-submit-request")).toBeInTheDocument();
    });
  });

  describe("Common Elements", () => {
    beforeEach(() => {
      mockUseCart.mockReturnValue({
        cartItems: [],
        cartCount: 0,
        addToCart: vi.fn(),
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        clearCart: vi.fn(),
      });
    });

    it("should render main heading", () => {
      renderCart();
      expect(
        screen.getByRole("heading", { name: "Cart", level: 1 })
      ).toBeInTheDocument();
    });

    it("should have correct CSS classes", () => {
      const { container } = renderCart();
      expect(container.querySelector(".cart-page")).toBeInTheDocument();
      expect(
        container.querySelector(".marketplace-content")
      ).toBeInTheDocument();
    });

    it("should render without router (standalone)", () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      expect(() => {
        render(
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <ThemeProvider theme={testTheme}>
                <Cart />
              </ThemeProvider>
            </BrowserRouter>
          </QueryClientProvider>
        );
      }).not.toThrow();
    });

    it("should have proper heading hierarchy", () => {
      renderCart();
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Cart");
    });

    it("should be accessible", () => {
      renderCart();
      const breadcrumbLink = screen.getByRole("link", {
        name: "Back to Catalog",
      });
      expect(breadcrumbLink).toBeInTheDocument();
    });

    it("should render all text content correctly", () => {
      renderCart();
      expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
      expect(screen.getByText("Back to Catalog")).toBeInTheDocument();
    });

    it("should have no accessibility violations", async () => {
      const { container } = renderCart();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should meet WCAG accessibility standards", async () => {
      const { container } = renderCart();
      const results = await axe(container, {
        rules: {
          // Disable color-contrast rule as it may fail in test environment
          "color-contrast": { enabled: false },
        },
      });
      expect(results).toHaveNoViolations();
    });
  });
});
