import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { Requests } from "./requests";
import { AppRoles } from "../../types/auth";

// Mock the useAuth hook
const mockUseAuth = vi.fn();

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock the useRequests hook to prevent API calls
vi.mock("../../hooks/useRequests", () => ({
  useRequests: vi.fn(() => ({
    requestsCount: 0,
    requests: [],
    userId: undefined,
    refetch: vi.fn(),
  })),
}));

// Mock the useRequestsRefresh hook
vi.mock("../../hooks/useRequestsRefresh", () => ({
  useRequestsRefresh: vi.fn(() => ({
    subscribe: vi.fn(() => vi.fn()),
  })),
}));

// Mock react-router-dom hooks
const mockUseLocation = vi.fn();
const mockUseParams = vi.fn();
const mockUseSearchParams = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => mockUseParams(),
    useSearchParams: () => mockUseSearchParams(),
    useLocation: () => mockUseLocation(),
  };
});

// Mock the PageTitle component
vi.mock("../../components/page-title/page-title", () => ({
  PageTitle: ({ title }: { title: string }) => (
    <h1 id="requests-heading">{title}</h1>
  ),
}));

// Mock the RequestsTable component since we're testing the Requests page logic
vi.mock("../../components/requests-table/requests-table", () => ({
  RequestsTable: ({
    userId,
    showUserColumn,
  }: {
    userId?: string;
    showUserColumn?: boolean;
  }) => (
    <div
      data-testid="requests-table"
      {...(userId !== undefined ? { "data-user-id": userId } : {})}
      data-show-user-column={showUserColumn}
    >
      Mock RequestsTable
    </div>
  ),
}));

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("Requests", () => {
  const renderRequestsWithRouter = (
    userRole = AppRoles.REQUESTOR,
    locationState: any = null
  ) => {
    // Mock the useAuth hook with the specified role
    mockUseAuth.mockReturnValue({
      isRequestor: () => userRole === AppRoles.REQUESTOR,
      isApprover: () => userRole === AppRoles.APPROVER,
      getUserInfo: () => ({
        id: "test-user-123",
        username: userRole === AppRoles.REQUESTOR ? "developer" : "approver",
        email: "test@advana.mil",
        firstName: "Test",
        lastName: "User",
        roles: [userRole],
      }),
    });

    // Mock react-router hooks
    mockUseLocation.mockReturnValue({
      pathname: "/requests",
      search: "",
      hash: "",
      state: locationState,
    });
    mockUseParams.mockReturnValue({});
    mockUseSearchParams.mockReturnValue([
      new window.URLSearchParams(),
      vi.fn(),
    ]);

    return render(
      <BrowserRouter>
        <Requests />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset history.replaceState mock
    Object.defineProperty(window, "history", {
      value: {
        replaceState: vi.fn(),
      },
      writable: true,
    });
  });

  test("should render successfully", () => {
    const { container } = renderRequestsWithRouter();
    const requestsContainer = container.querySelector(".requests-page");

    expect(requestsContainer).toBeInTheDocument();
  });

  test("should render main heading", () => {
    renderRequestsWithRouter();

    const mainHeading = screen.getByText("Requests");
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading.tagName).toBe("H1");
  });

  test("should pass correct props to RequestsTable for REQUESTOR role", () => {
    renderRequestsWithRouter(AppRoles.REQUESTOR);

    const requestsTable = screen.getByTestId("requests-table");
    // For requestors, the userId should be the user's email as per the component logic
    expect(requestsTable).toHaveAttribute("data-user-id", "test@advana.mil");
    expect(requestsTable).toHaveAttribute("data-show-user-column", "false");
  });

  test("should pass correct props to RequestsTable for APPROVER role", () => {
    renderRequestsWithRouter(AppRoles.APPROVER);

    const requestsTable = screen.getByTestId("requests-table");
    expect(requestsTable).not.toHaveAttribute("data-user-id");
    expect(requestsTable).toHaveAttribute("data-show-user-column", "true");
  });

  test("should have proper semantic structure", () => {
    const { container } = renderRequestsWithRouter();

    const heading = container.querySelector("h1");
    expect(heading).toHaveAttribute("id", "requests-heading");
  });

  test("should have correct CSS classes", () => {
    const { container } = renderRequestsWithRouter();

    const containerDiv = container.querySelector(".requests-page");
    expect(containerDiv).toBeInTheDocument();
    expect(containerDiv).toHaveClass("requests-page");
    expect(containerDiv).toHaveClass("marketplace-content");
  });

  test("should have proper heading hierarchy", () => {
    renderRequestsWithRouter();

    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Requests");
  });

  test("should be accessible", () => {
    renderRequestsWithRouter();

    // Check for proper heading structure - Requests has 1 heading
    const headings = screen.getAllByRole("heading");
    expect(headings).toHaveLength(1);

    // Check for proper heading content
    const mainHeading = screen.getByRole("heading", { level: 1 });
    expect(mainHeading).toHaveTextContent("Requests");
  });

  test("should render all text content correctly", () => {
    renderRequestsWithRouter();

    // Test exact text content
    expect(screen.getByText("Requests")).toBeInTheDocument();

    // Test text is visible
    expect(screen.getByText("Requests")).toBeVisible();
  });

  test("should have correct DOM structure", () => {
    const { container } = renderRequestsWithRouter();

    // Check the overall structure
    const outerDiv = container.firstChild;
    expect(outerDiv).toHaveClass("requests-page");
    expect(outerDiv).toHaveClass("marketplace-content");

    // Check heading element
    const h1 = container.querySelector("h1");
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveAttribute("id", "requests-heading");
  });

  test("should render component structure consistently", () => {
    const { container } = renderRequestsWithRouter();

    // Verify the component structure doesn't change unexpectedly
    expect(container.innerHTML).toContain(
      'class="requests-page marketplace-content"'
    );
    expect(container.innerHTML).toContain('id="requests-heading"');
    expect(container.innerHTML).toContain("<h1");
    expect(container.innerHTML).toContain("Requests");
  });

  test("should have no accessibility violations", async () => {
    const { container } = renderRequestsWithRouter();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("should meet WCAG accessibility standards", async () => {
    const { container } = renderRequestsWithRouter();

    // Test heading hierarchy
    const h1 = container.querySelector("h1");
    expect(h1).toBeInTheDocument();

    // Test heading has proper id
    expect(h1).toHaveAttribute("id");

    // Run comprehensive accessibility tests
    const results = await axe(container, {
      rules: {
        "heading-order": { enabled: true },
        "page-has-heading-one": { enabled: true },
        "landmark-unique": { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  });

  describe("Success Snackbar Notification", () => {
    test("should display success snackbar when location state has showSuccessToast and requestId", async () => {
      const locationState = {
        showSuccessToast: true,
        requestId: "REQ-12345",
      };

      renderRequestsWithRouter(AppRoles.REQUESTOR, locationState);

      // Check that snackbar is displayed
      const snackbar = screen.getByRole("alert");
      expect(snackbar).toBeInTheDocument();
      expect(snackbar).toHaveTextContent(
        "Request submitted successfully! Request ID: REQ-12345"
      );
    });

    test("should not display snackbar when location state is null", () => {
      renderRequestsWithRouter(AppRoles.REQUESTOR, null);

      // Snackbar should not be visible
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    test("should not display snackbar when showSuccessToast is false", () => {
      const locationState = {
        showSuccessToast: false,
        requestId: "REQ-12345",
      };

      renderRequestsWithRouter(AppRoles.REQUESTOR, locationState);

      // Snackbar should not be visible
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    test("should not display snackbar when requestId is missing", () => {
      const locationState = {
        showSuccessToast: true,
      };

      renderRequestsWithRouter(AppRoles.REQUESTOR, locationState);

      // Snackbar should not be visible
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    test("should clear history state when snackbar is shown", async () => {
      const locationState = {
        showSuccessToast: true,
        requestId: "REQ-67890",
      };

      renderRequestsWithRouter(AppRoles.REQUESTOR, locationState);

      // Verify that history.replaceState was called to clear the state
      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalledWith(null, "");
      });
    });

    test("should close snackbar when close button is clicked", async () => {
      const user = userEvent.setup();
      const locationState = {
        showSuccessToast: true,
        requestId: "REQ-99999",
      };

      renderRequestsWithRouter(AppRoles.REQUESTOR, locationState);

      // Verify snackbar is initially visible
      const snackbar = screen.getByRole("alert");
      expect(snackbar).toBeInTheDocument();

      // Click the close button
      const closeButton = screen.getByLabelText("Close");
      await user.click(closeButton);

      // Snackbar should be removed
      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });

    test("should have correct snackbar structure and attributes", () => {
      const locationState = {
        showSuccessToast: true,
        requestId: "REQ-STRUCT-TEST",
      };

      renderRequestsWithRouter(AppRoles.REQUESTOR, locationState);

      // Check snackbar has correct id
      const snackbar = document.getElementById("toast-notification");
      expect(snackbar).toBeInTheDocument();

      // Check alert has correct severity
      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("MuiAlert-filledSuccess");
    });

    test("should display correct message format with different request IDs", () => {
      const testCases = [
        {
          requestId: "REQ-123",
          expected: "Request submitted successfully! Request ID: REQ-123",
        },
        {
          requestId: "TEST-456",
          expected: "Request submitted successfully! Request ID: TEST-456",
        },
        {
          requestId: "ABC123XYZ",
          expected: "Request submitted successfully! Request ID: ABC123XYZ",
        },
      ];

      testCases.forEach(({ requestId, expected }) => {
        const locationState = {
          showSuccessToast: true,
          requestId,
        };

        const { unmount } = renderRequestsWithRouter(
          AppRoles.REQUESTOR,
          locationState
        );

        const alert = screen.getByRole("alert");
        expect(alert).toHaveTextContent(expected);

        unmount();
      });
    });

    test("should work with both REQUESTOR and APPROVER roles", () => {
      const locationState = {
        showSuccessToast: true,
        requestId: "REQ-ROLE-TEST",
      };

      // Test with REQUESTOR role
      const { unmount: unmountRequestor } = renderRequestsWithRouter(
        AppRoles.REQUESTOR,
        locationState
      );
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Request submitted successfully! Request ID: REQ-ROLE-TEST"
      );
      unmountRequestor();

      // Test with APPROVER role
      const { unmount: unmountApprover } = renderRequestsWithRouter(
        AppRoles.APPROVER,
        locationState
      );
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Request submitted successfully! Request ID: REQ-ROLE-TEST"
      );
      unmountApprover();
    });

    test("should handle snackbar accessibility", async () => {
      const locationState = {
        showSuccessToast: true,
        requestId: "REQ-A11Y-TEST",
      };

      const { container } = renderRequestsWithRouter(
        AppRoles.REQUESTOR,
        locationState
      );

      // Check that alert role is present
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();

      // Check accessibility compliance
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
