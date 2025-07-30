import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import { Requests } from "./requests";
import { AppRoles } from "../../types/auth";

// Mock the useAuth hook
const mockUseAuth = vi.fn();

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock the RequestsTable component since we're testing the Requests page logic
vi.mock("../../components/requests-table/requests-table", () => ({
  RequestsTable: ({ userId, showUserColumn }: { userId?: string; showUserColumn?: boolean }) => (
    <div 
      data-testid="requests-table" 
      {...(userId !== undefined ? { 'data-user-id': userId } : {})}
      data-show-user-column={showUserColumn}
    >
      Mock RequestsTable
    </div>
  ),
}));

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("Requests", () => {
  const renderRequestsWithRouter = (userRole = AppRoles.REQUESTOR) => {
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

    return render(
      <BrowserRouter>
        <Requests />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(requestsTable).toHaveAttribute("data-user-id", "developer");
    expect(requestsTable).toHaveAttribute("data-show-user-column", "false");
  });

  test("should pass correct props to RequestsTable for APPROVER role", () => {
    renderRequestsWithRouter(AppRoles.APPROVER);

    const requestsTable = screen.getByTestId("requests-table");
    expect(requestsTable).not.toHaveAttribute("data-user-id");
    expect(requestsTable).toHaveAttribute("data-show-user-column", "true");
  });

  test("should render successfully", () => {
    const { container } = renderRequestsWithRouter();
    const requestsContainer = container.querySelector(".requests-page");
    const section = container.querySelector("section");

    expect(requestsContainer).toBeInTheDocument();
    expect(section).toBeInTheDocument();
  });

  test("should render main heading", () => {
    renderRequestsWithRouter();

    const mainHeading = screen.getByText("Requests");
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading.tagName).toBe("H1");
  });

  test("should have proper semantic structure", () => {
    const { container } = renderRequestsWithRouter();

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-labelledby", "requests-heading");
  });

  test("should have correct CSS classes", () => {
    const { container } = renderRequestsWithRouter();

    const containerDiv = container.querySelector(".requests-page");
    expect(containerDiv).toBeInTheDocument();
    expect(containerDiv).toHaveClass("requests-page");
  });

  test("should render successfully", () => {
    const { container } = renderRequestsWithRouter();
    const requestsContainer = container.querySelector(".requests-page");
    const section = container.querySelector("section");

    expect(requestsContainer).toBeInTheDocument();
    expect(section).toBeInTheDocument();
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

    // Check for semantic section
    const section = screen.getByRole("region");
    expect(section).toBeInTheDocument();
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

    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
    expect(section?.parentElement).toHaveClass("requests-page");

    // Check heading element is within section
    const h1 = container.querySelector("h1");
    expect(h1?.parentElement).toBe(section);
  });

  test("should render component snapshot consistently", () => {
    const { container } = renderRequestsWithRouter();

    // Verify the component structure doesn't change unexpectedly
    expect(container.innerHTML).toContain(
      'class="requests-page marketplace-content"'
    );
    expect(container.innerHTML).toContain('aria-labelledby="requests-heading"');
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

    // Test semantic structure
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-labelledby");

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
});
