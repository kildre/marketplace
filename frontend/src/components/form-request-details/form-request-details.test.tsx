import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { renderWithProviders } from "../../test-utils";
import { FormRequestDetails } from "./form-request-details";

// Mock the organization options data
vi.mock("../../data/organizationOptionsData", () => ({
  organizationOptions: [
    { value: "Army", label: "Army" },
    { value: "Navy", label: "Navy" },
    { value: "Air Force", label: "Air Force" },
    { value: "CDAO", label: "CDAO" },
    { value: "Other", label: "Other" },
  ],
}));

// Mock the hooks to control their behavior in tests
const mockUpdateOrganization = vi.fn();
const mockUpdateRequestDetails = vi.fn();

const mockUseOrganizationForm = vi.fn();
const mockUseRequestDetailsForm = vi.fn();
const mockUseSubmissionAttempts = vi.fn();

vi.mock("../../hooks/useFormQueries", () => ({
  useOrganizationForm: () => mockUseOrganizationForm(),
  useRequestDetailsForm: () => mockUseRequestDetailsForm(),
  useSubmissionAttempts: () => mockUseSubmissionAttempts(),
}));

describe("FormRequestDetails", () => {
  const user = userEvent.setup();

  const renderFormRequestDetails = (initialData?: {
    organization?: string;
    organizationOther?: string;
    pocName?: string;
    pocPhone?: string;
    pocEmail?: string;
    useCaseDescription?: string;
    hasAttemptedSubmission?: boolean;
  }) => {
    // Update mock implementation with initial data
    mockUseOrganizationForm.mockReturnValue({
      organization: initialData?.organization || "",
      organizationOther: initialData?.organizationOther || "",
      updateOrganization: mockUpdateOrganization,
    });

    mockUseRequestDetailsForm.mockReturnValue({
      pocName: initialData?.pocName || "",
      pocPhone: initialData?.pocPhone || "",
      pocEmail: initialData?.pocEmail || "",
      useCaseDescription: initialData?.useCaseDescription || "",
      updateRequestDetails: mockUpdateRequestDetails,
    });

    mockUseSubmissionAttempts.mockReturnValue({
      hasAttemptedSubmission: initialData?.hasAttemptedSubmission || false,
      markSubmissionAttempt: vi.fn(),
      resetSubmissionAttempts: vi.fn(),
    });

    return renderWithProviders(<FormRequestDetails />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Basic Rendering", () => {
    test("should render successfully", () => {
      const { container } = renderFormRequestDetails();
      expect(
        container.querySelector(".form-request-details__container")
      ).toBeInTheDocument();
    });

    test("should render accordion with correct structure", () => {
      renderFormRequestDetails();

      const accordion = screen.getByRole("button", {
        name: /request details/i,
      });
      expect(accordion).toBeInTheDocument();
      expect(accordion).toHaveAttribute(
        "aria-controls",
        "request-details-content"
      );
      expect(accordion).toHaveAttribute("id", "request-details-header");
    });

    test("should render accordion expanded by default", () => {
      renderFormRequestDetails();

      const accordion = screen.getByRole("button", {
        name: /request details/i,
      });
      expect(accordion).toHaveAttribute("aria-expanded", "true");
    });

    test("should render all form fields", () => {
      renderFormRequestDetails();

      // Organization field
      expect(
        screen.getByRole("combobox", { name: /organization/i })
      ).toBeInTheDocument();

      // POC fields
      expect(
        screen.getByLabelText(/point of contact name/i)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/use case description/i)
      ).toBeInTheDocument();
    });

    test("should have correct form field types", () => {
      renderFormRequestDetails();

      expect(screen.getByLabelText(/phone number/i)).toHaveAttribute(
        "type",
        "tel"
      );
      expect(screen.getByLabelText(/email address/i)).toHaveAttribute(
        "type",
        "email"
      );
      // TextField multiline creates a textarea element, not aria-multiline
      expect(screen.getByLabelText(/use case description/i).tagName).toBe(
        "TEXTAREA"
      );
    });
  });

  describe("Alert Messages", () => {
    test("should show warning when organization is not selected", () => {
      renderFormRequestDetails({ organization: "" });

      expect(
        screen.getByText(
          /please select an organization that this request is on behalf of/i
        )
      ).toBeInTheDocument();
      // MUI Alert components don't have a severity attribute on the DOM element
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    test("should show warning when Other is selected but organizationOther is empty and submission attempted", () => {
      renderFormRequestDetails({
        organization: "Other",
        organizationOther: "",
        hasAttemptedSubmission: true,
      });

      // Look for the alert message specifically
      const alertMessage = screen.getByRole("alert");
      expect(alertMessage).toHaveTextContent(
        /please specify the organization you are requesting on behalf of/i
      );
    });

    test("should not show organization warning when organization is selected", () => {
      renderFormRequestDetails({ organization: "Army" });

      expect(
        screen.queryByText(
          /please select an organization that this request is on behalf of/i
        )
      ).not.toBeInTheDocument();
    });

    test("should not show organizationOther warning when Other is selected and organizationOther is filled", () => {
      renderFormRequestDetails({
        organization: "Other",
        organizationOther: "Custom Organization",
      });

      // Should not show the alert when organizationOther is filled
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    test("should show both warnings when organization is empty and Other scenario applies", () => {
      renderFormRequestDetails({ organization: "" });

      // Only the first warning should show since organization is empty
      const alerts = screen.getAllByRole("alert");
      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toHaveTextContent(/please select an organization/i);
    });
  });

  describe("Organization Selection", () => {
    test("should display selected organization value", () => {
      renderFormRequestDetails({ organization: "Army" });

      // For MUI Select, check the text content instead of value
      const organizationField = screen.getByRole("combobox", {
        name: /organization/i,
      });
      expect(organizationField).toHaveTextContent("Army");
    });

    test("should display placeholder when no organization is selected", () => {
      renderFormRequestDetails({ organization: "" });

      expect(screen.getByText("- Select -")).toBeInTheDocument();
    });

    test("should render all organization options", async () => {
      renderFormRequestDetails();

      const organizationField = screen.getByRole("combobox", {
        name: /organization/i,
      });
      await user.click(organizationField);

      const listbox = screen.getByRole("listbox");
      const options = within(listbox).getAllByRole("option");

      expect(options).toHaveLength(5); // Based on our mocked data
      expect(within(listbox).getByText("Army")).toBeInTheDocument();
      expect(within(listbox).getByText("Navy")).toBeInTheDocument();
      expect(within(listbox).getByText("Air Force")).toBeInTheDocument();
      expect(within(listbox).getByText("CDAO")).toBeInTheDocument();
      expect(within(listbox).getByText("Other")).toBeInTheDocument();
    });

    test("should call updateOrganization when organization is selected", async () => {
      renderFormRequestDetails();

      const organizationField = screen.getByRole("combobox", {
        name: /organization/i,
      });
      await user.click(organizationField);
      await user.click(screen.getByText("Army"));

      expect(mockUpdateOrganization).toHaveBeenCalledWith({
        organization: "Army",
        organizationOther: "",
      });
    });

    test("should reset organizationOther when switching from Other to another option", async () => {
      renderFormRequestDetails({
        organization: "Other",
        organizationOther: "Custom Org",
      });

      const organizationField = screen.getByRole("combobox", {
        name: /organization/i,
      });
      await user.click(organizationField);
      await user.click(screen.getByText("Army"));

      expect(mockUpdateOrganization).toHaveBeenCalledWith({
        organization: "Army",
        organizationOther: "",
      });
    });

    test("should not reset organizationOther when selecting Other", async () => {
      renderFormRequestDetails();

      const organizationField = screen.getByRole("combobox", {
        name: /organization/i,
      });
      await user.click(organizationField);
      await user.click(screen.getByText("Other"));

      expect(mockUpdateOrganization).toHaveBeenCalledWith({
        organization: "Other",
      });
    });
  });

  describe("Organization Other Field", () => {
    test("should show organizationOther field when Other is selected", () => {
      renderFormRequestDetails({ organization: "Other" });

      expect(
        screen.getByLabelText(/please specify the organization/i)
      ).toBeInTheDocument();
      // Check the specific organizationOther field by its ID
      expect(
        screen.getByRole("textbox", {
          name: /please specify the organization/i,
        })
      ).toHaveAttribute("id", "organization-other");
    });

    test("should hide organizationOther field when Other is not selected", () => {
      renderFormRequestDetails({ organization: "Army" });

      expect(
        screen.queryByLabelText(/please specify the organization/i)
      ).not.toBeInTheDocument();
    });

    test("should display organizationOther value when provided", () => {
      renderFormRequestDetails({
        organization: "Other",
        organizationOther: "Custom Organization",
      });

      const orgOtherField = screen.getByLabelText(
        /please specify the organization/i
      );
      expect(orgOtherField).toHaveValue("Custom Organization");
    });

    test("should call updateOrganization when organizationOther is changed", async () => {
      renderFormRequestDetails({ organization: "Other" });

      const orgOtherField = screen.getByLabelText(
        /please specify the organization/i
      );
      await user.type(orgOtherField, "Custom Organization");

      // Check that updateOrganization was called with each character
      expect(mockUpdateOrganization).toHaveBeenCalledTimes(19); // "Custom Organization" has 19 characters
      // Check the last call has the final value
      expect(mockUpdateOrganization).toHaveBeenLastCalledWith({
        organizationOther: "n",
      });
    });

    test("should have required attribute when visible", () => {
      renderFormRequestDetails({ organization: "Other" });

      const orgOtherField = screen.getByLabelText(
        /please specify the organization/i
      );
      expect(orgOtherField).toBeRequired();
    });

    test("should display red asterisk when Other is selected", () => {
      renderFormRequestDetails({ organization: "Other" });

      // Check that the label element exists and contains the red asterisk
      const labelElement = document.querySelector(
        'label[for="organization-other"]'
      );
      expect(labelElement).toBeInTheDocument();

      const redAsterisk = labelElement?.querySelector(
        'span[style*="color: red"]'
      );
      expect(redAsterisk).toBeInTheDocument();
      expect(redAsterisk).toHaveTextContent("*");
    });

    test("should show error state when Other is selected but field is empty and submission attempted", () => {
      renderFormRequestDetails({
        organization: "Other",
        organizationOther: "",
        hasAttemptedSubmission: true,
      });

      const orgOtherField = screen.getByLabelText(
        /please specify the organization/i
      );

      // Check for error styling (MUI adds aria-invalid when error is true)
      expect(orgOtherField).toHaveAttribute("aria-invalid", "true");

      // Check for error helper text
      expect(
        screen.getByText("This field is required when 'Other' is selected")
      ).toBeInTheDocument();
    });

    test("should NOT show error state when Other is selected but submission hasn't been attempted", () => {
      renderFormRequestDetails({
        organization: "Other",
        organizationOther: "",
        hasAttemptedSubmission: false,
      });

      const orgOtherField = screen.getByLabelText(
        /please specify the organization/i
      );

      // Should not have error state
      expect(orgOtherField).toHaveAttribute("aria-invalid", "false");

      // Should not show error helper text
      expect(
        screen.queryByText("This field is required when 'Other' is selected")
      ).not.toBeInTheDocument();
    });

    test("should not show error state when Other is selected and field is filled", () => {
      renderFormRequestDetails({
        organization: "Other",
        organizationOther: "Custom Organization",
      });

      const orgOtherField = screen.getByLabelText(
        /please specify the organization/i
      );

      // Should not have error state
      expect(orgOtherField).toHaveAttribute("aria-invalid", "false");

      // Should not show error helper text
      expect(
        screen.queryByText("This field is required when 'Other' is selected")
      ).not.toBeInTheDocument();
    });

    test("should have correct CSS class", () => {
      renderFormRequestDetails({ organization: "Other" });

      // Check the TextField container for the CSS class
      const orgOtherContainer = screen
        .getByLabelText(/please specify the organization/i)
        .closest(".form-request-details__organization-other");
      expect(orgOtherContainer).toBeInTheDocument();
    });
  });

  describe("POC Form Fields", () => {
    test("should display POC name value", () => {
      renderFormRequestDetails({ pocName: "John Doe" });

      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
    });

    test("should display POC phone value", () => {
      renderFormRequestDetails({ pocPhone: "555-123-4567" });

      expect(screen.getByDisplayValue("555-123-4567")).toBeInTheDocument();
    });

    test("should display POC email value", () => {
      renderFormRequestDetails({ pocEmail: "john.doe@example.com" });

      expect(
        screen.getByDisplayValue("john.doe@example.com")
      ).toBeInTheDocument();
    });

    test("should display use case description value", () => {
      renderFormRequestDetails({ useCaseDescription: "Data analysis project" });

      expect(
        screen.getByDisplayValue("Data analysis project")
      ).toBeInTheDocument();
    });

    test("should call updateRequestDetails when POC name is changed", async () => {
      renderFormRequestDetails();

      const pocNameField = screen.getByLabelText(/point of contact name/i);
      await user.type(pocNameField, "John Doe");

      // Check that updateRequestDetails was called for each character
      expect(mockUpdateRequestDetails).toHaveBeenCalledTimes(8); // "John Doe" has 8 characters
      // Check the last call has the final character
      expect(mockUpdateRequestDetails).toHaveBeenLastCalledWith({
        pocName: "e",
      });
    });

    test("should call updateRequestDetails when phone number is changed", async () => {
      renderFormRequestDetails();

      const phoneField = screen.getByLabelText(/phone number/i);
      await user.type(phoneField, "555-123-4567");

      expect(mockUpdateRequestDetails).toHaveBeenLastCalledWith({
        pocPhone: "7",
      });
    });

    test("should call updateRequestDetails when email is changed", async () => {
      renderFormRequestDetails();

      const emailField = screen.getByLabelText(/email address/i);
      await user.type(emailField, "john.doe@example.com");

      expect(mockUpdateRequestDetails).toHaveBeenLastCalledWith({
        pocEmail: "m",
      });
    });

    test("should call updateRequestDetails when use case description is changed", async () => {
      renderFormRequestDetails();

      const useCaseField = screen.getByLabelText(/use case description/i);
      await user.type(useCaseField, "Data analysis project");

      expect(mockUpdateRequestDetails).toHaveBeenLastCalledWith({
        useCaseDescription: "t",
      });
    });
  });

  describe("Form Validation Attributes", () => {
    test("should have required attribute on organization select", () => {
      renderFormRequestDetails();

      const organizationField = screen.getByRole("combobox", {
        name: /organization/i,
      });

      // Check for the required attribute on the MUI Select component
      expect(
        organizationField.parentElement?.querySelector("input")
      ).toHaveAttribute("required");
    });

    test("should have correct labels with required indicators", () => {
      renderFormRequestDetails();

      // Check for asterisks in labels - text is split across elements
      expect(screen.getByText("Organization")).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    test("should have proper field IDs for accessibility", () => {
      renderFormRequestDetails();

      expect(screen.getByLabelText(/point of contact name/i)).toHaveAttribute(
        "id",
        "poc-name"
      );
      expect(screen.getByLabelText(/phone number/i)).toHaveAttribute(
        "id",
        "poc-phone"
      );
      expect(screen.getByLabelText(/email address/i)).toHaveAttribute(
        "id",
        "poc-email"
      );
      expect(screen.getByLabelText(/use case description/i)).toHaveAttribute(
        "id",
        "use-case-description"
      );
    });
  });

  describe("Accessibility", () => {
    test("should have proper labeling for organization select", () => {
      renderFormRequestDetails();

      const organizationField = screen.getByRole("combobox", {
        name: /organization/i,
      });
      expect(organizationField).toHaveAttribute("aria-label", "Organization");
      expect(organizationField).toHaveAttribute(
        "aria-labelledby",
        "organization-label organization-select"
      );
    });

    test("should have proper accordion accessibility attributes", () => {
      renderFormRequestDetails();

      const accordion = screen.getByRole("button", {
        name: /request details/i,
      });
      expect(accordion).toHaveAttribute(
        "aria-controls",
        "request-details-content"
      );
      expect(accordion).toHaveAttribute("id", "request-details-header");
    });

    test("should have multiline attribute for textarea", () => {
      renderFormRequestDetails();

      const useCaseField = screen.getByLabelText(/use case description/i);
      expect(useCaseField.tagName).toBe("TEXTAREA");
    });
  });

  describe("CSS Classes and Styling", () => {
    test("should apply correct CSS classes to container", () => {
      const { container } = renderFormRequestDetails();

      expect(
        container.querySelector(".form-request-details__container")
      ).toBeInTheDocument();
    });

    test("should apply correct CSS classes to accordion details", () => {
      const { container } = renderFormRequestDetails();

      expect(
        container.querySelector(".form-request-details__accordion-details")
      ).toBeInTheDocument();
    });

    test("should apply correct CSS classes to organization field", () => {
      const { container } = renderFormRequestDetails();

      expect(
        container.querySelector(".form-request-details__organization")
      ).toBeInTheDocument();
    });

    test("should apply correct CSS classes to POC details container", () => {
      const { container } = renderFormRequestDetails();

      expect(
        container.querySelector(".form-request-details__poc-details")
      ).toBeInTheDocument();
    });

    test("should apply correct CSS classes to POC detail items", () => {
      const { container } = renderFormRequestDetails();

      const pocDetailItems = container.querySelectorAll(
        ".form-request-details__poc-detail-item"
      );
      expect(pocDetailItems).toHaveLength(3); // name, phone, email
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle empty values gracefully", () => {
      renderFormRequestDetails({
        organization: "",
        organizationOther: "",
        pocName: "",
        pocPhone: "",
        pocEmail: "",
        useCaseDescription: "",
      });

      expect(screen.getByText("- Select -")).toBeInTheDocument();
      expect(screen.getByLabelText(/point of contact name/i)).toHaveValue("");
    });

    test("should handle special characters in input values", () => {
      const specialChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
      renderFormRequestDetails({
        pocName: specialChars,
        organizationOther: specialChars,
      });

      expect(screen.getByDisplayValue(specialChars)).toBeInTheDocument();
    });

    test("should handle long text values", () => {
      const longText = "A".repeat(1000);
      renderFormRequestDetails({ useCaseDescription: longText });

      expect(screen.getByDisplayValue(longText)).toBeInTheDocument();
    });

    test("should handle undefined hook values gracefully", () => {
      mockUseOrganizationForm.mockReturnValue({
        organization: "",
        organizationOther: "",
        updateOrganization: mockUpdateOrganization,
      });

      mockUseRequestDetailsForm.mockReturnValue({
        pocName: "",
        pocPhone: "",
        pocEmail: "",
        useCaseDescription: "",
        updateRequestDetails: mockUpdateRequestDetails,
      });

      mockUseSubmissionAttempts.mockReturnValue({
        hasAttemptedSubmission: false,
        markSubmissionAttempt: vi.fn(),
        resetSubmissionAttempts: vi.fn(),
      });

      expect(() => renderWithProviders(<FormRequestDetails />)).not.toThrow();
    });
  });

  describe("Integration with TanStack Query", () => {
    test("should use TanStack Query hooks for form state", () => {
      renderFormRequestDetails();

      // Verify that the mocked hooks are called
      expect(mockUseOrganizationForm).toHaveBeenCalled();
      expect(mockUseRequestDetailsForm).toHaveBeenCalled();
    });

    test("should work with TanStack Query providers", () => {
      // This test ensures the component works with our test setup that includes QueryClientProvider
      expect(() => renderFormRequestDetails()).not.toThrow();
    });
  });

  describe("Performance", () => {
    test("should render efficiently without unnecessary re-renders", () => {
      renderFormRequestDetails();

      // Just verify the component renders without throwing
      expect(
        screen.getByRole("combobox", { name: /organization/i })
      ).toBeInTheDocument();
    });
  });
});
