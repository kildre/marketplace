import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import { renderWithProviders } from "../../test-utils";
import { RequestDetailView } from "./request-detail-view";
import { RequestDetailViewProps, RequestData } from "../../interfaces";

// Mock the child components
vi.mock("../form-request-details/form-request-details", () => ({
  FormRequestDetails: vi.fn(({ mode, viewData }) => (
    <div data-testid="form-request-details" data-mode={mode}>
      Request Details: {viewData?.pocName || "Mock POC"}
    </div>
  )),
}));

vi.mock("../form-selected-applications/form-selected-applications", () => ({
  FormSelectedApplications: vi.fn(({ mode, viewData }) => (
    <div data-testid="form-selected-applications" data-mode={mode}>
      Selected Apps: {viewData?.totalItems || 0} items
    </div>
  )),
}));

vi.mock("../form-personal-information/form-personal-information", () => ({
  FormPersonalInformation: vi.fn(({ personalData }) => (
    <div data-testid="form-personal-information">
      Personal Info: {personalData?.name || "Mock Name"}
    </div>
  )),
}));

vi.mock("../form-cost-details/form-cost-details", () => ({
  FormCostDetails: vi.fn(({ source, summary }) => (
    <div data-testid="form-cost-details" data-source={source}>
      Cost: {summary?.estimatedROM || "$0"}
    </div>
  )),
}));

// Extend Jest matchers for accessibility testing
expect.extend(toHaveNoViolations);

