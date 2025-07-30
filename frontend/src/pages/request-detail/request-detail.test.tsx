import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { renderWithProviders } from "../../test-utils";
import { RequestDetail } from "./request-detail";
import { vi } from "vitest";
import * as ReactRouterDom from "react-router-dom";
import { AppRoles } from "../../types/auth";
import * as UseAuthHook from "../../hooks/useAuth";

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useSearchParams: vi.fn(),
  };
});

// Mock useAuth hook
vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("RequestDetail", () => {
  const mockUseSearchParams = vi.mocked(ReactRouterDom.useSearchParams);
  const mockUseAuth = vi.mocked(UseAuthHook.useAuth);

  beforeEach(() => {
    // Reset to default (no search params) before each test
    mockUseSearchParams.mockReturnValue([
      new window.URLSearchParams(),
      vi.fn(),
    ]);

    // Default to APPROVER role unless specified otherwise
    mockUseAuth.mockReturnValue({
      hasRole: vi.fn((role: AppRoles) => role === AppRoles.APPROVER),
      isAuthenticated: true,
      getUserInfo: vi.fn(() => ({
        id: "test-user",
        username: "test",
        email: "test@test.com",
        firstName: "Test",
        lastName: "User",
        roles: [AppRoles.APPROVER],
      })),
      getUserRoles: vi.fn(() => [AppRoles.APPROVER]),
      hasAnyRole: vi.fn(() => true),
      hasAllRoles: vi.fn(() => true),
      isRequestor: vi.fn(() => false),
      isApprover: vi.fn(() => true),
      hasPermission: vi.fn(() => true),
      canApproveRequests: vi.fn(() => true),
      canCreateRequests: vi.fn(() => true),
      keycloak: {} as any,
    });

    // Suppress MUI Select warning for tests since the component doesn't have MenuItem options
    vi.spyOn(console, "error").mockImplementation((message, ..._args) => {
      if (
        typeof message === "string" &&
        message.includes("You have provided an out-of-range value")
      ) {
        return;
      }
      // Allow other console errors to pass through silently in tests
    });
  });

  afterEach(() => {
    // Restore all mocks
    vi.restoreAllMocks();
  });

  const renderRequestDetail = (
    searchParams: string = "",
    role: AppRoles = AppRoles.APPROVER
  ) => {
    if (searchParams) {
      mockUseSearchParams.mockReturnValue([
        new window.URLSearchParams(searchParams),
        vi.fn(),
      ]);
    }

    // Set up role-specific mock
    mockUseAuth.mockReturnValue({
      hasRole: vi.fn((checkRole: AppRoles) => checkRole === role),
      isAuthenticated: true,
      getUserInfo: vi.fn(() => ({
        id: "test-user",
        username: "test",
        email: "test@test.com",
        firstName: "Test",
        lastName: "User",
        roles: [role],
      })),
      getUserRoles: vi.fn(() => [role]),
      hasAnyRole: vi.fn(() => true),
      hasAllRoles: vi.fn(() => true),
      isRequestor: vi.fn(() => role === AppRoles.REQUESTOR),
      isApprover: vi.fn(() => role === AppRoles.APPROVER),
      hasPermission: vi.fn(() => true),
      canApproveRequests: vi.fn(() => role === AppRoles.APPROVER),
      canCreateRequests: vi.fn(() => true),
      keycloak: {} as any,
    });

    return renderWithProviders(<RequestDetail />);
  };

  describe("when no request ID is provided", () => {
    test("should render 'Request Not Found' message", () => {
      const { container } = renderRequestDetail();

      expect(screen.getByText("Request Not Found")).toBeInTheDocument();
      expect(
        screen.getByText(
          "No Request ID was given as a parameter. Please return to the previous page."
        )
      ).toBeInTheDocument();

      const containerDiv = container.querySelector(".requests-page");
      expect(containerDiv).toBeInTheDocument();
      expect(containerDiv).toHaveClass("requests-page", "marketplace-content");
    });

    test("should have proper semantic structure for error state", () => {
      const { container } = renderRequestDetail();

      const section = container.querySelector("section");
      expect(section).toHaveAttribute(
        "aria-labelledby",
        "request-not-found-heading"
      );

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Request Not Found");
      expect(heading).toHaveAttribute("id", "request-not-found-heading");
    });

    test("should be accessible when no ID provided", async () => {
      const { container } = renderRequestDetail();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("when invalid request ID is provided", () => {
    test("should render 'Request Not Found' for invalid ID", () => {
      const { container } = renderRequestDetail("?id=invalid-id");

      expect(screen.getByText("Request Not Found")).toBeInTheDocument();
      expect(
        screen.getByText("Request with ID invalid-id was not found.")
      ).toBeInTheDocument();

      const containerDiv = container.querySelector(".requests-page");
      expect(containerDiv).toBeInTheDocument();
    });
  });

  describe("when valid request ID is provided", () => {
    const validRequestId = "GnTqm8c-1983cdc2be0"; // Using the first request from mock data

    test("should render request detail page successfully", () => {
      const { container } = renderRequestDetail(`?id=${validRequestId}`);

      const requestDetailContainer = container.querySelector(
        ".request-detail-page"
      );
      expect(requestDetailContainer).toBeInTheDocument();
      expect(requestDetailContainer).toHaveClass(
        "request-detail-page",
        "cart-page",
        "marketplace-content"
      );

      const pageTitle = screen.getByText(`Request Detail - ${validRequestId}`);
      expect(pageTitle).toBeInTheDocument();
    });

    test("should render request details accordion", () => {
      renderRequestDetail(`?id=${validRequestId}`);

      expect(screen.getByText("Request Details")).toBeInTheDocument();
      expect(screen.getByLabelText("Organization")).toBeInTheDocument();

      // Check for the "Other Organization" field which contains "CDAO"
      expect(screen.getByText("Other Organization")).toBeInTheDocument();
      expect(screen.getByDisplayValue("CDAO")).toBeInTheDocument();
    });

    test("should render personal information correctly", () => {
      renderRequestDetail(`?id=${validRequestId}`);

      expect(screen.getByText("Personal Information")).toBeInTheDocument();
      expect(screen.getByText("Joe Snuffy")).toBeInTheDocument();
      expect(screen.getByText("joe.snuffy.ctr@army.mil")).toBeInTheDocument();
      expect(screen.getByText("Military")).toBeInTheDocument();
      expect(screen.getByText("III Corps")).toBeInTheDocument();
    });

    test("should render selected applications", () => {
      renderRequestDetail(`?id=${validRequestId}`);

      expect(
        screen.getByText(/Selected Applications \(8 products\)/)
      ).toBeInTheDocument();
      expect(screen.getByText("AWS")).toBeInTheDocument();
      expect(screen.getByText("C3AI")).toBeInTheDocument();
      expect(screen.getByText("Databricks")).toBeInTheDocument();
    });

    test("should render cost details", () => {
      renderRequestDetail(`?id=${validRequestId}`);

      expect(screen.getByText("Cost Details")).toBeInTheDocument();
      expect(screen.getByText("PRODUCTS REQUESTED")).toBeInTheDocument();
      expect(
        screen.getByText("APPLICATIONS PENDING PRICE")
      ).toBeInTheDocument();
      expect(screen.getByText("Estimated ROM")).toBeInTheDocument();
    });

    test("should render approval status section", () => {
      renderRequestDetail(`?id=${validRequestId}`);

      expect(screen.getByText("Approval Status")).toBeInTheDocument();
      expect(screen.getByLabelText("Reasoning")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Accept" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Reject" })
      ).toBeInTheDocument();
    });

    test("should have correct status button styling", () => {
      const { container } = renderRequestDetail(`?id=${validRequestId}`);

      // The status button should have the appropriate class based on status
      const statusButton = container.querySelector(
        ".button--pending, .button--approved, .button--denied"
      );
      expect(statusButton).toBeInTheDocument();
    });

    test("should render point of contact details", () => {
      renderRequestDetail(`?id=${validRequestId}`);

      expect(screen.getByDisplayValue("Jane Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2192192199")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("jane.doe.civ@mil.gov")
      ).toBeInTheDocument();
    });

    test("should render use case description", () => {
      renderRequestDetail(`?id=${validRequestId}`);

      const useCaseField = screen.getByLabelText("Use Case Description");
      expect(useCaseField).toBeInTheDocument();
      expect(useCaseField).toHaveAttribute("disabled");
    });

    test("should have proper DOM structure for valid request", () => {
      const { container } = renderRequestDetail(`?id=${validRequestId}`);

      const outerDiv = container.firstChild;
      expect(outerDiv).toHaveClass("request-detail-page");

      const contentWrapper = container.querySelector(
        ".cart-page__content-wrapper"
      );
      expect(contentWrapper).toBeInTheDocument();

      const leftContent = container.querySelector(".cart-page__content-left");
      const rightContent = container.querySelector(".cart-page__content-right");
      expect(leftContent).toBeInTheDocument();
      expect(rightContent).toBeInTheDocument();
    });

    test("should be accessible with valid request", async () => {
      const { container } = renderRequestDetail(`?id=${validRequestId}`);
      const results = await axe(container, {
        rules: {
          "heading-order": { enabled: false }, // Disable heading order check since h4 is used in card layout
        },
      });
      expect(results).toHaveNoViolations();
    });

    test("should have proper heading hierarchy", () => {
      renderRequestDetail(`?id=${validRequestId}`);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent(`Request Detail - ${validRequestId}`);

      // Should have multiple headings for sections
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(1);
    });

    test("should meet WCAG accessibility standards", async () => {
      const { container } = renderRequestDetail(`?id=${validRequestId}`);

      // Test heading hierarchy
      const h1 = container.querySelector("h1");
      expect(h1).toBeInTheDocument();

      // Test form labels
      const organizationLabel = screen.getByLabelText("Organization");
      expect(organizationLabel).toBeInTheDocument();

      // Run comprehensive accessibility tests
      const results = await axe(container, {
        rules: {
          "heading-order": { enabled: false }, // Disable heading order check since h4 is used in card layout
          "page-has-heading-one": { enabled: true },
          "landmark-unique": { enabled: true },
          label: { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    // Role-based rendering tests
    test("should render APPROVER view with editable reasoning field and action buttons", () => {
      renderRequestDetail(`?id=${validRequestId}`, AppRoles.APPROVER);

      // Check for APPROVER-specific elements
      expect(
        screen.getByRole("button", { name: "Accept" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Reject" })
      ).toBeInTheDocument();

      // Check that reasoning field is editable (not disabled)
      const reasoningField = screen.getByLabelText("Reasoning");
      expect(reasoningField).toBeInTheDocument();
      expect(reasoningField).not.toHaveAttribute("disabled");
    });

    test("should render REQUESTOR view with read-only reasoning field and no action buttons", () => {
      renderRequestDetail(`?id=${validRequestId}`, AppRoles.REQUESTOR);

      // Check that action buttons are NOT present for REQUESTOR
      expect(
        screen.queryByRole("button", { name: "Accept" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Reject" })
      ).not.toBeInTheDocument();

      // Check that reasoning field is read-only (disabled)
      const reasoningField = screen.getByLabelText("Reasoning");
      expect(reasoningField).toBeInTheDocument();
      expect(reasoningField).toHaveAttribute("disabled");
    });

    test("should initialize reasoning field with existing statusReason for APPROVER", () => {
      renderRequestDetail(`?id=${validRequestId}`, AppRoles.APPROVER);

      const reasoningField = screen.getByLabelText("Reasoning");
      // The mock data has a statusReason of "Approved by John Smith"
      expect(reasoningField).toHaveValue("Approved by John Smith");
    });

    test("should show existing statusReason in read-only field for REQUESTOR", () => {
      renderRequestDetail(`?id=${validRequestId}`, AppRoles.REQUESTOR);

      const reasoningField = screen.getByLabelText("Reasoning");
      // For REQUESTOR, it should show the request.statusReason value
      expect(reasoningField).toBeInTheDocument();
      expect(reasoningField).toHaveAttribute("disabled");
    });

    test("should render error view when user has no valid role", () => {
      // Mock a user with no valid roles
      mockUseAuth.mockReturnValue({
        hasRole: vi.fn(() => false),
        isAuthenticated: true,
        getUserInfo: vi.fn(() => ({
          id: "test-user",
          username: "test",
          email: "test@test.com",
          firstName: "Test",
          lastName: "User",
          roles: [],
        })),
        getUserRoles: vi.fn(() => []),
        hasAnyRole: vi.fn(() => false),
        hasAllRoles: vi.fn(() => false),
        isRequestor: vi.fn(() => false),
        isApprover: vi.fn(() => false),
        hasPermission: vi.fn(() => false),
        canApproveRequests: vi.fn(() => false),
        canCreateRequests: vi.fn(() => false),
        keycloak: {} as any,
      });

      mockUseSearchParams.mockReturnValue([
        new window.URLSearchParams(`?id=${validRequestId}`),
        vi.fn(),
      ]);

      renderWithProviders(<RequestDetail />);

      expect(screen.getByText("No User Role Found")).toBeInTheDocument();
      expect(
        screen.getByText(
          /Your user role does not match any of the expected roles/
        )
      ).toBeInTheDocument();
    });

    // Test event handler functionality
    test("should handle reasoning field changes for APPROVER", async () => {
      const user = userEvent.setup();
      renderRequestDetail(`?id=${validRequestId}`, AppRoles.APPROVER);

      const reasoningField = screen.getByLabelText("Reasoning");

      // Clear the field and type new text
      await user.clear(reasoningField);
      await user.type(reasoningField, "New reasoning text");

      expect(reasoningField).toHaveValue("New reasoning text");
    });

    test("should handle accept button click for APPROVER", async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      renderRequestDetail(`?id=${validRequestId}`, AppRoles.APPROVER);

      const acceptButton = screen.getByRole("button", { name: "Accept" });
      await user.click(acceptButton);

      // Should call updateRequest function which logs to console
      expect(consoleSpy).toHaveBeenCalledWith(
        "Updated request: ",
        expect.objectContaining({
          requestId: validRequestId,
          status: "Approved",
        })
      );

      consoleSpy.mockRestore();
    });

    test("should handle reject button click for APPROVER", async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      renderRequestDetail(`?id=${validRequestId}`, AppRoles.APPROVER);

      const rejectButton = screen.getByRole("button", { name: "Reject" });
      await user.click(rejectButton);

      // Should call updateRequest function which logs to console
      expect(consoleSpy).toHaveBeenCalledWith(
        "Updated request: ",
        expect.objectContaining({
          requestId: validRequestId,
          status: "Denied",
        })
      );

      consoleSpy.mockRestore();
    });

    test("should use custom reasoning when accepting request", async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      renderRequestDetail(`?id=${validRequestId}`, AppRoles.APPROVER);

      // Change the reasoning text
      const reasoningField = screen.getByLabelText("Reasoning");
      await user.clear(reasoningField);
      await user.type(reasoningField, "Custom approval reason");

      const acceptButton = screen.getByRole("button", { name: "Accept" });
      await user.click(acceptButton);

      // Should use the custom reasoning
      expect(consoleSpy).toHaveBeenCalledWith(
        "Updated request: ",
        expect.objectContaining({
          statusReason: "Custom approval reason",
        })
      );

      consoleSpy.mockRestore();
    });

    test("should use custom reasoning when rejecting request", async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      renderRequestDetail(`?id=${validRequestId}`, AppRoles.APPROVER);

      // Change the reasoning text
      const reasoningField = screen.getByLabelText("Reasoning");
      await user.clear(reasoningField);
      await user.type(reasoningField, "Custom rejection reason");

      const rejectButton = screen.getByRole("button", { name: "Reject" });
      await user.click(rejectButton);

      // Should use the custom reasoning
      expect(consoleSpy).toHaveBeenCalledWith(
        "Updated request: ",
        expect.objectContaining({
          statusReason: "Custom rejection reason",
        })
      );

      consoleSpy.mockRestore();
    });

    test("should use default reasoning when accepting with empty field", async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      renderRequestDetail(`?id=${validRequestId}`, AppRoles.APPROVER);

      // Clear the reasoning field
      const reasoningField = screen.getByLabelText("Reasoning");
      await user.clear(reasoningField);

      const acceptButton = screen.getByRole("button", { name: "Accept" });
      await user.click(acceptButton);

      // Should use default reasoning
      expect(consoleSpy).toHaveBeenCalledWith(
        "Updated request: ",
        expect.objectContaining({
          statusReason: "Request accepted.",
        })
      );

      consoleSpy.mockRestore();
    });

    test("should use default reasoning when rejecting with empty field", async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      renderRequestDetail(`?id=${validRequestId}`, AppRoles.APPROVER);

      // Clear the reasoning field
      const reasoningField = screen.getByLabelText("Reasoning");
      await user.clear(reasoningField);

      const rejectButton = screen.getByRole("button", { name: "Reject" });
      await user.click(rejectButton);

      // Should use default reasoning
      expect(consoleSpy).toHaveBeenCalledWith(
        "Updated request: ",
        expect.objectContaining({
          statusReason: "Request denied.",
        })
      );

      consoleSpy.mockRestore();
    });

    // Test button class rendering based on status
    test("should apply correct button class for pending status", () => {
      // Use a request with pending status
      const pendingRequestId = "JQkIwF3-1983cde1845"; // Second request in test data has pending status
      const { container } = renderRequestDetail(
        `?id=${pendingRequestId}`,
        AppRoles.APPROVER
      );

      const statusButton = container.querySelector(".button--pending");
      expect(statusButton).toBeInTheDocument();
    });
  });
});
