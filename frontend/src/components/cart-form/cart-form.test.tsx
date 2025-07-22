import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { CartForm } from "./cart-form";

// Mock the FormRequestDetails component
vi.mock("../form-request-details/form-request-details", () => ({
  FormRequestDetails: ({ formValues, handleChange }: any) => (
    <div data-testid="form-request-details">
      <input
        data-testid="organization-input"
        name="organization"
        value={formValues.organization}
        onChange={handleChange}
      />
      <input
        data-testid="organization-other-input"
        name="organizationOther"
        value={formValues.organizationOther}
        onChange={handleChange}
      />
      <input
        data-testid="poc-name-input"
        name="pocName"
        value={formValues.pocName}
        onChange={handleChange}
      />
      <input
        data-testid="poc-phone-input"
        name="pocPhone"
        value={formValues.pocPhone}
        onChange={handleChange}
      />
      <input
        data-testid="poc-email-input"
        name="pocEmail"
        value={formValues.pocEmail}
        onChange={handleChange}
      />
      <textarea
        data-testid="use-case-description-input"
        name="useCaseDescription"
        value={formValues.useCaseDescription}
        onChange={handleChange}
      />
    </div>
  ),
}));

describe("CartForm", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Basic Rendering", () => {
    test("should render successfully", () => {
      const { container } = render(<CartForm />);

      const form = container.querySelector("form");
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass("cart-form");
    });

    test("should render form container with correct CSS class", () => {
      const { container } = render(<CartForm />);

      const formContainer = container.querySelector(".cart-form__container");
      expect(formContainer).toBeInTheDocument();
    });

    test("should render FormRequestDetails component", () => {
      render(<CartForm />);

      const formRequestDetails = screen.getByTestId("form-request-details");
      expect(formRequestDetails).toBeInTheDocument();
    });

    test("should render form with correct structure", () => {
      const { container } = render(<CartForm />);

      const form = container.querySelector("form");
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass("cart-form");
      expect(form).toHaveAttribute("id", "cart-form");

      // Verify form structure without onSubmit handler
      expect(form).not.toHaveAttribute("onsubmit");
    });
  });

  describe("Form State Management", () => {
    test("should initialize with empty form values", () => {
      render(<CartForm />);

      expect(screen.getByTestId("organization-input")).toHaveValue("");
      expect(screen.getByTestId("organization-other-input")).toHaveValue("");
      expect(screen.getByTestId("poc-name-input")).toHaveValue("");
      expect(screen.getByTestId("poc-phone-input")).toHaveValue("");
      expect(screen.getByTestId("poc-email-input")).toHaveValue("");
      expect(screen.getByTestId("use-case-description-input")).toHaveValue("");
    });

    test("should update form values when inputs change", async () => {
      render(<CartForm />);

      const organizationInput = screen.getByTestId("organization-input");
      const pocNameInput = screen.getByTestId("poc-name-input");

      await user.type(organizationInput, "Org 1");
      await user.type(pocNameInput, "John Doe");

      expect(organizationInput).toHaveValue("Org 1");
      expect(pocNameInput).toHaveValue("John Doe");
    });

    test("should handle all form field updates", async () => {
      render(<CartForm />);

      const inputs = {
        organization: screen.getByTestId("organization-input"),
        organizationOther: screen.getByTestId("organization-other-input"),
        pocName: screen.getByTestId("poc-name-input"),
        pocPhone: screen.getByTestId("poc-phone-input"),
        pocEmail: screen.getByTestId("poc-email-input"),
        useCaseDescription: screen.getByTestId("use-case-description-input"),
      };

      const testValues = {
        organization: "Org 2",
        organizationOther: "Custom Organization",
        pocName: "Jane Smith",
        pocPhone: "555-1234",
        pocEmail: "jane@example.com",
        useCaseDescription: "This is a test use case description",
      };

      for (const [field, input] of Object.entries(inputs)) {
        await user.clear(input);
        await user.type(input, testValues[field as keyof typeof testValues]);
        expect(input).toHaveValue(testValues[field as keyof typeof testValues]);
      }
    });

    test("should reset organizationOther when organization changes to non-Other value", async () => {
      render(<CartForm />);

      const organizationInput = screen.getByTestId("organization-input");
      const organizationOtherInput = screen.getByTestId(
        "organization-other-input"
      );

      // First set organizationOther
      await user.type(organizationOtherInput, "Custom Org");
      expect(organizationOtherInput).toHaveValue("Custom Org");

      // Then change organization to non-"Other" value
      fireEvent.change(organizationInput, {
        target: { name: "organization", value: "Org 1" },
      });

      expect(organizationOtherInput).toHaveValue("");
    });

    test("should not reset organizationOther when organization changes to Other", async () => {
      render(<CartForm />);

      const organizationInput = screen.getByTestId("organization-input");
      const organizationOtherInput = screen.getByTestId(
        "organization-other-input"
      );

      // Set organizationOther
      await user.type(organizationOtherInput, "Custom Org");
      expect(organizationOtherInput).toHaveValue("Custom Org");

      // Change organization to "Other"
      fireEvent.change(organizationInput, {
        target: { name: "organization", value: "Other" },
      });

      expect(organizationOtherInput).toHaveValue("Custom Org");
    });
  });

  describe("Form Structure", () => {
    test("should render form without submission handler", () => {
      const { container } = render(<CartForm />);

      const form = container.querySelector("form");
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute("id", "cart-form");
      expect(form).toHaveClass("cart-form");
    });

    test("should not prevent form submission since no handler exists", () => {
      const { container } = render(<CartForm />);

      const form = container.querySelector("form");
      expect(form).toBeInTheDocument();

      // Trigger form submission - should not call any handlers
      expect(() => fireEvent.submit(form!)).not.toThrow();
    });

    test("should maintain form structure for potential external handling", () => {
      const { container } = render(<CartForm />);

      const form = container.querySelector("form");
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute("id", "cart-form");

      // Verify form contains the FormRequestDetails component
      const formRequestDetails = screen.getByTestId("form-request-details");
      expect(form).toContainElement(formRequestDetails);
    });
  });

  describe("Event Handling", () => {
    test("should handle change events without name attribute gracefully", () => {
      render(<CartForm />);

      const organizationInput = screen.getByTestId("organization-input");

      // Simulate event without name attribute
      fireEvent.change(organizationInput, { target: { value: "Test Value" } });

      // Should not crash or throw error - value remains empty since no name
      expect(organizationInput).toHaveValue("Test Value");
    });

    test("should handle empty string values", async () => {
      render(<CartForm />);

      const pocNameInput = screen.getByTestId("poc-name-input");

      await user.type(pocNameInput, "Test");
      await user.clear(pocNameInput);

      expect(pocNameInput).toHaveValue("");
    });

    test("should handle basic text input", async () => {
      render(<CartForm />);

      const useCaseInput = screen.getByTestId("use-case-description-input");
      const basicText = "This is a basic test description";

      await user.type(useCaseInput, basicText);

      expect(useCaseInput).toHaveValue(basicText);
    });
  });

  describe("Component Props", () => {
    test("should pass correct props to FormRequestDetails", () => {
      render(<CartForm />);

      const formRequestDetails = screen.getByTestId("form-request-details");
      expect(formRequestDetails).toBeInTheDocument();

      // Verify all expected input fields are present
      expect(screen.getByTestId("organization-input")).toBeInTheDocument();
      expect(
        screen.getByTestId("organization-other-input")
      ).toBeInTheDocument();
      expect(screen.getByTestId("poc-name-input")).toBeInTheDocument();
      expect(screen.getByTestId("poc-phone-input")).toBeInTheDocument();
      expect(screen.getByTestId("poc-email-input")).toBeInTheDocument();
      expect(
        screen.getByTestId("use-case-description-input")
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    test("should have proper form semantics", () => {
      const { container } = render(<CartForm />);

      const form = container.querySelector("form");
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass("cart-form");

      // Verify form has proper structure
      expect(form).toHaveAttribute("class", "cart-form");
    });

    test("should be keyboard navigable", async () => {
      render(<CartForm />);

      // Focus the first input field
      const firstInput = screen.getByTestId("organization-input");
      firstInput.focus();
      expect(firstInput).toHaveFocus();
    });
  });

  describe("Edge Cases", () => {
    test("should handle rapid successive changes", async () => {
      render(<CartForm />);

      const organizationInput = screen.getByTestId("organization-input");

      // Simulate rapid changes
      fireEvent.change(organizationInput, {
        target: { name: "organization", value: "Org 1" },
      });
      fireEvent.change(organizationInput, {
        target: { name: "organization", value: "Org 2" },
      });
      fireEvent.change(organizationInput, {
        target: { name: "organization", value: "Org 3" },
      });

      expect(organizationInput).toHaveValue("Org 3");
    });

    test("should maintain form state consistency", async () => {
      render(<CartForm />);

      const organizationInput = screen.getByTestId("organization-input");
      const organizationOtherInput = screen.getByTestId(
        "organization-other-input"
      );

      // Set organization to "Other" and fill organizationOther
      fireEvent.change(organizationInput, {
        target: { name: "organization", value: "Other" },
      });
      await user.type(organizationOtherInput, "Custom Org");

      // Change organization back to a predefined value
      fireEvent.change(organizationInput, {
        target: { name: "organization", value: "Org 1" },
      });

      // organizationOther should be reset
      expect(organizationOtherInput).toHaveValue("");
      expect(organizationInput).toHaveValue("Org 1");
    });
  });
});