describe("RequestDetailView", () => {
  const user = userEvent.setup();

  // Mock request data
  const mockRequest: RequestData = {
    requestId: "test-request-id-123",
    status: "Pending",
    personalData: {
      name: "John Doe",
      email: "john.doe@test.com",
      designation: "Software Engineer",
      agency: "Army",
    },
    requestDetails: {
      organization: "Army",
      organizationOther: "",
      pocName: "Jane Smith",
      pocPhone: "555-123-4567",
      pocEmail: "jane.smith@test.com",
      useCaseDescription: "Testing application requirements",
    },
    cartItems: [
      {
        productId: 1,
        productName: "Test Product 1",
        productType: "Software",
        description: "Test description 1",
        unit: 10,
        rom: "Low",
        quantity: 2,
      },
      {
        productId: 2,
        productName: "Test Product 2",
        productType: "Service",
        description: "Test description 2",
        unit: 20,
        rom: "Medium",
        quantity: 1,
      },
    ],
    summary: {
      totalItems: 2,
      totalQuantity: 3,
      pendingPriceItems: 0,
      estimatedROM: "$1,500",
    },
    submittedAt: "2024-01-15T10:30:00Z",
    statusReason: "Initial submission for review",
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  };

  // Mock event handlers
  const mockOnReasoningChange = vi.fn();
  const mockOnAccept = vi.fn();
  const mockOnReject = vi.fn();

  const defaultProps: RequestDetailViewProps = {
    request: mockRequest,
    statusReason: "Test reasoning text",
    onReasoningChange: mockOnReasoningChange,
    onAccept: mockOnAccept,
    onReject: mockOnReject,
    buttonClass: "button--pending",
    mode: "view",
  };

  const renderRequestDetailView = (
    props: Partial<RequestDetailViewProps> = {}
  ) => {
    const finalProps = { ...defaultProps, ...props };
    return renderWithProviders(<RequestDetailView {...finalProps} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Basic Rendering", () => {
    test("should render successfully", () => {
      const { container } = renderRequestDetailView();
      expect(
        container.querySelector(".cart-page__content-wrapper")
      ).toBeInTheDocument();
    });

    test("should render all required sections", () => {
      renderRequestDetailView();

      // Check main layout sections
      expect(
        document.querySelector(".cart-page__content-left")
      ).toBeInTheDocument();
      expect(
        document.querySelector(".cart-page__content-right")
      ).toBeInTheDocument();
      expect(
        document.querySelector(".cart-form__container")
      ).toBeInTheDocument();
      expect(document.querySelector("#cart-form")).toBeInTheDocument();
    });

    test("should render all child components", () => {
      renderRequestDetailView();

      expect(screen.getByTestId("form-request-details")).toBeInTheDocument();
      expect(
        screen.getByTestId("form-selected-applications")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("form-personal-information")
      ).toBeInTheDocument();
      expect(screen.getByTestId("form-cost-details")).toBeInTheDocument();
    });

    test("should render approval status section", () => {
      renderRequestDetailView();

      expect(screen.getByText("Approval Status")).toBeInTheDocument();
      expect(screen.getByLabelText("Reasoning")).toBeInTheDocument();
      expect(screen.getByText(mockRequest.status)).toBeInTheDocument();
    });
  });

  describe("Mode Behavior", () => {
    test("should render in view mode correctly", () => {
      renderRequestDetailView({ mode: "view" });

      const reasoningField = screen.getByLabelText("Reasoning");
      expect(reasoningField).toBeDisabled();
      expect(
        screen.queryByRole("button", { name: "Accept" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Reject" })
      ).not.toBeInTheDocument();
    });

    test("should render in approve mode correctly", () => {
      renderRequestDetailView({ mode: "approve" });

      const reasoningField = screen.getByLabelText("Reasoning");
      expect(reasoningField).not.toBeDisabled();
      expect(
        screen.getByRole("button", { name: "Accept" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Reject" })
      ).toBeInTheDocument();
    });

    test("should render in edit mode correctly", () => {
      renderRequestDetailView({ mode: "edit" });

      const reasoningField = screen.getByLabelText("Reasoning");
      expect(reasoningField).not.toBeDisabled();
      expect(
        screen.queryByRole("button", { name: "Accept" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Reject" })
      ).not.toBeInTheDocument();
    });
  });

  describe("Child Component Props", () => {
    test("should pass correct props to FormRequestDetails", () => {
      renderRequestDetailView();

      const formRequestDetails = screen.getByTestId("form-request-details");
      expect(formRequestDetails).toHaveAttribute("data-mode", "view");
      expect(formRequestDetails).toHaveTextContent(
        "Request Details: Jane Smith"
      );
    });

    test("should pass correct props to FormSelectedApplications", () => {
      renderRequestDetailView();

      const formSelectedApplications = screen.getByTestId(
        "form-selected-applications"
      );
      expect(formSelectedApplications).toHaveAttribute("data-mode", "view");
      expect(formSelectedApplications).toHaveTextContent(
        "Selected Apps: 2 items"
      );
    });

    test("should pass correct props to FormPersonalInformation", () => {
      renderRequestDetailView();

      const formPersonalInformation = screen.getByTestId(
        "form-personal-information"
      );
      expect(formPersonalInformation).toHaveTextContent(
        "Personal Info: John Doe"
      );
    });

    test("should pass correct props to FormCostDetails", () => {
      renderRequestDetailView();

      const formCostDetails = screen.getByTestId("form-cost-details");
      expect(formCostDetails).toHaveAttribute("data-source", "request");
      expect(formCostDetails).toHaveTextContent("Cost: $1,500");
    });
  });

  describe("Reasoning Field", () => {
    test("should display the provided statusReason value", () => {
      const testReason = "Custom reasoning text for testing";
      renderRequestDetailView({ statusReason: testReason });

      const reasoningField = screen.getByLabelText("Reasoning");
      expect(reasoningField).toHaveValue(testReason);
    });

    test("should be multiline with correct attributes", () => {
      renderRequestDetailView({ mode: "approve" });

      const reasoningField = screen.getByLabelText("Reasoning");
      expect(reasoningField).toHaveAttribute("id", "reasoning");
      expect(reasoningField).toHaveAttribute("name", "reasoning");
      expect(reasoningField.tagName.toLowerCase()).toBe("textarea");
    });

    test("should handle text changes in approve mode", async () => {
      renderRequestDetailView({ mode: "approve" });

      const reasoningField = screen.getByLabelText("Reasoning");
      await user.clear(reasoningField);
      await user.type(reasoningField, "New reasoning");

      expect(mockOnReasoningChange).toHaveBeenCalled();
    });

    test("should not handle text changes in view mode", async () => {
      renderRequestDetailView({ mode: "view" });

      const reasoningField = screen.getByLabelText("Reasoning");
      // Field should be disabled, so typing should not work
      expect(reasoningField).toBeDisabled();
    });
  });

  describe("Status Display", () => {
    test("should display the correct status", () => {
      renderRequestDetailView();

      const statusText = screen.getByText(mockRequest.status);
      expect(statusText).toBeInTheDocument();
    });

    test("should apply the correct chip color", () => {
      renderRequestDetailView();

      const statusText = screen.getByText(mockRequest.status);
      expect(statusText).toBeInTheDocument();
      // The chip should be present in the DOM with the status text
      expect(statusText.closest(".MuiChip-root")).toBeInTheDocument();
    });

    test("should handle different status values", () => {
      const differentStatuses = ["Approved", "Denied", "Under Review"];

      differentStatuses.forEach((status) => {
        const requestWithStatus = { ...mockRequest, status };
        const { unmount } = renderRequestDetailView({
          request: requestWithStatus,
        });

        expect(screen.getByText(status)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe("Action Buttons", () => {
    test("should show action buttons in approve mode", () => {
      renderRequestDetailView({ mode: "approve" });

      expect(
        screen.getByRole("button", { name: "Accept" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Reject" })
      ).toBeInTheDocument();
    });

    test("should not show action buttons in view mode", () => {
      renderRequestDetailView({ mode: "view" });

      expect(
        screen.queryByRole("button", { name: "Accept" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Reject" })
      ).not.toBeInTheDocument();
    });

    test("should not show action buttons in edit mode", () => {
      renderRequestDetailView({ mode: "edit" });

      expect(
        screen.queryByRole("button", { name: "Accept" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Reject" })
      ).not.toBeInTheDocument();
    });

    test("should handle accept button click", async () => {
      renderRequestDetailView({ mode: "approve" });

      const acceptButton = screen.getByRole("button", { name: "Accept" });
      await user.click(acceptButton);

      expect(mockOnAccept).toHaveBeenCalledTimes(1);
    });

    test("should handle reject button click", async () => {
      renderRequestDetailView({ mode: "approve" });

      const rejectButton = screen.getByRole("button", { name: "Reject" });
      await user.click(rejectButton);

      expect(mockOnReject).toHaveBeenCalledTimes(1);
    });

    test("should have correct CSS classes for action buttons", () => {
      renderRequestDetailView({ mode: "approve" });

      const acceptButton = screen.getByRole("button", { name: "Accept" });
      const rejectButton = screen.getByRole("button", { name: "Reject" });

      expect(acceptButton).toHaveClass(
        "button",
        "button--status",
        "button--submit"
      );
      expect(rejectButton).toHaveClass(
        "button",
        "button--status",
        "button--denied"
      );
    });
  });

  describe("Event Handler Integration", () => {
    test("should call onReasoningChange with correct event object", async () => {
      renderRequestDetailView({ mode: "approve" });

      const reasoningField = screen.getByLabelText("Reasoning");
      await user.type(reasoningField, "a");

      expect(mockOnReasoningChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: expect.any(String),
          }),
        })
      );
    });

    test("should handle multiple rapid clicks on action buttons", async () => {
      renderRequestDetailView({ mode: "approve" });

      const acceptButton = screen.getByRole("button", { name: "Accept" });

      // Click multiple times rapidly
      await user.click(acceptButton);
      await user.click(acceptButton);
      await user.click(acceptButton);

      expect(mockOnAccept).toHaveBeenCalledTimes(3);
    });

    test("should handle optional event handlers gracefully", () => {
      const propsWithoutHandlers = {
        ...defaultProps,
        onReasoningChange: undefined,
        onAccept: undefined,
        onReject: undefined,
      };

      expect(() => renderRequestDetailView(propsWithoutHandlers)).not.toThrow();
    });
  });

  describe("Data Display", () => {
    test("should handle empty request data gracefully", () => {
      const emptyRequest = {
        ...mockRequest,
        personalData: { name: "", email: "", designation: "", agency: "" },
        requestDetails: {
          organization: "",
          organizationOther: "",
          pocName: "",
          pocPhone: "",
          pocEmail: "",
          useCaseDescription: "",
        },
        cartItems: [],
        summary: {
          totalItems: 0,
          totalQuantity: 0,
          pendingPriceItems: 0,
          estimatedROM: "$0",
        },
      };

      expect(() =>
        renderRequestDetailView({ request: emptyRequest })
      ).not.toThrow();
    });

    test("should handle missing optional data", () => {
      const minimalRequest = {
        requestId: "minimal-id",
        status: "Pending",
        personalData: {
          name: "Test",
          email: "test@test.com",
          designation: "",
          agency: "",
        },
        requestDetails: {
          organization: "",
          organizationOther: "",
          pocName: "",
          pocPhone: "",
          pocEmail: "",
          useCaseDescription: "",
        },
        cartItems: [],
        summary: {
          totalItems: 0,
          totalQuantity: 0,
          pendingPriceItems: 0,
          estimatedROM: "$0",
        },
        submittedAt: "2024-01-01T00:00:00Z",
        statusReason: "",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      expect(() =>
        renderRequestDetailView({ request: minimalRequest })
      ).not.toThrow();
    });
  });

  describe("Layout Structure", () => {
    test("should have correct DOM structure", () => {
      const { container } = renderRequestDetailView();

      const wrapper = container.querySelector(".cart-page__content-wrapper");
      expect(wrapper).toBeInTheDocument();

      const leftContent = wrapper?.querySelector(".cart-page__content-left");
      const rightContent = wrapper?.querySelector(".cart-page__content-right");

      expect(leftContent).toBeInTheDocument();
      expect(rightContent).toBeInTheDocument();
    });

    test("should place components in correct sections", () => {
      renderRequestDetailView();

      const leftContent = document.querySelector(".cart-page__content-left");
      const rightContent = document.querySelector(".cart-page__content-right");

      // FormRequestDetails and FormSelectedApplications should be in left section
      expect(
        within(leftContent as HTMLElement).getByTestId("form-request-details")
      ).toBeInTheDocument();
      expect(
        within(leftContent as HTMLElement).getByTestId(
          "form-selected-applications"
        )
      ).toBeInTheDocument();

      // FormPersonalInformation, FormCostDetails, and approval section should be in right section
      expect(
        within(rightContent as HTMLElement).getByTestId(
          "form-personal-information"
        )
      ).toBeInTheDocument();
      expect(
        within(rightContent as HTMLElement).getByTestId("form-cost-details")
      ).toBeInTheDocument();
      expect(
        within(rightContent as HTMLElement).getByText("Approval Status")
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    test("should have proper labeling for reasoning field", () => {
      renderRequestDetailView();

      const reasoningField = screen.getByLabelText("Reasoning");
      expect(reasoningField).toHaveAttribute("id", "reasoning");

      const label = screen.getByText("Reasoning");
      expect(label.tagName.toLowerCase()).toBe("label");
      expect(label).toHaveAttribute("for", "reasoning");
    });

    test("should have accessible button descriptions", () => {
      renderRequestDetailView({ mode: "approve" });

      const acceptButton = screen.getByRole("button", { name: "Accept" });
      const rejectButton = screen.getByRole("button", { name: "Reject" });
      const statusText = screen.getByText(mockRequest.status);

      expect(acceptButton).toBeInTheDocument();
      expect(rejectButton).toBeInTheDocument();
      expect(statusText).toBeInTheDocument();
    });

    test("should be accessible in view mode", async () => {
      const { container } = renderRequestDetailView({ mode: "view" });
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test("should be accessible in approve mode", async () => {
      const { container } = renderRequestDetailView({ mode: "approve" });
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test("should be accessible in edit mode", async () => {
      const { container } = renderRequestDetailView({ mode: "edit" });
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Edge Cases", () => {
    test("should handle very long status reason text", () => {
      const longText = "A".repeat(1000);
      renderRequestDetailView({ statusReason: longText });

      const reasoningField = screen.getByLabelText("Reasoning");
      expect(reasoningField).toHaveValue(longText);
    });

    test("should handle special characters in status reason", () => {
      const specialChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
      renderRequestDetailView({ statusReason: specialChars });

      const reasoningField = screen.getByLabelText("Reasoning");
      expect(reasoningField).toHaveValue(specialChars);
    });

    test("should handle rapid mode changes", () => {
      const { rerender } = renderRequestDetailView({ mode: "view" });

      rerender(<RequestDetailView {...defaultProps} mode="approve" />);
      expect(
        screen.getByRole("button", { name: "Accept" })
      ).toBeInTheDocument();

      rerender(<RequestDetailView {...defaultProps} mode="edit" />);
      expect(
        screen.queryByRole("button", { name: "Accept" })
      ).not.toBeInTheDocument();
    });

    test("should handle empty statusReason", () => {
      renderRequestDetailView({ statusReason: "" });

      const reasoningField = screen.getByLabelText("Reasoning");
      expect(reasoningField).toHaveValue("");
    });
  });

  describe("Performance", () => {
    test("should render efficiently without unnecessary re-renders", () => {
      const { rerender } = renderRequestDetailView();

      // Re-render with same props multiple times
      rerender(<RequestDetailView {...defaultProps} />);
      rerender(<RequestDetailView {...defaultProps} />);
      rerender(<RequestDetailView {...defaultProps} />);

      // Should not cause any errors
      expect(screen.getByText("Approval Status")).toBeInTheDocument();
    });

    test("should handle prop changes efficiently", () => {
      const { rerender } = renderRequestDetailView();

      // Change various props and ensure component updates correctly
      rerender(
        <RequestDetailView {...defaultProps} statusReason="Updated reason" />
      );
      expect(screen.getByDisplayValue("Updated reason")).toBeInTheDocument();

      rerender(<RequestDetailView {...defaultProps} mode="approve" />);
      expect(
        screen.getByRole("button", { name: "Accept" })
      ).toBeInTheDocument();
    });
  });
});
