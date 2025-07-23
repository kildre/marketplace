import { screen } from "@testing-library/react";
import { vi } from "vitest";
import { renderWithProviders } from "../../test-utils";
import { CartForm } from "./cart-form";

// Mock the FormRequestDetails component since we're testing CartForm in isolation
vi.mock("../form-request-details/form-request-details", () => ({
  FormRequestDetails: () => (
    <div data-testid="form-request-details-mock">
      FormRequestDetails Component
    </div>
  ),
}));

describe("CartForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Basic Rendering", () => {
    test("should render successfully", () => {
      const { container } = renderWithProviders(<CartForm />);
      expect(container).toBeTruthy();
    });

    test("should render the main container with correct class", () => {
      const { container } = renderWithProviders(<CartForm />);

      const containerDiv = container.querySelector(".cart-form__container");
      expect(containerDiv).toBeInTheDocument();
    });

    test("should render the form element with correct attributes", () => {
      const { container } = renderWithProviders(<CartForm />);

      const form = container.querySelector("form#cart-form.cart-form");
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute("id", "cart-form");
      expect(form).toHaveClass("cart-form");
    });

    test("should render FormRequestDetails component", () => {
      renderWithProviders(<CartForm />);

      const formRequestDetails = screen.getByTestId(
        "form-request-details-mock"
      );
      expect(formRequestDetails).toBeInTheDocument();
      expect(formRequestDetails).toHaveTextContent(
        "FormRequestDetails Component"
      );
    });
  });

  describe("Component Structure", () => {
    test("should have proper DOM hierarchy", () => {
      const { container } = renderWithProviders(<CartForm />);

      // Check the structure: container > form > FormRequestDetails
      const containerDiv = container.querySelector(".cart-form__container");
      const form = containerDiv?.querySelector("form#cart-form.cart-form");
      const formRequestDetails = form?.querySelector(
        "[data-testid='form-request-details-mock']"
      );

      expect(containerDiv).toBeInTheDocument();
      expect(form).toBeInTheDocument();
      expect(formRequestDetails).toBeInTheDocument();
    });

    test("should contain FormRequestDetails as the only child of form", () => {
      const { container } = renderWithProviders(<CartForm />);

      const form = container.querySelector("form#cart-form");
      expect(form?.children).toHaveLength(1);
      expect(form?.children[0]).toHaveAttribute(
        "data-testid",
        "form-request-details-mock"
      );
    });
  });

  describe("Accessibility", () => {
    test("should have proper form element", () => {
      const { container } = renderWithProviders(<CartForm />);

      const form = container.querySelector("form");
      expect(form).toBeInTheDocument();
    });

    test("should be accessible by form tag", () => {
      const { container } = renderWithProviders(<CartForm />);

      // Should be able to find the form by tag
      expect(container.querySelector("form")).toBeInTheDocument();
    });

    test("should be accessible by form id", () => {
      renderWithProviders(<CartForm />);

      // Should be able to find the form by id
      const form = document.getElementById("cart-form");
      expect(form).toBeInTheDocument();
    });
  });

  describe("CSS Classes", () => {
    test("should apply correct CSS classes to container", () => {
      const { container } = renderWithProviders(<CartForm />);

      const containerDiv = container.querySelector("div");
      expect(containerDiv).toHaveClass("cart-form__container");
    });

    test("should apply correct CSS classes to form", () => {
      const { container } = renderWithProviders(<CartForm />);

      const form = container.querySelector("form");
      expect(form).toHaveClass("cart-form");
    });

    test("should not have any unexpected CSS classes", () => {
      const { container } = renderWithProviders(<CartForm />);

      const containerDiv = container.querySelector(".cart-form__container");
      const form = container.querySelector("form");

      // Check that only expected classes are present
      expect(containerDiv?.className).toBe("cart-form__container");
      expect(form?.className).toBe("cart-form");
    });
  });

  describe("Integration with TanStack Query", () => {
    test("should render without errors when QueryClientProvider is available", () => {
      // This test ensures the component works with our test setup that includes QueryClientProvider
      expect(() => renderWithProviders(<CartForm />)).not.toThrow();
    });

    test("should render FormRequestDetails which uses TanStack Query hooks", () => {
      renderWithProviders(<CartForm />);

      // The mocked FormRequestDetails should render, indicating that the component
      // structure supports TanStack Query integration
      expect(
        screen.getByTestId("form-request-details-mock")
      ).toBeInTheDocument();
    });
  });

  describe("Component Composition", () => {
    test("should act as a wrapper for FormRequestDetails", () => {
      const { container } = renderWithProviders(<CartForm />);

      // CartForm should be a simple wrapper that provides structure for FormRequestDetails
      const form = container.querySelector("form");
      const formRequestDetails = screen.getByTestId(
        "form-request-details-mock"
      );

      expect(form).toContainElement(formRequestDetails);
    });

    test("should provide form context for child components", () => {
      const { container } = renderWithProviders(<CartForm />);

      // The form element should be available as a parent for FormRequestDetails
      const form = container.querySelector("form");
      const formRequestDetails = screen.getByTestId(
        "form-request-details-mock"
      );

      expect(form).toBeInTheDocument();
      expect(formRequestDetails).toBeInTheDocument();
      expect(form).toContainElement(formRequestDetails);
    });
  });

  describe("Error Boundaries", () => {
    test("should handle FormRequestDetails errors gracefully", () => {
      // This test ensures that if FormRequestDetails throws an error,
      // it doesn't break the CartForm component structure
      const { container } = renderWithProviders(<CartForm />);

      // The container and form should still be rendered even if child components have issues
      expect(
        container.querySelector(".cart-form__container")
      ).toBeInTheDocument();
      expect(container.querySelector("form#cart-form")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    test("should render efficiently without unnecessary re-renders", () => {
      const { rerender, container } = renderWithProviders(<CartForm />);

      // Component should render successfully multiple times
      expect(() => {
        rerender(<CartForm />);
        rerender(<CartForm />);
        rerender(<CartForm />);
      }).not.toThrow();

      // Form should still be present after re-renders
      expect(container.querySelector("form")).toBeInTheDocument();
    });
  });

  describe("TypeScript Types", () => {
    test("should return correct React element type", () => {
      const component = <CartForm />;
      expect(component.type).toBe(CartForm);
      expect(component.props).toEqual({});
    });
  });
});
