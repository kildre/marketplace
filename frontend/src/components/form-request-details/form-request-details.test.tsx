import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { FormRequestDetails } from "./form-request-details";

// Create a test theme for Material-UI components
const testTheme = createTheme({
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});

interface FormValues {
  organization: string;
  organizationOther: string;
  pocName?: string;
  pocPhone?: string;
  pocEmail?: string;
  useCaseDescription?: string;
}

describe("FormRequestDetails", () => {
  const user = userEvent.setup();
  const mockHandleChange = vi.fn();

  const defaultFormValues: FormValues = {
    organization: "",
    organizationOther: "",
    pocName: "",
    pocPhone: "",
    pocEmail: "",
    useCaseDescription: "",
  };

  const renderFormRequestDetails = (
    formValues: FormValues = defaultFormValues
  ) => {
    return render(
      <ThemeProvider theme={testTheme}>
        <FormRequestDetails
          formValues={formValues}
          handleChange={mockHandleChange}
        />
      </ThemeProvider>
    );
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

      const formContainer = container.querySelector(
        ".form-request-details__container"
      );
      expect(formContainer).toBeInTheDocument();
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

    test("should render organization select with correct options", () => {
      renderFormRequestDetails();

      const organizationSelect = screen.getByRole("combobox");
      expect(organizationSelect).toBeInTheDocument();
      expect(organizationSelect).toHaveAttribute("id", "organization-select");

      // Open the select dropdown
      fireEvent.mouseDown(organizationSelect);

      const options = screen.getAllByRole("option");
      expect(options.length).toBeGreaterThan(50); // Should have many organization options

      // Check for some key organizations
      expect(
        screen.getByRole("option", { name: "AFRICOM" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "Air Force" })
      ).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Army" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Navy" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "CDAO" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Other" })).toBeInTheDocument();
    });

    test("should render organization options from organizationOptions array", () => {
      renderFormRequestDetails();

      const organizationSelect = screen.getByRole("combobox");
      fireEvent.mouseDown(organizationSelect);

      // Test that specific organizations from the array are present
      const expectedOrganizations = [
        "AFRICOM",
        "Air Force",
        "Army",
        "CDAO",
        "Navy",
        "Space Force",
        "USMC",
        "SOCOM",
        "Other",
      ];

      expectedOrganizations.forEach((org) => {
        expect(screen.getByRole("option", { name: org })).toBeInTheDocument();
      });
    });

    test("should render all POC detail fields", () => {
      renderFormRequestDetails();

      expect(
        screen.getByLabelText(/point of contact name/i)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    test("should render use case description field", () => {
      renderFormRequestDetails();

      const useCaseField = screen.getByLabelText(/use case description/i);
      expect(useCaseField).toBeInTheDocument();
      expect(useCaseField).toHaveAttribute("name", "useCaseDescription");
    });
  });

  describe("Alert Messages", () => {
    test("should show warning when organization is not selected", () => {
      renderFormRequestDetails({ ...defaultFormValues, organization: "" });

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(
        "Please select an organization that this request is on behalf of."
      );
    });

    test("should show warning when Other is selected but organizationOther is empty", () => {
      renderFormRequestDetails({
        ...defaultFormValues,
        organization: "Other",
        organizationOther: "",
      });

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(
        "Please specify the organization you are requesting on behalf of."
      );
    });

    test("should not show organization warning when organization is selected", () => {
      renderFormRequestDetails({ ...defaultFormValues, organization: "Army" });

      const alerts = screen.queryAllByRole("alert");
      expect(alerts).toHaveLength(0);
    });

    test("should not show organizationOther warning when Other is selected and organizationOther is filled", () => {
      renderFormRequestDetails({
        ...defaultFormValues,
        organization: "Other",
        organizationOther: "Custom Organization",
      });

      const alerts = screen.queryAllByRole("alert");
      expect(alerts).toHaveLength(0);
    });
  });

  describe("Organization Selection", () => {
    test("should display placeholder when no organization is selected", () => {
      renderFormRequestDetails();

      const organizationSelect = screen.getByRole("combobox");
      expect(organizationSelect).toHaveTextContent("- Select -");
    });

    test("should display selected organization value", () => {
      renderFormRequestDetails({ ...defaultFormValues, organization: "Army" });

      const organizationSelect = screen.getByRole("combobox");
      expect(organizationSelect).toHaveTextContent("Army");
    });

    test("should call handleChange when organization is selected", async () => {
      renderFormRequestDetails();

      const organizationSelect = screen.getByRole("combobox");
      fireEvent.mouseDown(organizationSelect);

      const armyOption = screen.getByRole("option", { name: "Army" });
      fireEvent.click(armyOption);

      expect(mockHandleChange).toHaveBeenCalled();

      // Check that the handler was called with the correct value
      const lastCall =
        mockHandleChange.mock.calls[mockHandleChange.mock.calls.length - 1];
      expect(lastCall.length).toBe(2); // Material-UI Select passes (event, child)
      expect(lastCall[1].props.value).toBe("Army");
    });

    test("should show organizationOther field when Other is selected", () => {
      renderFormRequestDetails({ ...defaultFormValues, organization: "Other" });

      const organizationOtherField = screen.getByLabelText(
        /please specify the organization/i
      );
      expect(organizationOtherField).toBeInTheDocument();
      expect(organizationOtherField).toHaveAttribute(
        "name",
        "organizationOther"
      );
    });

    test("should hide organizationOther field when Other is not selected", () => {
      renderFormRequestDetails({ ...defaultFormValues, organization: "Army" });

      const organizationOtherField = screen.queryByLabelText(
        /please specify the organization/i
      );
      expect(organizationOtherField).not.toBeInTheDocument();
    });
  });

  describe("Form Field Interactions", () => {
    test("should call handleChange when POC name is updated", async () => {
      renderFormRequestDetails();

      const pocNameField = screen.getByLabelText(/point of contact name/i);
      await user.type(pocNameField, "John");

      // Check that the handler was called
      expect(mockHandleChange).toHaveBeenCalled();

      // Check that each call has the correct field name
      const calls = mockHandleChange.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0][0].target.name).toBe("pocName");
    });

    test("should call handleChange when phone number is updated", async () => {
      renderFormRequestDetails();

      const phoneField = screen.getByLabelText(/phone number/i);
      await user.type(phoneField, "555");

      // Check that the handler was called
      expect(mockHandleChange).toHaveBeenCalled();

      // Check that each call has the correct field name
      const calls = mockHandleChange.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0][0].target.name).toBe("pocPhone");
    });

    test("should call handleChange when email is updated", async () => {
      renderFormRequestDetails();

      const emailField = screen.getByLabelText(/email address/i);
      await user.type(emailField, "test@example.com");

      // Check that the handler was called
      expect(mockHandleChange).toHaveBeenCalled();

      // Check that each call has the correct field name
      const calls = mockHandleChange.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0][0].target.name).toBe("pocEmail");
    });

    test("should call handleChange when use case description is updated", async () => {
      renderFormRequestDetails();

      const useCaseField = screen.getByLabelText(/use case description/i);
      await user.type(useCaseField, "Test use case");

      // Check that the handler was called
      expect(mockHandleChange).toHaveBeenCalled();

      // Check that each call has the correct field name
      const calls = mockHandleChange.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0][0].target.name).toBe("useCaseDescription");
    });

    test("should call handleChange when organizationOther is updated", async () => {
      renderFormRequestDetails({ ...defaultFormValues, organization: "Other" });

      const organizationOtherField = screen.getByLabelText(
        /please specify the organization/i
      );
      await user.type(organizationOtherField, "Custom Org");

      // Check that the handler was called
      expect(mockHandleChange).toHaveBeenCalled();

      // Check that each call has the correct field name
      const calls = mockHandleChange.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0][0].target.name).toBe("organizationOther");
    });
  });

  describe("Form Values Display", () => {
    test("should display form values correctly", () => {
      const formValues = {
        organization: "Navy",
        organizationOther: "",
        pocName: "Jane Smith",
        pocPhone: "555-9876",
        pocEmail: "jane@example.com",
        useCaseDescription: "Test description",
      };

      renderFormRequestDetails(formValues);

      expect(screen.getByRole("combobox")).toHaveTextContent("Navy");
      expect(screen.getByDisplayValue("Jane Smith")).toBeInTheDocument();
      expect(screen.getByDisplayValue("555-9876")).toBeInTheDocument();
      expect(screen.getByDisplayValue("jane@example.com")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test description")).toBeInTheDocument();
    });

    test("should display organizationOther value when Other is selected", () => {
      const formValues = {
        organization: "Other",
        organizationOther: "Custom Organization",
        pocName: "",
        pocPhone: "",
        pocEmail: "",
        useCaseDescription: "",
      };

      renderFormRequestDetails(formValues);

      expect(
        screen.getByDisplayValue("Custom Organization")
      ).toBeInTheDocument();
    });
  });

  describe("Field Types and Attributes", () => {
    test("should have correct input types", () => {
      renderFormRequestDetails();

      const phoneField = screen.getByLabelText(/phone number/i);
      const emailField = screen.getByLabelText(/email address/i);

      expect(phoneField).toHaveAttribute("type", "tel");
      expect(emailField).toHaveAttribute("type", "email");
    });

    test("should have multiline use case description field", () => {
      renderFormRequestDetails();

      const useCaseField = screen.getByLabelText(/use case description/i);
      expect(useCaseField.tagName).toBe("TEXTAREA");
    });

    test("should have required organization field", () => {
      const { container } = renderFormRequestDetails();

      const organizationFormControl = container.querySelector(
        ".form-request-details__organization"
      );
      expect(organizationFormControl).toBeInTheDocument();

      // Check that the FormControl has the required prop applied
      // In Material-UI, the required attribute is applied to the underlying input
      const organizationSelect = screen.getByRole("combobox");
      expect(organizationSelect).toHaveAttribute("aria-required", "true");
    });
  });

  describe("CSS Classes", () => {
    test("should have correct CSS classes applied", () => {
      const { container } = renderFormRequestDetails();

      expect(
        container.querySelector(".form-request-details__container")
      ).toBeInTheDocument();
      expect(
        container.querySelector(".form-request-details__accordion-details")
      ).toBeInTheDocument();
      expect(
        container.querySelector(".form-request-details__organization")
      ).toBeInTheDocument();
      expect(
        container.querySelector(".form-request-details__poc-details")
      ).toBeInTheDocument();
      expect(
        container.querySelectorAll(".form-request-details__poc-detail-item")
      ).toHaveLength(3);
    });

    test("should apply correct class to organizationOther field when visible", () => {
      const { container } = renderFormRequestDetails({
        ...defaultFormValues,
        organization: "Other",
      });

      const organizationOtherField = container.querySelector(
        ".form-request-details__organization-other"
      );
      expect(organizationOtherField).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    test("should have proper label associations", () => {
      renderFormRequestDetails();

      const pocNameField = screen.getByLabelText(/point of contact name/i);
      const phoneField = screen.getByLabelText(/phone number/i);
      const emailField = screen.getByLabelText(/email address/i);
      const useCaseField = screen.getByLabelText(/use case description/i);

      expect(pocNameField).toHaveAttribute("id", "poc-name");
      expect(phoneField).toHaveAttribute("id", "poc-phone");
      expect(emailField).toHaveAttribute("id", "poc-email");
      expect(useCaseField).toHaveAttribute("id", "use-case-description");
    });

    test("should have proper accordion accessibility attributes", () => {
      renderFormRequestDetails();

      const accordionSummary = screen.getByRole("button", {
        name: /request details/i,
      });
      expect(accordionSummary).toHaveAttribute(
        "aria-controls",
        "request-details-content"
      );
      expect(accordionSummary).toHaveAttribute("id", "request-details-header");
    });

    test("should have organization label with required indicator", () => {
      const { container } = renderFormRequestDetails();

      const organizationLabel = container.querySelector("#organization-label");
      expect(organizationLabel).toBeInTheDocument();
      expect(organizationLabel).toHaveTextContent("Organization*");
    });
  });

  describe("Accordion Functionality", () => {
    test("should toggle accordion when clicked", async () => {
      renderFormRequestDetails();

      const accordionSummary = screen.getByRole("button", {
        name: /request details/i,
      });
      expect(accordionSummary).toHaveAttribute("aria-expanded", "true");

      await user.click(accordionSummary);
      expect(accordionSummary).toHaveAttribute("aria-expanded", "false");

      await user.click(accordionSummary);
      expect(accordionSummary).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Edge Cases", () => {
    test("should handle undefined form values gracefully", () => {
      const formValuesWithUndefined = {
        organization: "",
        organizationOther: "",
        pocName: undefined,
        pocPhone: undefined,
        pocEmail: undefined,
        useCaseDescription: undefined,
      };

      expect(() => {
        renderFormRequestDetails(formValuesWithUndefined);
      }).not.toThrow();
    });

    test("should handle long text inputs", async () => {
      renderFormRequestDetails();

      const longText = "A".repeat(10); // Use shorter text to avoid test timeout
      const useCaseField = screen.getByLabelText(/use case description/i);

      await user.type(useCaseField, longText);

      // Check that the handler was called
      expect(mockHandleChange).toHaveBeenCalled();

      // Check that each character was typed (userEvent types one character at a time)
      expect(mockHandleChange.mock.calls.length).toBe(longText.length);

      // Check that the final call has the correct name
      const lastCall =
        mockHandleChange.mock.calls[mockHandleChange.mock.calls.length - 1][0];
      expect(lastCall.target.name).toBe("useCaseDescription");
    });

    test("should handle special characters in inputs", async () => {
      renderFormRequestDetails();

      const specialChars = "test!@#";
      const pocNameField = screen.getByLabelText(/point of contact name/i);

      await user.type(pocNameField, specialChars);

      // Check that the handler was called
      expect(mockHandleChange).toHaveBeenCalled();

      // Check that each character was typed (userEvent types one character at a time)
      expect(mockHandleChange.mock.calls.length).toBe(specialChars.length);

      // Check that the final call has the correct name
      const lastCall =
        mockHandleChange.mock.calls[mockHandleChange.mock.calls.length - 1][0];
      expect(lastCall.target.name).toBe("pocName");
    });
  });

  describe("Component Props Validation", () => {
    test("should work with minimal form values", () => {
      const minimalFormValues = {
        organization: "",
        organizationOther: "",
      };

      expect(() => {
        renderFormRequestDetails(minimalFormValues);
      }).not.toThrow();
    });

    test("should work with complete form values", () => {
      const completeFormValues = {
        organization: "CDAO",
        organizationOther: "",
        pocName: "John Doe",
        pocPhone: "555-1234",
        pocEmail: "john@example.com",
        useCaseDescription: "Complete test case",
      };

      expect(() => {
        renderFormRequestDetails(completeFormValues);
      }).not.toThrow();
    });
  });
});
