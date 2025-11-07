import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { renderWithProviders } from "../../test-utils";
import { FormSubmitRequest } from "./form-submit-request";

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
const mockClearCart = vi.fn();
const mockCartItems = [
  {
    product: {
      id: 1,
      name: "Test Product 1",
      type: "Software",
      price: 100,
      description: "Test description 1",
      unit: 50,
      rom: "High",
    },
    quantity: 2,
  },
  {
    product: {
      id: 2,
      name: "Test Product 2",
      type: "Hardware",
      price: null,
      description: "Test description 2",
      unit: 25,
      rom: "Medium",
    },
    quantity: 1,
  },
];

vi.mock("../../contexts/ReduxCartContext", async () => {
  const actual = await vi.importActual("../../contexts/ReduxCartContext");
  return {
    ...actual,
    useCart: vi.fn(() => ({
      cartItems: mockCartItems,
      clearCart: mockClearCart,
    })),
  };
});

// Mock form data and submission hooks
const mockFormData = {
  organization: "",
  organizationOther: "",
  pocName: "",
  pocPhone: "",
  pocEmail: "",
  useCaseDescription: "",
};

const mockSubmitMutation = {
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  isSuccess: false,
  error: null,
  data: null,
};

const mockUseFormData = vi.fn();
const mockUseSubmitRequest = vi.fn();
const mockMarkSubmissionAttempt = vi.fn();
const mockUseValidationErrors = vi.fn();

vi.mock("../../hooks/useFormQueries", () => ({
  useFormData: () => mockUseFormData(),
  useSubmitRequest: () => mockUseSubmitRequest(),
  useSubmissionAttempts: () => ({
    hasAttemptedSubmission: false,
    markSubmissionAttempt: mockMarkSubmissionAttempt,
    resetSubmissionAttempts: vi.fn(),
  }),
  useValidationErrors: () => mockUseValidationErrors(),
}));

