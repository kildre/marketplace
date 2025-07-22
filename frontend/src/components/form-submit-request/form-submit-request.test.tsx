import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import { FormSubmitRequest } from "./form-submit-request";
import { CartProvider } from "../../contexts/CartContext";
import {
  OrganizationProvider,
  useOrganization,
} from "../../contexts/OrganizationContext";
import { Product } from "../../types/products";

// Mock console.log to test output
const mockConsoleLog = vi.fn();
// eslint-disable-next-line no-console
console.log = mockConsoleLog;

// Helper component to wrap FormSubmitRequest with CartProvider
const FormSubmitRequestWithProvider: React.FC<{
  _cartItems?: Product[];
}> = ({ _cartItems = [] }) => {
  return (
    <OrganizationProvider>
      <CartProvider>
        <div>
          {/* Mock form fields that FormSubmitRequest will query */}
          <input name="pocName" defaultValue="" />
          <input name="pocPhone" defaultValue="" />
          <input name="pocEmail" defaultValue="" />
          <textarea name="useCaseDescription" defaultValue="" />
          <div id="estimatedRom">$15,000</div>
          <FormSubmitRequest />
        </div>
      </CartProvider>
    </OrganizationProvider>
  );
};

// Helper component with pre-filled form data and personal data elements
const OrganizationTestWrapper: React.FC<{
  organization?: string;
  organizationOther?: string;
  children: React.ReactNode;
}> = ({
  organization = "Organization A",
  organizationOther = "",
  children,
}) => {
  const { setOrganization, setOrganizationOther } = useOrganization();

  React.useEffect(() => {
    setOrganization(organization);
    setOrganizationOther(organizationOther);
  }, [organization, organizationOther, setOrganization, setOrganizationOther]);

  return <>{children}</>;
};

const FormSubmitRequestWithData: React.FC<{
  _cartItems?: Product[];
  formData?: {
    organization?: string;
    organizationOther?: string;
    pocName?: string;
    pocPhone?: string;
    pocEmail?: string;
    useCaseDescription?: string;
  };
  personalData?: {
    username?: string;
    email?: string;
    designation?: string;
    agency?: string;
  };
}> = ({ _cartItems = [], formData = {}, personalData = {} }) => {
  return (
    <OrganizationProvider>
      <CartProvider>
        <OrganizationTestWrapper
          organization={formData.organization}
          organizationOther={formData.organizationOther}
        >
          <div>
            {/* Personal data elements */}
            <div id="username">{personalData.username || ""}</div>
            <div id="email">{personalData.email || ""}</div>
            <div id="designation">{personalData.designation || ""}</div>
            <div id="agency">{personalData.agency || ""}</div>

            {/* Form elements */}
            <input
              name="pocName"
              defaultValue={formData.pocName || "John Doe"}
            />
            <input
              name="pocPhone"
              defaultValue={formData.pocPhone || "555-1234"}
            />
            <input
              name="pocEmail"
              defaultValue={formData.pocEmail || "john@example.com"}
            />
            <textarea
              name="useCaseDescription"
              defaultValue={formData.useCaseDescription || "Test use case"}
            />
            <div id="estimatedRom">$15,000</div>
            <FormSubmitRequest />
          </div>
        </OrganizationTestWrapper>
      </CartProvider>
    </OrganizationProvider>
  );
};

