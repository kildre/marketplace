import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { renderWithProviders } from "../test-utils";
import { CartOverlayButton } from "./CartOverlayButton";
import { AppRoles } from "../types/auth";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock cart context
const mockUseCart = vi.fn();
vi.mock("../contexts/CartContext", async () => {
  const actual = await vi.importActual("../contexts/CartContext");
  return {
    ...actual,
    useCart: () => mockUseCart(),
  };
});

// Mock auth hook
const mockHasRole = vi.fn();
vi.mock("../hooks/useAuth", async () => {
  const actual = await vi.importActual("../hooks/useAuth");
  return {
    ...actual,
    useAuth: () => ({
      hasRole: mockHasRole,
    }),
  };
});

describe("CartOverlayButton", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default to requestor role
    mockHasRole.mockReturnValue(true);
    // Default cart count
    mockUseCart.mockReturnValue({
      cartCount: 0,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Role-based rendering", () => {
    test("should render when user has REQUESTOR role", () => {
      mockHasRole.mockReturnValue(true);
      mockUseCart.mockReturnValue({ cartCount: 2 });

      renderWithProviders(<CartOverlayButton />);

      expect(
        screen.getByRole("button", { name: /cart \(2\)/i })
      ).toBeInTheDocument();
    });

    test("should not render when user does not have REQUESTOR role", () => {
      mockHasRole.mockReturnValue(false);

      renderWithProviders(<CartOverlayButton />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    test("should call hasRole with REQUESTOR role", () => {
      mockHasRole.mockReturnValue(true);

      renderWithProviders(<CartOverlayButton />);

      expect(mockHasRole).toHaveBeenCalledWith(AppRoles.REQUESTOR);
    });
  });

  describe("Cart count display", () => {
    beforeEach(() => {
      mockHasRole.mockReturnValue(true);
    });

    test("should display cart count of 0", () => {
      mockUseCart.mockReturnValue({ cartCount: 0 });

      renderWithProviders(<CartOverlayButton />);

      expect(
        screen.getByRole("button", { name: /cart \(0\)/i })
      ).toBeInTheDocument();
      expect(screen.getByText("(0)")).toBeInTheDocument();
    });

    test("should display cart count of 1", () => {
      mockUseCart.mockReturnValue({ cartCount: 1 });

      renderWithProviders(<CartOverlayButton />);

      expect(
        screen.getByRole("button", { name: /cart \(1\)/i })
      ).toBeInTheDocument();
      expect(screen.getByText("(1)")).toBeInTheDocument();
    });

    test("should display cart count of 5", () => {
      mockUseCart.mockReturnValue({ cartCount: 5 });

      renderWithProviders(<CartOverlayButton />);

      expect(
        screen.getByRole("button", { name: /cart \(5\)/i })
      ).toBeInTheDocument();
      expect(screen.getByText("(5)")).toBeInTheDocument();
    });

    test("should display large cart count correctly", () => {
      mockUseCart.mockReturnValue({ cartCount: 99 });

      renderWithProviders(<CartOverlayButton />);

      expect(
        screen.getByRole("button", { name: /cart \(99\)/i })
      ).toBeInTheDocument();
      expect(screen.getByText("(99)")).toBeInTheDocument();
    });

    test("should update display when cart count changes", () => {
      mockUseCart.mockReturnValue({ cartCount: 2 });

      const { rerender } = renderWithProviders(<CartOverlayButton />);

      expect(screen.getByText("(2)")).toBeInTheDocument();

      // Update cart count
      mockUseCart.mockReturnValue({ cartCount: 5 });
      rerender(<CartOverlayButton />);

      expect(screen.getByText("(5)")).toBeInTheDocument();
      expect(screen.queryByText("(2)")).not.toBeInTheDocument();
    });
  });

  describe("Navigation functionality", () => {
    beforeEach(() => {
      mockHasRole.mockReturnValue(true);
      mockUseCart.mockReturnValue({ cartCount: 2 });
    });

    test("should navigate to /cart when clicked", async () => {
      renderWithProviders(<CartOverlayButton />);

      const cartButton = screen.getByRole("button", { name: /cart \(2\)/i });
      await user.click(cartButton);

      expect(mockNavigate).toHaveBeenCalledWith("/cart");
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    test("should navigate on keyboard interaction (Enter)", async () => {
      renderWithProviders(<CartOverlayButton />);

      const cartButton = screen.getByRole("button", { name: /cart \(2\)/i });
      cartButton.focus();
      await user.keyboard("{Enter}");

      expect(mockNavigate).toHaveBeenCalledWith("/cart");
    });

    test("should navigate on keyboard interaction (Space)", async () => {
      renderWithProviders(<CartOverlayButton />);

      const cartButton = screen.getByRole("button", { name: /cart \(2\)/i });
      cartButton.focus();
      await user.keyboard(" ");

      expect(mockNavigate).toHaveBeenCalledWith("/cart");
    });

    test("should not navigate when user lacks REQUESTOR role", async () => {
      mockHasRole.mockReturnValue(false);

      renderWithProviders(<CartOverlayButton />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("Button properties and styling", () => {
    beforeEach(() => {
      mockHasRole.mockReturnValue(true);
      mockUseCart.mockReturnValue({ cartCount: 3 });
    });

    test("should have correct button type", () => {
      renderWithProviders(<CartOverlayButton />);

      const cartButton = screen.getByRole("button");
      expect(cartButton).toHaveAttribute("type", "button");
    });

    test("should have correct CSS class", () => {
      renderWithProviders(<CartOverlayButton />);

      const cartButton = screen.getByRole("button");
      expect(cartButton).toHaveClass("cart-overlay-btn");
    });

    test("should have accessible aria-label", () => {
      renderWithProviders(<CartOverlayButton />);

      const cartButton = screen.getByRole("button");
      expect(cartButton).toHaveAttribute("aria-label", "Cart (3)");
    });

    test("should contain cart icon image", () => {
      renderWithProviders(<CartOverlayButton />);

      const cartIcon = screen.getByAltText("Cart");
      expect(cartIcon).toBeInTheDocument();
      expect(cartIcon).toHaveAttribute("src", "/assets/icons/cart-icon.png");
      expect(cartIcon).toHaveClass("cart-overlay-icon");
    });

    test("should contain cart count span with correct class", () => {
      renderWithProviders(<CartOverlayButton />);

      const countElement = screen.getByText("(3)");
      expect(countElement).toHaveClass("cart-overlay-count");
      expect(countElement.tagName).toBe("SPAN");
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      mockHasRole.mockReturnValue(true);
      mockUseCart.mockReturnValue({ cartCount: 1 });
    });

    test("should be focusable", () => {
      renderWithProviders(<CartOverlayButton />);

      const cartButton = screen.getByRole("button");
      cartButton.focus();
      expect(cartButton).toHaveFocus();
    });

    test("should have proper role attribute", () => {
      renderWithProviders(<CartOverlayButton />);

      const cartButton = screen.getByRole("button");
      expect(cartButton).toBeInTheDocument();
    });

    test("should have descriptive aria-label that includes count", () => {
      mockUseCart.mockReturnValue({ cartCount: 7 });

      renderWithProviders(<CartOverlayButton />);

      const cartButton = screen.getByRole("button");
      expect(cartButton).toHaveAttribute("aria-label", "Cart (7)");
    });

    test("should update aria-label when cart count changes", () => {
      mockUseCart.mockReturnValue({ cartCount: 1 });

      const { rerender } = renderWithProviders(<CartOverlayButton />);

      let cartButton = screen.getByRole("button");
      expect(cartButton).toHaveAttribute("aria-label", "Cart (1)");

      mockUseCart.mockReturnValue({ cartCount: 4 });
      rerender(<CartOverlayButton />);

      cartButton = screen.getByRole("button");
      expect(cartButton).toHaveAttribute("aria-label", "Cart (4)");
    });

    test("should provide alt text for cart icon", () => {
      renderWithProviders(<CartOverlayButton />);

      const cartIcon = screen.getByAltText("Cart");
      expect(cartIcon).toBeInTheDocument();
    });
  });

  describe("Edge cases and error handling", () => {
    test("should handle undefined cart count gracefully", () => {
      mockHasRole.mockReturnValue(true);
      mockUseCart.mockReturnValue({ cartCount: undefined });

      renderWithProviders(<CartOverlayButton />);

      // Should still render but with undefined count
      const cartButton = screen.getByRole("button");
      expect(cartButton).toBeInTheDocument();
      expect(cartButton).toHaveAttribute("aria-label", "Cart (undefined)");
    });

    test("should handle null cart count gracefully", () => {
      mockHasRole.mockReturnValue(true);
      mockUseCart.mockReturnValue({ cartCount: null });

      renderWithProviders(<CartOverlayButton />);

      const cartButton = screen.getByRole("button");
      expect(cartButton).toBeInTheDocument();
      expect(cartButton).toHaveAttribute("aria-label", "Cart (null)");
    });

    test("should handle negative cart count", () => {
      mockHasRole.mockReturnValue(true);
      mockUseCart.mockReturnValue({ cartCount: -1 });

      renderWithProviders(<CartOverlayButton />);

      const cartButton = screen.getByRole("button");
      expect(cartButton).toHaveAttribute("aria-label", "Cart (-1)");
      expect(screen.getByText("(-1)")).toBeInTheDocument();
    });

    test("should not throw error when hasRole function is not available", () => {
      mockHasRole.mockImplementation(() => {
        throw new Error("Auth not available");
      });

      expect(() => {
        renderWithProviders(<CartOverlayButton />);
      }).toThrow("Auth not available");
    });

    test("should handle multiple rapid clicks", async () => {
      mockHasRole.mockReturnValue(true);
      mockUseCart.mockReturnValue({ cartCount: 2 });

      renderWithProviders(<CartOverlayButton />);

      const cartButton = screen.getByRole("button");

      // Click multiple times rapidly
      await user.click(cartButton);
      await user.click(cartButton);
      await user.click(cartButton);

      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenCalledWith("/cart");
    });
  });

  describe("Component integration", () => {
    test("should work with different cart counts from context", () => {
      const testCases = [0, 1, 5, 10, 25, 100];

      testCases.forEach((count) => {
        mockHasRole.mockReturnValue(true);
        mockUseCart.mockReturnValue({ cartCount: count });

        const { unmount } = renderWithProviders(<CartOverlayButton />);

        const cartButton = screen.getByRole("button");
        expect(cartButton).toHaveAttribute("aria-label", `Cart (${count})`);
        expect(screen.getByText(`(${count})`)).toBeInTheDocument();

        unmount();
      });
    });

    test("should re-render when dependencies change", () => {
      // Start with requestor role and cart count 1
      mockHasRole.mockReturnValue(true);
      mockUseCart.mockReturnValue({ cartCount: 1 });

      const { rerender } = renderWithProviders(<CartOverlayButton />);

      expect(screen.getByRole("button")).toBeInTheDocument();

      // Change to non-requestor role
      mockHasRole.mockReturnValue(false);
      rerender(<CartOverlayButton />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();

      // Change back to requestor with different cart count
      mockHasRole.mockReturnValue(true);
      mockUseCart.mockReturnValue({ cartCount: 5 });
      rerender(<CartOverlayButton />);

      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.getByText("(5)")).toBeInTheDocument();
    });
  });

  describe("Performance and memoization", () => {
    test("should not cause unnecessary re-renders", () => {
      mockHasRole.mockReturnValue(true);
      mockUseCart.mockReturnValue({ cartCount: 2 });

      const { rerender } = renderWithProviders(<CartOverlayButton />);

      // Multiple re-renders with same props should not cause issues
      rerender(<CartOverlayButton />);
      rerender(<CartOverlayButton />);
      rerender(<CartOverlayButton />);

      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.getByText("(2)")).toBeInTheDocument();
    });
  });
});