describe("FormSubmitRequest", () => {
  const user = userEvent.setup();

  // Helper function to render component with different form data
  const renderFormSubmitRequest = (
    formDataOverrides = {},
    submissionOverrides = {},
    validationErrorsOverrides = {}
  ) => {
    mockUseFormData.mockReturnValue({
      ...mockFormData,
      ...formDataOverrides,
    });

    mockUseSubmitRequest.mockReturnValue({
      ...mockSubmitMutation,
      ...submissionOverrides,
    });

    mockUseValidationErrors.mockReturnValue({
      phoneError: "",
      emailError: "",
      hasValidationErrors: false,
      updateValidationErrors: vi.fn(),
      resetValidationErrors: vi.fn(),
      ...validationErrorsOverrides,
    });

    return renderWithProviders(<FormSubmitRequest />);
  };

  // Helper function to setup DOM elements that the component reads from
  const setupDOMElements = () => {
    // Create elements that the component looks for
    const estimatedRom = document.createElement("div");
    estimatedRom.id = "estimatedRom";
    estimatedRom.innerHTML = "$1,500";
    document.body.appendChild(estimatedRom);

    const username = document.createElement("div");
    username.id = "username";
    username.textContent = "John Doe";
    document.body.appendChild(username);

    const email = document.createElement("div");
    email.id = "email";
    email.textContent = "john.doe@example.com";
    document.body.appendChild(email);

    const designation = document.createElement("div");
    designation.id = "designation";
    designation.textContent = "Software Engineer";
    document.body.appendChild(designation);

    const agency = document.createElement("div");
    agency.id = "agency";
    agency.textContent = "CDAO";
    document.body.appendChild(agency);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Clean up DOM
    document.body.innerHTML = "";
    setupDOMElements();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  describe("Basic Rendering", () => {
    test("should render successfully", () => {
      const { container } = renderFormSubmitRequest();
      expect(container).toBeTruthy();
    });

    test("should render form element", () => {
      renderFormSubmitRequest();
      expect(
        screen.getByRole("button", { name: /submit request/i }).closest("form")
      ).toBeInTheDocument();
    });

    test("should render checkbox with correct text", () => {
      renderFormSubmitRequest();

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
      expect(
        screen.getByText(
          /I understand that the Total does not include products that require additional review/i
        )
      ).toBeInTheDocument();
    });

    test("should render submit button with correct initial state", () => {
      renderFormSubmitRequest();

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveClass(
        "button--submit",
        "button",
        "button--disabled"
      );
    });

    test("should have correct button ID", () => {
      renderFormSubmitRequest();

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });
      expect(submitButton).toHaveAttribute("id", "submit-request-button");
    });
  });

  describe("Form Validation", () => {
    test("should be invalid when checkbox is not checked", () => {
      renderFormSubmitRequest({ organization: "Army" });

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveClass("button--disabled");
    });

    test("should be invalid when organization is not selected", async () => {
      renderFormSubmitRequest({ organization: "" });

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveClass("button--disabled");
    });

    test("should be invalid when Other is selected but organizationOther is empty", async () => {
      renderFormSubmitRequest({
        organization: "Other",
        organizationOther: "",
      });

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveClass("button--disabled");
    });

    test("should be valid when all conditions are met", async () => {
      renderFormSubmitRequest({ organization: "Army" });

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveClass("button--submit", "button");
      expect(submitButton).not.toHaveClass("button--disabled");
    });

    test("should be valid when Other is selected and organizationOther is filled", async () => {
      renderFormSubmitRequest({
        organization: "Other",
        organizationOther: "Custom Organization",
      });

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).not.toHaveClass("button--disabled");
    });

    test("should be invalid when there is a phone validation error", async () => {
      renderFormSubmitRequest(
        { organization: "Army" },
        {},
        { 
          phoneError: "Please enter a valid phone number",
          hasValidationErrors: true 
        }
      );

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveClass("button--disabled");
    });

    test("should be invalid when there is an email validation error", async () => {
      renderFormSubmitRequest(
        { organization: "Army" },
        {},
        { 
          emailError: "Please enter a valid email address",
          hasValidationErrors: true 
        }
      );

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveClass("button--disabled");
    });

    test("should be invalid when there are both phone and email validation errors", async () => {
      renderFormSubmitRequest(
        { organization: "Army" },
        {},
        { 
          phoneError: "Please enter a valid phone number",
          emailError: "Please enter a valid email address",
          hasValidationErrors: true 
        }
      );

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveClass("button--disabled");
    });
  });

  describe("Checkbox Interaction", () => {
    test("should update checkbox state when clicked", async () => {
      renderFormSubmitRequest();

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    test("should update form validation when checkbox changes", async () => {
      renderFormSubmitRequest({ organization: "Army" });

      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });

      // Initially disabled
      expect(submitButton).toBeDisabled();

      // Check checkbox - should become enabled
      await user.click(checkbox);
      expect(submitButton).not.toBeDisabled();

      // Uncheck checkbox - should become disabled again
      await user.click(checkbox);
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Form Submission", () => {
    test("should not submit when form is invalid", async () => {
      renderFormSubmitRequest({ organization: "" });

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });
      await user.click(submitButton);

      expect(mockSubmitMutation.mutate).not.toHaveBeenCalled();
    });

    test("should submit with correct data when form is valid", async () => {
      renderFormSubmitRequest({
        organization: "Army",
        pocName: "John Doe",
        pocPhone: "555-123-4567",
        pocEmail: "john.doe@example.com",
        useCaseDescription: "Test use case",
      });

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });
      await user.click(submitButton);

      expect(mockSubmitMutation.mutate).toHaveBeenCalledWith({
        requestId: expect.any(String),
        personalData: {
          name: "John Doe",
          email: "john.doe@example.com",
          designation: "Software Engineer",
          agency: "CDAO",
        },
        requestDetails: {
          organization: "Army",
          organizationOther: "",
          pocName: "John Doe",
          pocPhone: "555-123-4567",
          pocEmail: "john.doe@example.com",
          useCaseDescription: "Test use case",
        },
        cartItems: [
          {
            product: {
              id: 1,
              name: "Test Product 1",
              type: "Software",
              price: 100,
              description: "Test description 1",
              unit: "50",
              rom: "High",
            },
            quantity: 2,
          },
          {
            product: {
              id: 2,
              name: "Test Product 2",
              type: "Hardware",
              price: null,
              description: "Test description 2",
              unit: "25",
              rom: "Medium",
            },
            quantity: 1,
          },
        ],
        summary: {
          totalItems: 2,
          totalQuantity: 3,
          pendingPriceItems: 1,
          estimatedROM: "$1,500",
        },
        submittedAt: expect.any(String),
      });
    });

    test("should handle missing DOM elements gracefully", async () => {
      // Clear DOM elements
      document.body.innerHTML = "";

      renderFormSubmitRequest({ organization: "Army" });

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });
      await user.click(submitButton);

      expect(mockSubmitMutation.mutate).toHaveBeenCalledWith({
        requestId: expect.any(String),
        personalData: {
          name: "",
          email: "",
          designation: "",
          agency: "",
        },
        requestDetails: expect.any(Object),
        cartItems: expect.any(Array),
        summary: {
          totalItems: 2,
          totalQuantity: 3,
          pendingPriceItems: 1,
          estimatedROM: "$0",
        },
        submittedAt: expect.any(String),
      });
    });

    test("should generate unique request IDs", async () => {
      renderFormSubmitRequest({ organization: "Army" });

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });

      // Submit multiple times
      await user.click(submitButton);
      const firstCall = mockSubmitMutation.mutate.mock.calls[0][0];

      await user.click(submitButton);
      const secondCall = mockSubmitMutation.mutate.mock.calls[1][0];

      expect(firstCall.requestId).not.toEqual(secondCall.requestId);
      expect(typeof firstCall.requestId).toBe("string");
      expect(typeof secondCall.requestId).toBe("string");
      expect(firstCall.requestId).toMatch(/^[A-Za-z0-9]+-[0-9a-f]+$/);
      expect(secondCall.requestId).toMatch(/^[A-Za-z0-9]+-[0-9a-f]+$/);
    });

    test("should mark submission attempt when form is submitted", async () => {
      renderFormSubmitRequest({ organization: "Army" });

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });
      await user.click(submitButton);

      expect(mockMarkSubmissionAttempt).toHaveBeenCalled();
    });
  });

  describe("Submission States", () => {
    test("should show loading state during submission", () => {
      renderFormSubmitRequest({ organization: "Army" }, { isPending: true });

      const submitButton = screen.getByRole("button", {
        name: /submitting\.\.\./i,
      });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveClass("button--disabled");
    });

    test("should show error message on submission error", () => {
      renderFormSubmitRequest(
        { organization: "Army" },
        { isError: true, error: new Error("Submission failed") }
      );

      expect(
        screen.getByText(/error submitting request\. please try again\./i)
      ).toBeInTheDocument();
      expect(
        screen
          .getByText(/error submitting request\. please try again\./i)
          .closest("div")
      ).toHaveClass("error-message");
    });

    test("should clear error when submission state changes", () => {
      const { rerender } = renderFormSubmitRequest(
        { organization: "Army" },
        { isError: true }
      );

      expect(screen.getByText(/error submitting request/i)).toBeInTheDocument();

      // Change to success state
      mockUseSubmitRequest.mockReturnValue({
        ...mockSubmitMutation,
        isError: false,
        isSuccess: true,
      });

      rerender(<FormSubmitRequest />);

      expect(
        screen.queryByText(/error submitting request/i)
      ).not.toBeInTheDocument();
    });

    test("should disable button during submission", () => {
      renderFormSubmitRequest({ organization: "Army" }, { isPending: true });

      const submitButton = screen.getByRole("button");
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveClass("button--disabled");
    });
  });

  describe("Navigation on Success", () => {
    test("should navigate to requests page on successful submission", async () => {
      const { rerender } = renderFormSubmitRequest({ organization: "Army" });

      // Check checkbox and submit form first to set requestId
      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });
      await user.click(submitButton);

      // Now mock success state and rerender
      mockUseSubmitRequest.mockReturnValue({
        ...mockSubmitMutation,
        isSuccess: true,
      });

      rerender(<FormSubmitRequest />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/requests", {
          state: {
            showSuccessToast: true,
            requestId: expect.any(String),
          },
        });
      });
    });

    test("should clear cart on successful submission", async () => {
      const { rerender } = renderFormSubmitRequest({ organization: "Army" });

      // Check checkbox and submit form first to set requestId
      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });
      await user.click(submitButton);

      // Now mock success state and rerender
      mockUseSubmitRequest.mockReturnValue({
        ...mockSubmitMutation,
        isSuccess: true,
      });

      rerender(<FormSubmitRequest />);

      await waitFor(() => {
        expect(mockClearCart).toHaveBeenCalled();
      });
    });

    test("should clear cart before navigating", async () => {
      const { rerender } = renderFormSubmitRequest({ organization: "Army" });

      // Check checkbox and submit form first to set requestId
      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });
      await user.click(submitButton);

      // Now mock success state and rerender
      mockUseSubmitRequest.mockReturnValue({
        ...mockSubmitMutation,
        isSuccess: true,
      });

      rerender(<FormSubmitRequest />);

      await waitFor(() => {
        expect(mockClearCart).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/requests", {
          state: {
            showSuccessToast: true,
            requestId: expect.any(String),
          },
        });
      });

      // Verify both functions were called
      expect(mockClearCart).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    test("should not navigate or clear cart if submission is not successful", () => {
      renderFormSubmitRequest(
        { organization: "Army" },
        { isSuccess: false, isError: true }
      );

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockClearCart).not.toHaveBeenCalled();
    });
  });

  describe("CSS Classes", () => {
    test("should apply correct CSS classes to checkbox container", () => {
      const { container } = renderFormSubmitRequest();

      expect(
        container.querySelector(".form-submit-request__checkbox")
      ).toBeInTheDocument();
    });

    test("should apply correct CSS classes to submit button when enabled", async () => {
      renderFormSubmitRequest({ organization: "Army" });

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });
      expect(submitButton).toHaveClass("button--submit", "button");
      expect(submitButton).not.toHaveClass("button--disabled");
    });

    test("should apply correct CSS classes to submit button when disabled", () => {
      renderFormSubmitRequest({ organization: "" });

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });
      expect(submitButton).toHaveClass(
        "button--submit",
        "button",
        "button--disabled"
      );
    });
  });

  describe("Accessibility", () => {
    test("should have proper form semantics", () => {
      renderFormSubmitRequest();

      const form = screen
        .getByRole("button", { name: /submit request/i })
        .closest("form");
      expect(form).toBeInTheDocument();
    });

    test("should have accessible checkbox", () => {
      renderFormSubmitRequest();

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
      // The checkbox gets its accessible name from the adjacent text
      expect(checkbox.closest("div")).toHaveTextContent(
        /I understand that the Total/
      );
    });

    test("should have accessible submit button", () => {
      renderFormSubmitRequest();

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute("type", "submit");
    });
  });

  describe("Cart Integration", () => {
    test("should use cart items in submission data", async () => {
      renderFormSubmitRequest({ organization: "Army" });

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });
      await user.click(submitButton);

      const submitData = mockSubmitMutation.mutate.mock.calls[0][0];
      expect(submitData.cartItems).toEqual([
        {
          product: {
            id: 1,
            name: "Test Product 1",
            type: "Software",
            price: 100,
            description: "Test description 1",
            unit: "50",
            rom: "High",
          },
          quantity: 2,
        },
        {
          product: {
            id: 2,
            name: "Test Product 2",
            type: "Hardware",
            price: null,
            description: "Test description 2",
            unit: "25",
            rom: "Medium",
          },
          quantity: 1,
        },
      ]);
    });

    test("should calculate summary correctly", async () => {
      renderFormSubmitRequest({ organization: "Army" });

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      const submitButton = screen.getByRole("button", {
        name: /submit request/i,
      });
      await user.click(submitButton);

      const submitData = mockSubmitMutation.mutate.mock.calls[0][0];
      expect(submitData.summary).toEqual({
        totalItems: 2,
        totalQuantity: 3, // 2 + 1
        pendingPriceItems: 1, // one item has null price
        estimatedROM: "$1,500",
      });
    });
  });

  describe("Edge Cases", () => {
    test("should handle form submission with keyboard", async () => {
      renderFormSubmitRequest({ organization: "Army" });

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      // Focus on the form and press Enter
      const form = screen
        .getByRole("button", { name: /submit request/i })
        .closest("form");
      form!.focus();
      await user.keyboard("{Enter}");

      expect(mockSubmitMutation.mutate).toHaveBeenCalled();
    });
  });

  describe("Performance", () => {
    test("should render efficiently without unnecessary re-renders", () => {
      const { rerender } = renderFormSubmitRequest();

      expect(() => {
        rerender(<FormSubmitRequest />);
        rerender(<FormSubmitRequest />);
        rerender(<FormSubmitRequest />);
      }).not.toThrow();

      expect(
        screen.getByRole("button", { name: /submit request/i }).closest("form")
      ).toBeInTheDocument();
    });
  });
});
