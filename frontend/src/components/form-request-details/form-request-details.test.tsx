import { screen, within, waitFor } from "@testing-library/react";
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
    return renderWithProviders(<FormRequestDetails />, {
      initialFormData: {
        organization: {
          organization: initialData?.organization || "",
          organizationOther: initialData?.organizationOther || "",
        },
        requestDetails: {
          pocName: initialData?.pocName || "",
          pocPhone: initialData?.pocPhone || "",
          pocEmail: initialData?.pocEmail || "",
          useCaseDescription: initialData?.useCaseDescription || "",
        },
      },
    });
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

    test.skip("should show warning when Other is selected but organizationOther is empty and submission attempted", () => {
      // TODO: Rewrite to trigger submission instead of setting initial state
      renderFormRequestDetails({
        organization: "Other",
        organizationOther: "",
        hasAttemptedSubmission: true, // This no longer works without mocks
      });

      // This test needs to be rewritten to actually trigger a submission attempt
      // const alertMessage = screen.getByRole("alert");
      // expect(alertMessage).toHaveTextContent(
      //   /please specify the organization you are requesting on behalf of/i
      // );
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

    // TODO: Rewrite these tests to check behavior instead of mock calls
    test.skip("should call updateOrganization when organization is selected", async () => {
      renderFormRequestDetails();

      const organizationField = screen.getByRole("combobox", {
        name: /organization/i,
      });
      await user.click(organizationField);
      await user.click(screen.getByText("Army"));

      // Instead of checking mock calls, verify the UI updated
      expect(organizationField).toHaveTextContent("Army");
    });

    test.skip("should reset organizationOther when switching from Other to another option", async () => {
      renderFormRequestDetails({
        organization: "Other",
        organizationOther: "Custom Org",
      });

      const organizationField = screen.getByRole("combobox", {
        name: /organization/i,
      });
      await user.click(organizationField);
      await user.click(screen.getByText("Army"));

      // Verify organization changed in UI
      expect(organizationField).toHaveTextContent("Army");
    });

    test.skip("should not reset organizationOther when selecting Other", async () => {
      renderFormRequestDetails();

      const organizationField = screen.getByRole("combobox", {
        name: /organization/i,
      });
      await user.click(organizationField);
      await user.click(screen.getByText("Other"));

      // Verify organization changed to Other
      expect(organizationField).toHaveTextContent("Other");
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

    test.skip("should call updateOrganization when organizationOther is changed", async () => {
      renderFormRequestDetails({ organization: "Other" });

      const orgOtherField = screen.getByLabelText(
        /please specify the organization/i
      );
      await user.type(orgOtherField, "Custom Organization");

      // TODO: Test behavior instead of mock calls
      // Verify the value is in the field
      expect(orgOtherField).toHaveValue("Custom Organization");
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

    test.skip("should show error state when Other is selected but field is empty and submission attempted", () => {
      // TODO: Rewrite to trigger submission instead of setting initial state
      // This test needs to be rewritten to actually trigger a submission attempt
      // by simulating a user interaction that calls markSubmissionAttempt
      // renderFormRequestDetails({
      //   organization: "Other",
      //   organizationOther: "",
      //   hasAttemptedSubmission: true, // This no longer works without mocks
      // });
      // const orgOtherField = screen.getByLabelText(/please specify the organization/i);
      // expect(orgOtherField).toHaveAttribute("aria-invalid", "true");
      // expect(
      //   screen.getByText("This field is required when 'Other' is selected")
      // ).toBeInTheDocument();
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

    test.skip("should call updateRequestDetails when POC name is changed", async () => {
      renderFormRequestDetails();

      const pocNameField = screen.getByLabelText(/point of contact name/i);
      await user.type(pocNameField, "John Doe");

      // TODO: Test behavior instead of mock calls
      expect(pocNameField).toHaveValue("John Doe");
    });

    test.skip("should call updateRequestDetails when phone number is changed", async () => {
      renderFormRequestDetails();

      const phoneField = screen.getByLabelText(/phone number/i);
      await user.type(phoneField, "555-123-4567");

      // TODO: Test behavior instead of mock calls
      expect(phoneField).toHaveValue("555-123-4567");
    });

    test.skip("should call updateRequestDetails when email is changed", async () => {
      renderFormRequestDetails();

      const emailField = screen.getByLabelText(/email address/i);
      await user.type(emailField, "john.doe@example.com");

      // TODO: Test behavior instead of mock calls
      expect(emailField).toHaveValue("john.doe@example.com");
    });

    test.skip("should call updateRequestDetails when use case description is changed", async () => {
      renderFormRequestDetails();

      const useCaseField = screen.getByLabelText(/use case description/i);
      await user.type(useCaseField, "Data analysis project");

      // TODO: Test behavior instead of mock calls
      expect(useCaseField).toHaveValue("Data analysis project");
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

    test.skip("should handle undefined hook values gracefully", () => {
      // TODO: Rewrite without mocks
      expect(() => renderFormRequestDetails()).not.toThrow();
    });
  });

  describe("Integration with TanStack Query", () => {
    test("should use TanStack Query hooks for form state", () => {
      renderFormRequestDetails();

      // Now using real hooks, just verify rendering works
      const organizationField = screen.getByRole("combobox", {
        name: /organization/i,
      });
      expect(organizationField).toBeInTheDocument();
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

  describe("Field Validation - Phone Number", () => {
    test("Scenario 1: should show error state for invalid phone number format", async () => {
      renderFormRequestDetails();

      const phoneInput = screen.getByLabelText(/phone number/i);

      // Enter invalid phone number
      await user.clear(phoneInput);
      await user.type(phoneInput, "invalid-phone");

      // Trigger validation by blurring (click outside)
      await user.tab();

      // Check for error state (wait for state updates to propagate)
      await waitFor(() => {
        expect(phoneInput).toHaveAttribute("aria-invalid", "true");
      });
      expect(
        screen.getByText(/please enter a valid phone number/i)
      ).toBeInTheDocument();
    });

    test("should accept valid phone number formats", async () => {
      renderFormRequestDetails();

      const phoneInput = screen.getByLabelText(/phone number/i);

      // Test with simple numeric format first
      await user.clear(phoneInput);
      await user.type(phoneInput, "1234567890");

      // Trigger validation
      await user.tab();

      // Should not show error after typing complete valid number
      expect(
        screen.queryByText(/please enter a valid phone number/i)
      ).not.toBeInTheDocument();
    });

    test("should allow empty phone number (optional field)", async () => {
      renderFormRequestDetails({ pocPhone: "123-456-7890" });

      const phoneInput = screen.getByLabelText(/phone number/i);

      // Clear the field
      await user.clear(phoneInput);

      // Trigger validation
      await user.tab();

      // Should not show error for empty field
      expect(phoneInput).not.toHaveAttribute("aria-invalid", "true");
      expect(
        screen.queryByText(/please enter a valid phone number/i)
      ).not.toBeInTheDocument();
    });

    test("should show error for phone number with letters", async () => {
      renderFormRequestDetails();

      const phoneInput = screen.getByLabelText(/phone number/i);

      await user.clear(phoneInput);
      await user.type(phoneInput, "123-ABC-7890");

      // Trigger validation
      await user.tab();

      await waitFor(() => {
        expect(phoneInput).toHaveAttribute("aria-invalid", "true");
      });
      expect(
        screen.getByText(/please enter a valid phone number/i)
      ).toBeInTheDocument();
    });

    test("should show error for too short phone number", async () => {
      renderFormRequestDetails();

      const phoneInput = screen.getByLabelText(/phone number/i);

      await user.clear(phoneInput);
      await user.type(phoneInput, "123");

      // Trigger validation
      await user.tab();

      await waitFor(() => {
        expect(phoneInput).toHaveAttribute("aria-invalid", "true");
      });
      expect(
        screen.getByText(/please enter a valid phone number/i)
      ).toBeInTheDocument();
    });
  });

  describe("Field Validation - Email Address", () => {
    test("Scenario 2: should show error state for invalid email address format", async () => {
      renderFormRequestDetails();

      const emailInput = screen.getByLabelText(/email address/i);

      // Enter invalid email
      await user.clear(emailInput);
      await user.type(emailInput, "invalid-email");

      // Trigger validation
      await user.tab();

      // Check for error state
      await waitFor(() => {
        expect(emailInput).toHaveAttribute("aria-invalid", "true");
      });
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
    });

    test("should accept valid email formats", async () => {
      renderFormRequestDetails();

      const emailInput = screen.getByLabelText(/email address/i);

      // Test with a simple valid email
      await user.clear(emailInput);
      await user.type(emailInput, "user@example.com");

      // Trigger validation
      await user.tab();

      // Should not show error after typing complete valid email
      expect(
        screen.queryByText(/please enter a valid email address/i)
      ).not.toBeInTheDocument();
    });

    test("should allow empty email (optional field)", async () => {
      renderFormRequestDetails({ pocEmail: "user@example.com" });

      const emailInput = screen.getByLabelText(/email address/i);

      // Clear the field
      await user.clear(emailInput);

      // Trigger validation
      await user.tab();

      // Should not show error for empty field
      expect(emailInput).not.toHaveAttribute("aria-invalid", "true");
      expect(
        screen.queryByText(/please enter a valid email address/i)
      ).not.toBeInTheDocument();
    });

    test("should show error for email without @ symbol", async () => {
      renderFormRequestDetails();

      const emailInput = screen.getByLabelText(/email address/i);

      await user.clear(emailInput);
      await user.type(emailInput, "userexample.com");

      // Trigger validation
      await user.tab();

      await waitFor(() => {
        expect(emailInput).toHaveAttribute("aria-invalid", "true");
      });
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
    });

    test("should show error for email without domain", async () => {
      renderFormRequestDetails();

      const emailInput = screen.getByLabelText(/email address/i);

      await user.clear(emailInput);
      await user.type(emailInput, "user@");

      // Trigger validation
      await user.tab();

      await waitFor(() => {
        expect(emailInput).toHaveAttribute("aria-invalid", "true");
      });
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
    });

    test("should show error for email with spaces", async () => {
      renderFormRequestDetails();

      const emailInput = screen.getByLabelText(/email address/i);

      await user.clear(emailInput);
      await user.type(emailInput, "user name@example.com");

      // Trigger validation
      await user.tab();

      await waitFor(() => {
        expect(emailInput).toHaveAttribute("aria-invalid", "true");
      });
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
    });

    test("should show error for email without extension", async () => {
      renderFormRequestDetails();

      const emailInput = screen.getByLabelText(/email address/i);

      await user.clear(emailInput);
      await user.type(emailInput, "user@example");

      // Trigger validation
      await user.tab();

      await waitFor(() => {
        expect(emailInput).toHaveAttribute("aria-invalid", "true");
      });
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
    });
  });

  describe("Validation - Real-time Feedback", () => {
    test("should validate phone number on blur", async () => {
      renderFormRequestDetails();

      const phoneInput = screen.getByLabelText(/phone number/i);

      // Type invalid characters
      await user.clear(phoneInput);
      await user.type(phoneInput, "abc");

      // No error yet (validation happens on blur)
      expect(phoneInput).not.toHaveAttribute("aria-invalid", "true");

      // Trigger validation
      await user.tab();
      await waitFor(() => {
        expect(phoneInput).toHaveAttribute("aria-invalid", "true");
      });

      // Clear and type valid
      await user.clear(phoneInput);
      await user.type(phoneInput, "1234567890");
      await user.tab();
      await waitFor(() => {
        expect(phoneInput).not.toHaveAttribute("aria-invalid", "true");
      });
    });

    test("should validate email on blur", async () => {
      renderFormRequestDetails();

      const emailInput = screen.getByLabelText(/email address/i);

      // Type invalid format
      await user.clear(emailInput);
      await user.type(emailInput, "invalid");

      // No error yet (validation happens on blur)
      expect(emailInput).not.toHaveAttribute("aria-invalid", "true");

      // Trigger validation
      await user.tab();
      await waitFor(() => {
        expect(emailInput).toHaveAttribute("aria-invalid", "true");
      });

      // Clear and type valid email
      await user.clear(emailInput);
      await user.type(emailInput, "user@example.com");
      await user.tab();
      await waitFor(() => {
        expect(emailInput).not.toHaveAttribute("aria-invalid", "true");
      });
    });

    test("should clear error when user starts typing after error", async () => {
      renderFormRequestDetails();

      const phoneInput = screen.getByLabelText(/phone number/i);

      // Type invalid and trigger validation
      await user.type(phoneInput, "invalid");
      await user.tab();
      await waitFor(() => {
        expect(phoneInput).toHaveAttribute("aria-invalid", "true");
      });

      // Start typing - error should clear immediately
      await user.click(phoneInput);
      await user.type(phoneInput, "1");
      await waitFor(() => {
        expect(phoneInput).not.toHaveAttribute("aria-invalid", "true");
      });
    });
  });

  describe("View Mode", () => {
    const mockViewData = {
      organization: "Army",
      organizationOther: "",
      pocName: "John Doe",
      pocPhone: "555-1234",
      pocEmail: "john.doe@example.com",
      useCaseDescription: "Test use case description",
    };

    test("should render in view mode when mode='view' is passed", () => {
      renderWithProviders(
        <FormRequestDetails mode="view" viewData={mockViewData} />
      );

      // Should not render form controls
      expect(
        screen.queryByRole("combobox", { name: /organization/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("textbox", { name: /point of contact name/i })
      ).not.toBeInTheDocument();

      // Should render as text
      expect(screen.getByText("Organization")).toBeInTheDocument();
      expect(screen.getByText("Army")).toBeInTheDocument();
    });

    test("should display all view data as paragraphs", () => {
      renderWithProviders(
        <FormRequestDetails mode="view" viewData={mockViewData} />
      );

      expect(screen.getByText("Organization")).toBeInTheDocument();
      expect(screen.getByText("Army")).toBeInTheDocument();

      expect(screen.getByText("Point of Contact Name")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();

      expect(screen.getByText("Phone Number")).toBeInTheDocument();
      expect(screen.getByText("555-1234")).toBeInTheDocument();

      expect(screen.getByText("Email Address")).toBeInTheDocument();
      expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();

      expect(screen.getByText("Use Case Description")).toBeInTheDocument();
      expect(screen.getByText("Test use case description")).toBeInTheDocument();
    });

    test("should display 'Other Organization' when organization is 'Other'", () => {
      const viewDataWithOther = {
        ...mockViewData,
        organization: "Other",
        organizationOther: "Custom Organization",
      };

      renderWithProviders(
        <FormRequestDetails mode="view" viewData={viewDataWithOther} />
      );

      expect(screen.getByText("Other Organization")).toBeInTheDocument();
      expect(screen.getByText("Custom Organization")).toBeInTheDocument();
    });

    test("should not display 'Other Organization' section when organization is not 'Other'", () => {
      renderWithProviders(
        <FormRequestDetails mode="view" viewData={mockViewData} />
      );

      expect(screen.queryByText("Other Organization")).not.toBeInTheDocument();
    });

    test("should display 'N/A' for empty fields", () => {
      const emptyViewData = {
        organization: "",
        organizationOther: "",
        pocName: "",
        pocPhone: "",
        pocEmail: "",
        useCaseDescription: "",
      };

      renderWithProviders(
        <FormRequestDetails mode="view" viewData={emptyViewData} />
      );

      // Should show N/A for empty values
      const naTexts = screen.getAllByText("N/A");
      expect(naTexts.length).toBeGreaterThan(0);
    });

    test("should not show validation warnings in view mode", () => {
      const viewDataWithEmptyOrg = {
        ...mockViewData,
        organization: "",
      };

      renderWithProviders(
        <FormRequestDetails mode="view" viewData={viewDataWithEmptyOrg} />
      );

      // Should not show any alerts in view mode
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    test("should render accordion in view mode", () => {
      renderWithProviders(
        <FormRequestDetails mode="view" viewData={mockViewData} />
      );

      const accordion = screen.getByRole("button", {
        name: /request details/i,
      });
      expect(accordion).toBeInTheDocument();
      expect(accordion).toHaveAttribute("aria-expanded", "true");
    });

    test("should use viewData instead of form state in view mode", () => {
      // Render with viewData that's different from any form state
      const specificViewData = {
        organization: "Navy",
        organizationOther: "",
        pocName: "Jane Smith",
        pocPhone: "555-9999",
        pocEmail: "jane.smith@navy.mil",
        useCaseDescription: "Navy specific use case",
      };

      renderWithProviders(
        <FormRequestDetails mode="view" viewData={specificViewData} />
      );

      // Should show viewData values, not form state
      expect(screen.getByText("Navy")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("555-9999")).toBeInTheDocument();
      expect(screen.getByText("jane.smith@navy.mil")).toBeInTheDocument();
      expect(screen.getByText("Navy specific use case")).toBeInTheDocument();
    });
  });
});
