import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import { ApproverRedirectGuard } from "./ApproverRedirectGuard";

// Mock the useAuth hook
const mockUseAuth = vi.fn();

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock Navigate component to test redirects
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Navigate: ({ to, replace }: { to: string; replace?: boolean }) => {
      mockNavigate(to, replace);
      return <div data-testid="navigate" data-to={to} data-replace={replace} />;
    },
  };
});

describe("ApproverRedirectGuard", () => {
  const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should render children for non-approver users", () => {
    mockUseAuth.mockReturnValue({
      isApprover: () => false,
    });

    render(
      <BrowserRouter>
        <ApproverRedirectGuard>
          <TestComponent />
        </ApproverRedirectGuard>
      </BrowserRouter>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
  });

  test("should redirect approver users to default requests page (used for cart)", () => {
    mockUseAuth.mockReturnValue({
      isApprover: () => true,
    });

    render(
      <BrowserRouter>
        <ApproverRedirectGuard>
          <TestComponent />
        </ApproverRedirectGuard>
      </BrowserRouter>
    );

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(screen.getByTestId("navigate")).toBeInTheDocument();
    expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/requests");
    expect(screen.getByTestId("navigate")).toHaveAttribute("data-replace", "true");
  });

  test("should redirect approver users to custom redirect path", () => {
    mockUseAuth.mockReturnValue({
      isApprover: () => true,
    });

    render(
      <BrowserRouter>
        <ApproverRedirectGuard redirectTo="/custom-path">
          <TestComponent />
        </ApproverRedirectGuard>
      </BrowserRouter>
    );

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(screen.getByTestId("navigate")).toBeInTheDocument();
    expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/custom-path");
    expect(screen.getByTestId("navigate")).toHaveAttribute("data-replace", "true");
  });

  test("should render children for requestor users", () => {
    mockUseAuth.mockReturnValue({
      isApprover: () => false,
    });

    render(
      <BrowserRouter>
        <ApproverRedirectGuard>
          <TestComponent />
        </ApproverRedirectGuard>
      </BrowserRouter>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
  });
});