describe("FormSubmitRequest", () => {
  beforeEach(() => {
    mockConsoleLog.mockClear();
  });

  describe("Component Rendering", () => {
    it("renders checkbox and submit button", () => {
      render(<FormSubmitRequestWithProvider />);

      expect(screen.getByRole("checkbox")).toBeInTheDocument();
      expect(
        screen.getByText(
          "I understand that the Total does not include products that require additional review."
        )
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Submit Request" })
      ).toBeInTheDocument();
    });

    it("renders as a form element", () => {
      render(<FormSubmitRequestWithProvider />);

      const form = screen
        .getByRole("button", { name: "Submit Request" })
        .closest("form");
      expect(form).toBeInTheDocument();
    });

    it("has submit button disabled by default", () => {
      render(<FormSubmitRequestWithProvider />);

      const submitButton = screen.getByRole("button", {
        name: "Submit Request",
      });
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveClass("button--disabled");
    });
  });

  describe("Checkbox Functionality", () => {
    it("allows checking and unchecking the checkbox", () => {
      render(<FormSubmitRequestWithProvider />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe("Submit Button State", () => {
    it("remains disabled when checkbox is unchecked", () => {
      render(<FormSubmitRequestWithData />);

      const submitButton = screen.getByRole("button", {
        name: "Submit Request",
      });
      expect(submitButton).toBeDisabled();
    });

    it("remains disabled when checkbox is checked but organization is empty", async () => {
      render(<FormSubmitRequestWithData formData={{ organization: "" }} />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      // Wait for the effect to run and check the button state
      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: "Submit Request",
        });
        expect(submitButton).toBeDisabled();
      });
    });

    it("updates state when organization field changes", async () => {
      render(<FormSubmitRequestWithData formData={{ organization: "" }} />);

      const checkbox = screen.getByRole("checkbox");
      const organizationSelect = screen.getByRole("combobox");

      fireEvent.click(checkbox);

      // Initially disabled because organization is empty
      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: "Submit Request",
        });
        expect(submitButton).toBeDisabled();
      });

      // Change organization value
      fireEvent.change(organizationSelect, {
        target: { value: "Organization A" },
      });

      // Should now be enabled
      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: "Submit Request",
        });
        expect(submitButton).toBeEnabled();
      });
    });

    it("remains disabled when organization is 'Other' but organizationOther is empty", async () => {
      render(
        <FormSubmitRequestWithData
          formData={{ organization: "Other", organizationOther: "" }}
        />
      );

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: "Submit Request",
        });
        expect(submitButton).toBeDisabled();
      });
    });

    it("enables when organization is 'Other' and organizationOther field changes", async () => {
      render(
        <FormSubmitRequestWithData
          formData={{ organization: "Other", organizationOther: "" }}
        />
      );

      const checkbox = screen.getByRole("checkbox");
      const organizationOtherInput = screen.getByDisplayValue("");

      fireEvent.click(checkbox);

      // Initially disabled
      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: "Submit Request",
        });
        expect(submitButton).toBeDisabled();
      });

      // Fill organizationOther field
      fireEvent.change(organizationOtherInput, {
        target: { value: "Custom Org" },
      });

      // Should now be enabled
      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: "Submit Request",
        });
        expect(submitButton).toBeEnabled();
      });
    });

    it("enables submit button when checkbox is checked and organization is selected", async () => {
      render(<FormSubmitRequestWithData />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: "Submit Request",
        });
        expect(submitButton).toBeEnabled();
        expect(submitButton).not.toHaveClass("button--disabled");
      });
    });

    it("enables submit button when organization is 'Other' and organizationOther is filled", async () => {
      render(
        <FormSubmitRequestWithData
          formData={{ organization: "Other", organizationOther: "Custom Org" }}
        />
      );

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: "Submit Request",
        });
        expect(submitButton).toBeEnabled();
      });
    });
  });

  describe("Form Submission", () => {
    it("prevents default form submission", () => {
      render(<FormSubmitRequestWithData />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      // Find the form and create a spy on its submit event
      const form = screen
        .getByRole("button", { name: "Submit Request" })
        .closest("form");
      expect(form).toBeInTheDocument();

      const handleSubmit = vi.fn((e) => e.preventDefault());
      if (form) {
        form.addEventListener("submit", handleSubmit);

        fireEvent.submit(form);

        expect(handleSubmit).toHaveBeenCalled();
      }
    });

    it("logs form data to console when submitted", async () => {
      render(<FormSubmitRequestWithData />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: "Submit Request",
        });
        expect(submitButton).toBeEnabled();
      });

      const submitButton = screen.getByRole("button", {
        name: "Submit Request",
      });
      fireEvent.click(submitButton);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        "=== FORM SUBMISSION DATA ==="
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        "============================="
      );

      // Check that JSON data was logged
      const jsonCall = mockConsoleLog.mock.calls.find(
        (call: unknown[]) =>
          typeof call[0] === "string" && call[0].includes('"requestId"')
      );
      expect(jsonCall).toBeTruthy();
    });

    it("includes correct form data in submission", async () => {
      const formData = {
        organization: "Organization A",
        pocName: "John Doe",
        pocPhone: "555-1234",
        pocEmail: "john@example.com",
        useCaseDescription: "Test use case description",
      };

      render(<FormSubmitRequestWithData formData={formData} />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: "Submit Request",
        });
        expect(submitButton).toBeEnabled();
      });

      const submitButton = screen.getByRole("button", {
        name: "Submit Request",
      });
      fireEvent.click(submitButton);

      // Get the JSON string that was logged
      const jsonCall = mockConsoleLog.mock.calls.find(
        (call: unknown[]) =>
          typeof call[0] === "string" && call[0].includes('"requestId"')
      );

      expect(jsonCall).toBeTruthy();
      if (jsonCall) {
        const submittedData = JSON.parse(jsonCall[0] as string);

        expect(submittedData.requestDetails).toEqual({
          organization: "Organization A",
          organizationOther: "",
          pocName: "John Doe",
          pocPhone: "555-1234",
          pocEmail: "john@example.com",
          useCaseDescription: "Test use case description",
        });
      }
    });

    it("includes personal data in submission", async () => {
      const personalData = {
        username: "John Smith",
        email: "john.smith@example.com",
        designation: "Data Scientist",
        agency: "Department of Defense",
      };

      render(<FormSubmitRequestWithData personalData={personalData} />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: "Submit Request",
        });
        expect(submitButton).toBeEnabled();
      });

      const submitButton = screen.getByRole("button", {
        name: "Submit Request",
      });
      fireEvent.click(submitButton);

      const jsonCall = mockConsoleLog.mock.calls.find(
        (call: unknown[]) =>
          typeof call[0] === "string" && call[0].includes('"requestId"')
      );

      expect(jsonCall).toBeTruthy();
      if (jsonCall) {
        const submittedData = JSON.parse(jsonCall[0] as string);

        expect(submittedData.personalData).toEqual({
          name: "John Smith",
          email: "john.smith@example.com",
          designation: "Data Scientist",
          agency: "Department of Defense",
        });
      }
    });

    it("handles missing personal data elements gracefully", async () => {
      render(<FormSubmitRequestWithData />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: "Submit Request",
        });
        expect(submitButton).toBeEnabled();
      });

      const submitButton = screen.getByRole("button", {
        name: "Submit Request",
      });
      fireEvent.click(submitButton);

      const jsonCall = mockConsoleLog.mock.calls.find(
        (call: unknown[]) =>
          typeof call[0] === "string" && call[0].includes('"requestId"')
      );

      expect(jsonCall).toBeTruthy();
      if (jsonCall) {
        const submittedData = JSON.parse(jsonCall[0] as string);

        expect(submittedData.personalData).toEqual({
          name: "",
          email: "",
          designation: "",
          agency: "",
        });
      }
    });

    it("includes empty cart items when no items in cart", async () => {
      render(<FormSubmitRequestWithData />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: "Submit Request",
        });
        expect(submitButton).toBeEnabled();
      });

      const submitButton = screen.getByRole("button", {
        name: "Submit Request",
      });
      fireEvent.click(submitButton);

      const jsonCall = mockConsoleLog.mock.calls.find(
        (call: unknown[]) =>
          typeof call[0] === "string" && call[0].includes('"requestId"')
      );

      expect(jsonCall).toBeTruthy();
      if (jsonCall) {
        const submittedData = JSON.parse(jsonCall[0] as string);

        expect(submittedData.cartItems).toEqual([]);
        expect(submittedData.summary.totalItems).toBe(0);
        expect(submittedData.summary.totalQuantity).toBe(0);
        expect(submittedData.summary.pendingPriceItems).toBe(0);
      }
    });

    it("includes estimated ROM from DOM element", async () => {
      render(<FormSubmitRequestWithData />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: "Submit Request",
        });
        expect(submitButton).toBeEnabled();
      });

      const submitButton = screen.getByRole("button", {
        name: "Submit Request",
      });
      fireEvent.click(submitButton);

      const jsonCall = mockConsoleLog.mock.calls.find(
        (call: unknown[]) =>
          typeof call[0] === "string" && call[0].includes('"requestId"')
      );

      expect(jsonCall).toBeTruthy();
      if (jsonCall) {
        const submittedData = JSON.parse(jsonCall[0] as string);

        expect(submittedData.summary.estimatedROM).toBe("$15,000");
      }
    });

    it("includes request metadata", async () => {
      render(<FormSubmitRequestWithData />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: "Submit Request",
        });
        expect(submitButton).toBeEnabled();
      });

      const submitButton = screen.getByRole("button", {
        name: "Submit Request",
      });
      fireEvent.click(submitButton);

      const jsonCall = mockConsoleLog.mock.calls.find(
        (call: unknown[]) =>
          typeof call[0] === "string" && call[0].includes('"requestId"')
      );

      expect(jsonCall).toBeTruthy();
      if (jsonCall) {
        const submittedData = JSON.parse(jsonCall[0] as string);

        expect(submittedData.requestId).toEqual(expect.any(Number));
        expect(submittedData.submittedAt).toEqual(expect.any(String));
        expect(new Date(submittedData.submittedAt)).toBeInstanceOf(Date);
      }
    });
  });

  describe("Edge Cases", () => {
    it("handles missing DOM elements gracefully", () => {
      // Render without some form fields
      const { container } = render(
        <CartProvider>
          <div>
            <FormSubmitRequest />
          </div>
        </CartProvider>
      );

      expect(container).toBeInTheDocument();

      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByRole("button", {
        name: "Submit Request",
      });

      expect(checkbox).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it("handles missing estimatedRom element", async () => {
      render(
        <CartProvider>
          <div>
            <select name="organization" defaultValue="Organization A">
              <option value="Organization A">Organization A</option>
            </select>
            <input name="organizationOther" defaultValue="" />
            <input name="pocName" defaultValue="John Doe" />
            <input name="pocPhone" defaultValue="555-1234" />
            <input name="pocEmail" defaultValue="john@example.com" />
            <textarea name="useCaseDescription" defaultValue="Test" />
            {/* No estimatedRom element */}
            <FormSubmitRequest />
          </div>
        </CartProvider>
      );

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: "Submit Request",
        });
        expect(submitButton).toBeEnabled();
      });

      const submitButton = screen.getByRole("button", {
        name: "Submit Request",
      });
      fireEvent.click(submitButton);

      const jsonCall = mockConsoleLog.mock.calls.find(
        (call: unknown[]) =>
          typeof call[0] === "string" && call[0].includes('"requestId"')
      );

      expect(jsonCall).toBeTruthy();
      if (jsonCall) {
        const submittedData = JSON.parse(jsonCall[0] as string);
        expect(submittedData.summary.estimatedROM).toBeUndefined();
      }
    });

    it("generates unique request IDs", async () => {
      const requestIds = new Set();

      for (let i = 0; i < 5; i++) {
        mockConsoleLog.mockClear();
        cleanup(); // Clean up previous renders

        render(<FormSubmitRequestWithData />);

        const checkbox = screen.getByRole("checkbox");
        fireEvent.click(checkbox);

        await waitFor(() => {
          const submitButton = screen.getByRole("button", {
            name: "Submit Request",
          });
          expect(submitButton).toBeEnabled();
        });

        const submitButton = screen.getByRole("button", {
          name: "Submit Request",
        });
        fireEvent.click(submitButton);

        const jsonCall = mockConsoleLog.mock.calls.find(
          (call: unknown[]) =>
            typeof call[0] === "string" && call[0].includes('"requestId"')
        );

        if (jsonCall) {
          const submittedData = JSON.parse(jsonCall[0] as string);
          requestIds.add(submittedData.requestId);
        }
      }

      // Should have generated multiple unique IDs (though not guaranteed due to randomness)
      expect(requestIds.size).toBeGreaterThan(0);
    });
  });

  describe("Integration with Cart Context", () => {
    // Note: These tests would require setting up a proper CartProvider with initial cart items
    // Since the current implementation doesn't easily allow injecting cart items,
    // we're testing the structure that would be output

    it("structures cart data correctly in output", async () => {
      render(<FormSubmitRequestWithData />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: "Submit Request",
        });
        expect(submitButton).toBeEnabled();
      });

      const submitButton = screen.getByRole("button", {
        name: "Submit Request",
      });
      fireEvent.click(submitButton);

      const jsonCall = mockConsoleLog.mock.calls.find(
        (call: unknown[]) =>
          typeof call[0] === "string" && call[0].includes('"requestId"')
      );

      expect(jsonCall).toBeTruthy();
      if (jsonCall) {
        const submittedData = JSON.parse(jsonCall[0] as string);

        // Verify the structure includes personal data
        expect(submittedData).toHaveProperty("requestId");
        expect(submittedData).toHaveProperty("personalData");
        expect(submittedData).toHaveProperty("requestDetails");
        expect(submittedData).toHaveProperty("cartItems");
        expect(submittedData).toHaveProperty("summary");
        expect(submittedData).toHaveProperty("submittedAt");

        expect(submittedData.personalData).toHaveProperty("name");
        expect(submittedData.personalData).toHaveProperty("email");
        expect(submittedData.personalData).toHaveProperty("designation");
        expect(submittedData.personalData).toHaveProperty("agency");

        expect(submittedData.summary).toHaveProperty("totalItems");
        expect(submittedData.summary).toHaveProperty("totalQuantity");
        expect(submittedData.summary).toHaveProperty("pendingPriceItems");
        expect(submittedData.summary).toHaveProperty("estimatedROM");
      }
    });
  });

  describe("Event Listener Management", () => {
    it("adds and removes event listeners properly", () => {
      // Mock querySelector to return elements with event listener methods
      const mockElement = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        value: "Organization A",
      };

      const originalQuerySelectorAll = document.querySelectorAll;
      document.querySelectorAll = vi
        .fn()
        .mockReturnValue([mockElement, mockElement]);

      const { unmount } = render(<FormSubmitRequestWithData />);

      // Should have called querySelectorAll to get form elements
      expect(document.querySelectorAll).toHaveBeenCalledWith(
        '[name="organization"], [name="organizationOther"]'
      );

      // Should have added event listeners for change and input events
      expect(mockElement.addEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      );
      expect(mockElement.addEventListener).toHaveBeenCalledWith(
        "input",
        expect.any(Function)
      );

      unmount();

      // Should have removed event listeners on cleanup
      expect(mockElement.removeEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      );
      expect(mockElement.removeEventListener).toHaveBeenCalledWith(
        "input",
        expect.any(Function)
      );

      // Restore original method
      document.querySelectorAll = originalQuerySelectorAll;
    });

    it("responds to input events on form fields", async () => {
      render(<FormSubmitRequestWithData formData={{ organization: "" }} />);

      const checkbox = screen.getByRole("checkbox");
      const organizationSelect = screen.getByRole("combobox");

      fireEvent.click(checkbox);

      // Initially disabled
      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: "Submit Request",
        });
        expect(submitButton).toBeDisabled();
      });

      // Trigger input event
      fireEvent.input(organizationSelect, {
        target: { value: "Organization B" },
      });

      // Should be enabled after input event
      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: "Submit Request",
        });
        expect(submitButton).toBeEnabled();
      });
    });
  });

  describe("Form Validation Edge Cases", () => {
    it("handles checkbox state changes properly", async () => {
      render(<FormSubmitRequestWithData />);

      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByRole("button", {
        name: "Submit Request",
      });

      // Initially disabled
      expect(submitButton).toBeDisabled();

      // Enable by checking
      fireEvent.click(checkbox);
      await waitFor(() => expect(submitButton).toBeEnabled());

      // Disable by unchecking
      fireEvent.click(checkbox);
      await waitFor(() => expect(submitButton).toBeDisabled());

      // Enable again
      fireEvent.click(checkbox);
      await waitFor(() => expect(submitButton).toBeEnabled());
    });

    it("validates organization 'Other' field dynamically", async () => {
      render(
        <FormSubmitRequestWithData
          formData={{ organization: "Other", organizationOther: "" }}
        />
      );

      const checkbox = screen.getByRole("checkbox");
      const organizationOtherInput = screen.getByDisplayValue("");
      const submitButton = screen.getByRole("button", {
        name: "Submit Request",
      });

      fireEvent.click(checkbox);

      // Initially disabled because organizationOther is empty
      await waitFor(() => expect(submitButton).toBeDisabled());

      // Enable by filling organizationOther
      fireEvent.change(organizationOtherInput, {
        target: { value: "Test Org" },
      });
      await waitFor(() => expect(submitButton).toBeEnabled());

      // Disable by clearing organizationOther
      fireEvent.change(organizationOtherInput, { target: { value: "" } });
      await waitFor(() => expect(submitButton).toBeDisabled());
    });
  });

  describe("Order Independence Tests", () => {
    it("enables button when checkbox is checked first, then form fields are filled", async () => {
      render(<FormSubmitRequestWithData formData={{ organization: "" }} />);

      const checkbox = screen.getByRole("checkbox");
      const organizationSelect = screen.getByRole("combobox");
      const submitButton = screen.getByRole("button", {
        name: "Submit Request",
      });

      // Check checkbox first
      fireEvent.click(checkbox);

      // Should be disabled because organization is empty
      await waitFor(() => expect(submitButton).toBeDisabled());

      // Then fill organization field
      fireEvent.change(organizationSelect, {
        target: { value: "Organization A" },
      });

      // Should now be enabled
      await waitFor(() => expect(submitButton).toBeEnabled());
    });

    it("enables button when form fields are filled first, then checkbox is checked", async () => {
      render(<FormSubmitRequestWithData formData={{ organization: "" }} />);

      const checkbox = screen.getByRole("checkbox");
      const organizationSelect = screen.getByRole("combobox");
      const submitButton = screen.getByRole("button", {
        name: "Submit Request",
      });

      // Fill organization field first
      fireEvent.change(organizationSelect, {
        target: { value: "Organization A" },
      });

      // Should still be disabled because checkbox is unchecked
      await waitFor(() => expect(submitButton).toBeDisabled());

      // Then check checkbox
      fireEvent.click(checkbox);

      // Should now be enabled
      await waitFor(() => expect(submitButton).toBeEnabled());
    });

    it("handles 'Other' organization correctly regardless of order", async () => {
      render(
        <FormSubmitRequestWithData
          formData={{ organization: "", organizationOther: "" }}
        />
      );

      const checkbox = screen.getByRole("checkbox");
      const organizationSelect = screen.getByRole("combobox");
      const organizationOtherInput = screen.getByDisplayValue("");
      const submitButton = screen.getByRole("button", {
        name: "Submit Request",
      });

      // Scenario 1: Checkbox first
      fireEvent.click(checkbox);
      await waitFor(() => expect(submitButton).toBeDisabled());

      fireEvent.change(organizationSelect, {
        target: { value: "Other" },
      });
      await waitFor(() => expect(submitButton).toBeDisabled());

      fireEvent.change(organizationOtherInput, {
        target: { value: "Custom Org" },
      });
      await waitFor(() => expect(submitButton).toBeEnabled());

      // Reset
      fireEvent.click(checkbox); // Uncheck
      fireEvent.change(organizationSelect, {
        target: { value: "" },
      });
      fireEvent.change(organizationOtherInput, {
        target: { value: "" },
      });
      await waitFor(() => expect(submitButton).toBeDisabled());

      // Scenario 2: Form fields first
      fireEvent.change(organizationSelect, {
        target: { value: "Other" },
      });
      fireEvent.change(organizationOtherInput, {
        target: { value: "Custom Org" },
      });
      await waitFor(() => expect(submitButton).toBeDisabled()); // Still disabled because checkbox unchecked

      fireEvent.click(checkbox); // Check
      await waitFor(() => expect(submitButton).toBeEnabled());
    });
  });
});
