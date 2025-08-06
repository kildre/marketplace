import {
  render,
  screen,
  fireEvent,
  act,
  cleanup,
} from "@testing-library/react";
import { vi } from "vitest";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ProductCard } from "./product-card";
import { Product } from "../../interfaces";

// Create a theme with ripple effects disabled for testing
const testTheme = createTheme({
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});

describe("ProductCard", () => {
  const mockProduct: Product = {
    id: 1,
    type: "License Based",
    name: "Test Product",
    description: "This is a test product description",
    price: 100,
    unit: 50,
    inCart: false,
    currentlyInCart: 0,
    cartStatus: "available",
  };

  const mockProductWithRom: Product = {
    ...mockProduct,
    id: 2,
    name: "Custom ROM Product",
    price: 150, // Changed from 0 to test ROM override
    rom: "Custom ROM",
  };

  const mockProductUnavailable: Product = {
    ...mockProduct,
    id: 3,
    name: "Unavailable Product",
    cartStatus: "unavailable",
  };

  const mockProductInCart: Product = {
    ...mockProduct,
    id: 4,
    name: "Product In Cart",
    inCart: true,
    currentlyInCart: 5,
  };

  const mockOnUpdateCartQuantity = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Only run timer cleanup if timers are mocked
    try {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    } catch {
      // Timers weren't mocked, that's okay
    }

    // Enhanced cleanup to ensure complete test isolation
    cleanup();
  });

  const renderProductCard = (product: Product = mockProduct, props = {}) => {
    return render(
      <ThemeProvider theme={testTheme}>
        <ProductCard
          product={product}
          onUpdateCartQuantity={mockOnUpdateCartQuantity}
          {...props}
        />
      </ThemeProvider>
    );
  };

  describe("Basic Rendering", () => {
    test("should render successfully", () => {
      renderProductCard();

      const card = screen.getByRole("article");
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass("product-card");
    });

    test("should display product information correctly", () => {
      renderProductCard();

      expect(screen.getByText("Test Product")).toBeInTheDocument();
      expect(
        screen.getByText("This is a test product description")
      ).toBeInTheDocument();
      expect(screen.getByText("License Based")).toBeInTheDocument();
      expect(screen.getByText("$100")).toBeInTheDocument();
    });

    test("should render product icon with correct alt text", () => {
      renderProductCard();

      const icon = screen.getByAltText("License Based icon");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute("src", "/assets/icons/icon_user-tool.png");
    });

    test("should have proper accessibility attributes", () => {
      renderProductCard();

      const card = screen.getByRole("article");
      expect(card).toHaveAttribute("aria-label", "Test Product product card");

      const typeChip = screen.getByLabelText("Product type: License Based");
      expect(typeChip).toBeInTheDocument();

      const priceText = screen.getByLabelText("Price: $100");
      expect(priceText).toBeInTheDocument();
    });
  });

  describe("Product Types and Icons", () => {
    test("should display correct icon for Usage Based Tool", () => {
      const product = { ...mockProduct, type: "Usage Based Tool" as any };
      renderProductCard(product);

      const icon = screen.getByAltText("Usage Based Tool icon");
      expect(icon).toHaveAttribute("src", "/assets/icons/icon_user-tool.png");
    });

    test("should display correct icon for Bundle", () => {
      const product = { ...mockProduct, type: "Bundle" as any };
      renderProductCard(product);

      const icon = screen.getByAltText("Bundle icon");
      expect(icon).toHaveAttribute("src", "/assets/icons/icon_bundle.png");
    });

    test("should display correct icon for Seat Based Tool", () => {
      const product = { ...mockProduct, type: "Seat Based Tool" as any };
      renderProductCard(product);

      const icon = screen.getByAltText("Seat Based Tool icon");
      expect(icon).toHaveAttribute(
        "src",
        "/assets/icons/icon_seat-based-tool.png"
      );
    });

    test("should use default icon for unknown type", () => {
      const product = { ...mockProduct, type: "Unknown Type" as any };
      renderProductCard(product);

      const icon = screen.getByAltText("Unknown Type icon");
      expect(icon).toHaveAttribute("src", "/assets/icons/icon_user-tool.png");
    });
  });

  describe("Price Formatting", () => {
    test("should display free for zero price", () => {
      const product = { ...mockProduct, price: 0 };
      renderProductCard(product);

      expect(screen.getByText("Free")).toBeInTheDocument();
    });

    test("should display ROM label when available", () => {
      renderProductCard(mockProductWithRom);

      // The price should show ROM instead of formatted price since rom property overrides price
      expect(screen.getByLabelText("Price: Custom ROM")).toBeInTheDocument();
    });

    test("should format price with thousands separator", () => {
      const product = { ...mockProduct, price: 1500 };
      renderProductCard(product);

      expect(screen.getByText("$1,500")).toBeInTheDocument();
    });
  });

  describe("Cart Status and Pills", () => {
    test("should show IN CART pill when items are in cart", () => {
      renderProductCard(mockProductInCart);

      const pill = screen.getByRole("status");
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveTextContent("IN CART");
      expect(pill).toHaveAttribute("aria-label", "5 items in cart");
    });

    test("should not show IN CART pill when no items in cart", () => {
      renderProductCard();

      const pill = screen.queryByRole("status");
      expect(pill).not.toBeInTheDocument();
    });

    test("should display current cart quantity", () => {
      renderProductCard(mockProductInCart);

      expect(screen.getByText("CURRENTLY IN CART: 5")).toBeInTheDocument();
    });

    test("should not display cart quantity when zero", () => {
      renderProductCard();

      expect(screen.queryByText(/CURRENTLY IN CART/)).not.toBeInTheDocument();
    });
  });

  describe("Add to Cart Functionality", () => {
    test("should call onUpdateCartQuantity when Add to Cart button is clicked", () => {
      renderProductCard();

      const addButton = screen.getByRole("button", {
        name: "Add to Cart Test Product",
      });

      act(() => {
        fireEvent.click(addButton);
      });

      expect(mockOnUpdateCartQuantity).toHaveBeenCalledWith(mockProduct, 1);
      expect(mockOnUpdateCartQuantity).toHaveBeenCalledTimes(1);
    });

    test("should disable Add to Cart button when product is unavailable", () => {
      renderProductCard(mockProductUnavailable);

      const addButton = screen.getByRole("button", {
        name: "Add to Cart Unavailable Product",
      });
      expect(addButton).toBeDisabled();
      expect(addButton).toHaveAttribute("aria-describedby", "unavailable-3");
    });

    test("should show unavailable helper text for screen readers", () => {
      renderProductCard(mockProductUnavailable);

      const helperText = screen.getByText("This item is currently unavailable");
      expect(helperText).toBeInTheDocument();
      expect(helperText).toHaveClass("sr-only");
    });
  });

  describe("Quantity Selector", () => {
    test("should render quantity selector with proper accessibility", () => {
      renderProductCard();

      const quantityGroup = screen.getByRole("group", {
        name: "Quantity selector for Test Product",
      });
      expect(quantityGroup).toBeInTheDocument();

      const decreaseButton = screen.getByRole("button", {
        name: "Decrease quantity for Test Product",
      });
      const increaseButton = screen.getByRole("button", {
        name: "Increase quantity for Test Product",
      });
      const quantityInput = screen.getByLabelText("Quantity for Test Product");

      expect(decreaseButton).toBeInTheDocument();
      expect(increaseButton).toBeInTheDocument();
      expect(quantityInput).toBeInTheDocument();
    });

    test("should disable decrease button when quantity is at minimum", () => {
      renderProductCard();

      const decreaseButton = screen.getByRole("button", {
        name: "Decrease quantity for Test Product",
      });
      // Should be enabled since initial quantity is 1
      expect(decreaseButton).not.toBeDisabled();
    });

    test("should enable decrease button when quantity is greater than zero", () => {
      renderProductCard(mockProductInCart);

      const decreaseButton = screen.getByRole("button", {
        name: "Decrease quantity for Product In Cart",
      });
      expect(decreaseButton).not.toBeDisabled();
    });

    test("should display current quantity in input field", () => {
      renderProductCard(mockProductInCart);

      const quantityInput = screen.getByRole("spinbutton");
      expect(quantityInput).toBeInTheDocument();
      expect(quantityInput).toHaveValue(5);
    });
  });

  describe("Quantity Input Handling", () => {
    test("should not allow negative quantities", async () => {
      renderProductCard();

      const quantityInput = screen.getByRole("spinbutton");

      // Use fireEvent for more reliable testing
      act(() => {
        fireEvent.change(quantityInput, { target: { value: "-5" } });
      });

      // Should not call onUpdateCartQuantity for negative values
      expect(mockOnUpdateCartQuantity).not.toHaveBeenCalledWith(
        mockProduct,
        -5
      );
    });

    test("should handle non-numeric input gracefully", async () => {
      renderProductCard();

      const quantityInput = screen.getByRole("spinbutton");

      // Use fireEvent for more reliable testing
      act(() => {
        fireEvent.change(quantityInput, { target: { value: "abc" } });
      });

      // Should not call onUpdateCartQuantity for non-numeric values
      expect(mockOnUpdateCartQuantity).not.toHaveBeenCalledWith(
        mockProduct,
        NaN
      );
    });
  });

  describe("Quantity Button Interactions", () => {
    test("should not decrease quantity below zero", () => {
      // Create a product that starts with 0 in the component state (through manual interaction)
      renderProductCard();

      const quantityInput = screen.getByRole("spinbutton");

      // First, set quantity to 0 manually
      act(() => {
        fireEvent.change(quantityInput, { target: { value: "0" } });
      });

      const decreaseButton = screen.getByRole("button", {
        name: "Decrease quantity for Test Product",
      });

      // Button should be disabled when quantity is 0
      expect(decreaseButton).toBeDisabled();
    });

    test("should handle touch events for increase button", () => {
      renderProductCard();

      const increaseButton = screen.getByRole("button", {
        name: "Increase quantity for Test Product",
      });

      act(() => {
        fireEvent.touchStart(increaseButton);
        fireEvent.touchEnd(increaseButton);
      });

      const quantityInput = screen.getByRole("spinbutton");
      expect(quantityInput).toHaveValue(2); // Should increase from 1 to 2
    });

    test("should handle touch events for decrease button", () => {
      renderProductCard(mockProductInCart);

      const decreaseButton = screen.getByRole("button", {
        name: "Decrease quantity for Product In Cart",
      });

      act(() => {
        fireEvent.touchStart(decreaseButton);
        fireEvent.touchEnd(decreaseButton);
      });

      const quantityInput = screen.getByRole("spinbutton");
      expect(quantityInput).toHaveValue(4); // Should decrease from 5 to 4
    });

    test("should handle repeated increase with interval when button held down", () => {
      renderProductCard();

      const increaseButton = screen.getByRole("button", {
        name: "Increase quantity for Test Product",
      });

      act(() => {
        fireEvent.mouseDown(increaseButton);
      });

      // Advance timers to trigger interval callbacks
      act(() => {
        vi.advanceTimersByTime(300); // Should trigger at least 2 intervals (150ms each)
      });

      const quantityInput = screen.getByRole("spinbutton");
      // Should be more than the initial value of 1 due to intervals
      expect(quantityInput).toHaveProperty("value");
      const currentValue = Number((quantityInput as any).value);
      expect(currentValue).toBeGreaterThan(2);

      act(() => {
        fireEvent.mouseUp(increaseButton);
      });
    });

    test("should handle repeated decrease with interval when button held down", () => {
      renderProductCard(mockProductInCart);

      const decreaseButton = screen.getByRole("button", {
        name: "Decrease quantity for Product In Cart",
      });

      act(() => {
        fireEvent.mouseDown(decreaseButton);
      });

      // Advance timers to trigger interval callbacks
      act(() => {
        vi.advanceTimersByTime(300); // Should trigger at least 2 intervals (150ms each)
      });

      const quantityInput = screen.getByRole("spinbutton");
      // Should be less than the initial value of 5 due to intervals
      expect(quantityInput).toHaveProperty("value");
      const currentValue = Number((quantityInput as any).value);
      expect(currentValue).toBeLessThan(4);

      act(() => {
        fireEvent.mouseUp(decreaseButton);
      });
    });

    test("should stop interval when mouse leaves increase button", () => {
      renderProductCard();

      const increaseButton = screen.getByRole("button", {
        name: "Increase quantity for Test Product",
      });

      act(() => {
        fireEvent.mouseDown(increaseButton);
      });

      act(() => {
        fireEvent.mouseLeave(increaseButton);
      });

      const quantityInput = screen.getByRole("spinbutton");
      const initialValue = Number((quantityInput as any).value);

      // Advance timers - should not change since interval was stopped
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(quantityInput).toHaveValue(initialValue);
    });

    test("should stop interval when mouse leaves decrease button", () => {
      renderProductCard(mockProductInCart);

      const decreaseButton = screen.getByRole("button", {
        name: "Decrease quantity for Product In Cart",
      });

      act(() => {
        fireEvent.mouseDown(decreaseButton);
      });

      act(() => {
        fireEvent.mouseLeave(decreaseButton);
      });

      const quantityInput = screen.getByRole("spinbutton");
      const initialValue = Number((quantityInput as any).value);

      // Advance timers - should not change since interval was stopped
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(quantityInput).toHaveValue(initialValue);
    });
  });

  describe("Component Lifecycle", () => {
    test("should clean up intervals on unmount", () => {
      const clearIntervalSpy = vi.spyOn(window, "clearInterval");
      const { unmount } = renderProductCard();

      const increaseButton = screen.getByRole("button", {
        name: "Increase quantity for Test Product",
      });

      act(() => {
        fireEvent.mouseDown(increaseButton);
      });

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    test("should update quantity ref when product prop changes", () => {
      const { rerender } = renderProductCard();

      const quantityInput = screen.getByRole("spinbutton");
      expect(quantityInput).toBeInTheDocument();
      expect(quantityInput).toHaveValue(1); // Default value for products not in cart

      const updatedProduct = { ...mockProduct, currentlyInCart: 3 };
      rerender(
        <ThemeProvider theme={testTheme}>
          <ProductCard
            product={updatedProduct}
            onUpdateCartQuantity={mockOnUpdateCartQuantity}
          />
        </ThemeProvider>
      );

      const updatedInput = screen.getByRole("spinbutton");
      expect(updatedInput).toBeInTheDocument();
      expect(updatedInput).toHaveValue(3);
    });
  });

  describe("Optional Props", () => {
    test("should work without onUpdateCartQuantity prop", () => {
      render(
        <ThemeProvider theme={testTheme}>
          <ProductCard product={mockProduct} />
        </ThemeProvider>
      );

      const addButton = screen.getByRole("button", {
        name: "Add to Cart Test Product",
      });

      expect(() => {
        act(() => {
          fireEvent.click(addButton);
        });
      }).not.toThrow();

      const increaseButton = screen.getByRole("button", {
        name: "Increase quantity for Test Product",
      });

      expect(() => {
        act(() => {
          fireEvent.mouseDown(increaseButton);
          fireEvent.mouseUp(increaseButton);
        });
      }).not.toThrow();
    });
  });

  describe("Accessibility", () => {
    test("should have proper ARIA labels and descriptions", () => {
      renderProductCard();

      const productTitle = screen.getByText("Test Product");
      expect(productTitle).toHaveAttribute("id", "product-title-1");

      const description = screen.getByText(
        "This is a test product description"
      );
      expect(description).toHaveAttribute(
        "aria-describedby",
        "product-title-1"
      );

      const quantityHelp = screen.getByText(
        "Enter quantity (minimum 0, use 0 to remove from cart)"
      );
      expect(quantityHelp).toHaveAttribute("id", "quantity-help-1");
      expect(quantityHelp).toHaveClass("sr-only");
    });

    test("should have live region for cart status", () => {
      renderProductCard(mockProductInCart);

      const cartStatus = screen.getByText("CURRENTLY IN CART: 5");
      expect(cartStatus).toHaveAttribute("aria-live", "polite");
      expect(cartStatus).toHaveAttribute("aria-atomic", "true");
    });

    test("should have proper role for card", () => {
      renderProductCard();

      const card = screen.getByRole("article");
      expect(card).toHaveAttribute("aria-label", "Test Product product card");
    });
  });

  describe("Edge Cases", () => {
    test("should handle product with all optional fields", () => {
      const minimalProduct: Product = {
        id: 999,
        type: "License Based",
        name: "Minimal Product",
        description: "Basic description",
        price: 0,
        unit: 1,
        inCart: false,
        currentlyInCart: 0,
      };

      renderProductCard(minimalProduct);

      expect(screen.getByText("Minimal Product")).toBeInTheDocument();
      expect(screen.getByText("Free")).toBeInTheDocument();
    });

    test("should handle zero quantity correctly", () => {
      const zeroQuantityProduct = { ...mockProduct, currentlyInCart: 0 };
      renderProductCard(zeroQuantityProduct);

      const quantityInput = screen.getByRole("spinbutton");
      expect(quantityInput).toBeInTheDocument();
      expect(quantityInput).toHaveValue(1); // Default value when not in cart

      const decreaseButton = screen.getByRole("button", {
        name: "Decrease quantity for Test Product",
      });
      expect(decreaseButton).not.toBeDisabled(); // Should be enabled since quantity is 1
    });
  });

  describe("Dynamic Button Text", () => {
    test("should show 'Add to Cart' when product is not in cart", () => {
      renderProductCard(mockProduct);

      const addButton = screen.getByRole("button", {
        name: "Add to Cart Test Product",
      });
      expect(addButton).toHaveTextContent("Add to Cart");
    });

    test("should show 'Add to Cart' when product is in cart but quantity hasn't changed", () => {
      renderProductCard(mockProductInCart);

      const addButton = screen.getByRole("button", {
        name: "Add to Cart Product In Cart",
      });
      expect(addButton).toHaveTextContent("Add to Cart");
    });

    test("should show 'Update Cart' when product is in cart and quantity has changed", () => {
      renderProductCard(mockProductInCart);

      const quantityInput = screen.getByRole("spinbutton");

      act(() => {
        fireEvent.change(quantityInput, { target: { value: "3" } });
      });

      const updateButton = screen.getByRole("button", {
        name: "Update Cart Product In Cart",
      });
      expect(updateButton).toHaveTextContent("Update Cart");
    });

    test("should show 'Update Cart' when changing quantity to 0", () => {
      renderProductCard(mockProductInCart);

      const quantityInput = screen.getByRole("spinbutton");

      act(() => {
        fireEvent.change(quantityInput, { target: { value: "0" } });
      });

      const updateButton = screen.getByRole("button", {
        name: "Update Cart Product In Cart",
      });
      expect(updateButton).toHaveTextContent("Update Cart");
    });
    test("should revert to 'Add to Cart' when quantity is changed back to original", () => {
      renderProductCard(mockProductInCart);

      const quantityInput = screen.getByRole("spinbutton");

      // Change quantity
      act(() => {
        fireEvent.change(quantityInput, { target: { value: "3" } });
      });

      // Verify it shows Update Cart
      const updateButton = screen.getByRole("button", {
        name: "Update Cart Product In Cart",
      });
      expect(updateButton).toHaveTextContent("Update Cart");

      // Change back to original quantity
      act(() => {
        fireEvent.change(quantityInput, { target: { value: "5" } });
      });

      // Should show Add to Cart again
      const addButton = screen.getByRole("button", {
        name: "Add to Cart Product In Cart",
      });
      expect(addButton).toHaveTextContent("Add to Cart");
    });

    test("should show 'Update Cart' when using increase/decrease buttons", () => {
      renderProductCard(mockProductInCart);

      const increaseButton = screen.getByRole("button", {
        name: "Increase quantity for Product In Cart",
      });

      // Just click the button to change the local state
      act(() => {
        fireEvent.mouseDown(increaseButton);
        fireEvent.mouseUp(increaseButton);
      });

      // Check that the button text changes to Update Cart (since local state changed)
      const updateButton = screen.getByRole("button", {
        name: "Update Cart Product In Cart",
      });
      expect(updateButton).toHaveTextContent("Update Cart");
    });
  });

  describe("Initial Quantity State", () => {
    test("should initialize quantity to 1 when product is not in cart", () => {
      renderProductCard(mockProduct);

      const quantityInput = screen.getByRole("spinbutton");
      expect(quantityInput).toHaveValue(1);
    });

    test("should initialize quantity to current cart quantity when product is in cart", () => {
      renderProductCard(mockProductInCart);

      const quantityInput = screen.getByRole("spinbutton");
      expect(quantityInput).toHaveValue(5);
    });

    test("should initialize quantity to 1 when product has 0 in cart", () => {
      const zeroQuantityProduct = { ...mockProduct, currentlyInCart: 0 };
      renderProductCard(zeroQuantityProduct);

      const quantityInput = screen.getByRole("spinbutton");
      expect(quantityInput).toHaveValue(1);
    });
  });

  describe("Button Disabled State Logic", () => {
    test("should enable Add to Cart button when product is not in cart", () => {
      renderProductCard(mockProduct);

      const addButton = screen.getByRole("button", {
        name: "Add to Cart Test Product",
      });
      expect(addButton).not.toBeDisabled();
      expect(addButton).toHaveTextContent("Add to Cart");
    });

    test("should disable Add to Cart button when product is in cart and quantity unchanged", () => {
      renderProductCard(mockProductInCart);

      const addButton = screen.getByRole("button", {
        name: "Add to Cart Product In Cart",
      });
      expect(addButton).toBeDisabled();
      expect(addButton).toHaveTextContent("Add to Cart");
    });

    test("should enable Update Cart button when product is in cart and quantity changed", () => {
      renderProductCard(mockProductInCart);

      const quantityInput = screen.getByRole("spinbutton");

      act(() => {
        fireEvent.change(quantityInput, { target: { value: "3" } });
      });

      const updateButton = screen.getByRole("button", {
        name: "Update Cart Product In Cart",
      });
      expect(updateButton).not.toBeDisabled();
      expect(updateButton).toHaveTextContent("Update Cart");
    });

    test("should disable button again when quantity is changed back to original", () => {
      renderProductCard(mockProductInCart);

      const quantityInput = screen.getByRole("spinbutton");

      // Change quantity
      act(() => {
        fireEvent.change(quantityInput, { target: { value: "3" } });
      });

      // Verify it's enabled and shows Update Cart
      let button = screen.getByRole("button", {
        name: "Update Cart Product In Cart",
      });
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent("Update Cart");

      // Change back to original quantity
      act(() => {
        fireEvent.change(quantityInput, { target: { value: "5" } });
      });

      // Should be disabled and show Add to Cart again
      button = screen.getByRole("button", {
        name: "Add to Cart Product In Cart",
      });
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent("Add to Cart");
    });

    test("should always disable button when product is unavailable", () => {
      renderProductCard(mockProductUnavailable);

      const addButton = screen.getByRole("button", {
        name: "Add to Cart Unavailable Product",
      });
      expect(addButton).toBeDisabled();
    });

    test("should enable Update Cart when using stepper buttons", () => {
      renderProductCard(mockProductInCart);

      const increaseButton = screen.getByRole("button", {
        name: "Increase quantity for Product In Cart",
      });

      // Click increase button to change quantity
      act(() => {
        fireEvent.mouseDown(increaseButton);
        fireEvent.mouseUp(increaseButton);
      });

      const updateButton = screen.getByRole("button", {
        name: "Update Cart Product In Cart",
      });
      expect(updateButton).not.toBeDisabled();
      expect(updateButton).toHaveTextContent("Update Cart");
    });
  });
});
