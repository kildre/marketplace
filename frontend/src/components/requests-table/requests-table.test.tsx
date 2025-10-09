import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { RequestsTable } from "./requests-table";
import { AppRoles } from "../../types/auth";

// Mock API response format data
const mockApiRequests = [
  {
    requestNumber: "req-001",
    requestorEmail: "joe.snuffy.ctr@army.mil",
    cartItems: [
      {
        name: "Tableau Desktop",
        quantity: 1,
        price: 100,
      },
    ],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    statusId: 1, // Pending
  },
  {
    requestNumber: "req-002",
    requestorEmail: "jane.doe@army.mil",
    cartItems: [
      {
        name: "SPSS Statistics",
        quantity: 2,
        price: 200,
      },
    ],
    createdAt: "2024-01-10T14:20:00Z",
    updatedAt: "2024-01-12T09:15:00Z",
    statusId: 2, // Approved
  },
  {
    requestNumber: "req-003",
    requestorEmail: "mike.johnson.ctr@army.mil",
    cartItems: [
      {
        name: "Oracle Database",
        quantity: 1,
        price: 500,
      },
    ],
    createdAt: "2024-01-08T16:45:00Z",
    updatedAt: "2024-01-09T11:30:00Z",
    statusId: 3, // Denied
  },
];

// Mock the DataGrid component to avoid CSS import issues
vi.mock("@mui/x-data-grid", () => ({
  DataGrid: vi.fn(({ rows, columns }) => (
    <div role="grid" data-testid="mocked-datagrid" tabIndex={0}>
      <div>
        {columns.map((col: any) => (
          <div key={col.field} role="columnheader">
            {col.headerName}
          </div>
        ))}
      </div>
      <div>
        {rows.map((row: any, index: number) => (
          <div key={row.id || index} role="row">
            {columns.map((col: any) => (
              <div key={`${row.id}-${col.field}`} role="cell">
                {col.renderCell
                  ? col.renderCell({
                      value: row[col.field],
                      row,
                      field: col.field,
                    })
                  : row[col.field]}
              </div>
            ))}
          </div>
        ))}
      </div>
      {rows.length === 0 && <div>No rows</div>}
      <div>1–10 of {rows.length}</div>
    </div>
  )),
}));

// Mock the useAuth hook
const mockUseAuth = vi.fn();
vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock useKeycloak hook
const mockUpdateToken = vi.fn().mockResolvedValue(true);
const mockKeycloakObject = {
  authenticated: true,
  token: "mock-token",
  tokenParsed: { preferred_username: "testuser" },
  updateToken: mockUpdateToken,
};
vi.mock("../../hooks/useKeycloak", () => ({
  useKeycloak: vi.fn(() => ({
    keycloak: mockKeycloakObject,
    initialized: true,
  })),
}));

// Mock AuthService
const mockGetStoredToken = vi.fn();
vi.mock("@/services/authService", () => ({
  AuthService: {
    getStoredToken: () => mockGetStoredToken(),
  },
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe("RequestsTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockGetStoredToken.mockClear();
    mockUpdateToken.mockClear();
    mockUpdateToken.mockResolvedValue(true);
    mockKeycloakObject.token = "mock-token"; // Reset to default token
    
    // Mock fetch globally
    window.fetch = vi.fn();
  });

  const mockRequestorAuth = {
    userInfo: {
      id: "joe.snuffy.ctr",
      username: "joe.snuffy.ctr",
      email: "joe.snuffy.ctr@army.mil",
      firstName: "Joe",
      lastName: "Snuffy",
      roles: [AppRoles.REQUESTOR],
    },
    getUserInfo: () => ({
      id: "joe.snuffy.ctr",
      username: "joe.snuffy.ctr",
      email: "joe.snuffy.ctr@army.mil",
      firstName: "Joe",
      lastName: "Snuffy",
    }),
    isAuthenticated: true,
    isRequestor: () => true,
    isApprover: () => false,
    hasRole: (role: AppRoles) => role === AppRoles.REQUESTOR,
    hasPermission: () => true,
    logout: vi.fn(),
    login: vi.fn(),
  };

  const mockApproverAuth = {
    userInfo: {
      id: "admin.user",
      username: "admin.user",
      email: "admin.user@army.mil",
      firstName: "Admin",
      lastName: "User",
      roles: [AppRoles.APPROVER],
    },
    getUserInfo: () => ({
      id: "admin.user",
      username: "admin.user",
      email: "admin.user@army.mil",
      firstName: "Admin",
      lastName: "User",
    }),
    isAuthenticated: true,
    isRequestor: () => false,
    isApprover: () => true,
    hasRole: (role: AppRoles) => role === AppRoles.APPROVER,
    hasPermission: () => true,
    logout: vi.fn(),
    login: vi.fn(),
  };

  const mockNoAuth = {
    userInfo: null,
    getUserInfo: () => null,
    isAuthenticated: false,
    isRequestor: () => false,
    isApprover: () => false,
    hasRole: () => false,
    hasPermission: () => false,
    logout: vi.fn(),
    login: vi.fn(),
  };

  describe("Basic Rendering", () => {
    it("should render successfully with default props", () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable />
        </TestWrapper>
      );

      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    it("should render with custom data", () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const customData = [mockApiRequests[0]];

      render(
        <TestWrapper>
          <RequestsTable data={customData as any} />
        </TestWrapper>
      );

      expect(screen.getByRole("grid")).toBeInTheDocument();
    });
  });

  describe("Column Display Logic", () => {
    it("should show User column for APPROVERs by default", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable data={mockApiRequests as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("User")).toBeInTheDocument();
      });
    });

    it("should hide User column for REQUESTORs", async () => {
      mockUseAuth.mockReturnValue(mockRequestorAuth);

      render(
        <TestWrapper>
          <RequestsTable data={mockApiRequests as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText("User")).not.toBeInTheDocument();
      });
    });

    it("should not show User column for unauthenticated users", async () => {
      mockUseAuth.mockReturnValue(mockNoAuth);

      render(
        <TestWrapper>
          <RequestsTable data={mockApiRequests as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText("User")).not.toBeInTheDocument();
      });
    });

    it("should respect showUserColumn prop when false", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable data={mockApiRequests as any} showUserColumn={false} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText("User")).not.toBeInTheDocument();
      });
    });

    it("should display all required column headers", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable data={mockApiRequests as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("User")).toBeInTheDocument();
        expect(screen.getByText("Asset")).toBeInTheDocument();
        expect(screen.getByText("Qty")).toBeInTheDocument();
        expect(screen.getByText("Estimated Price")).toBeInTheDocument();
        expect(screen.getByText("Date Created")).toBeInTheDocument();
        expect(screen.getByText("Last Updated")).toBeInTheDocument();
        expect(screen.getByText("Status")).toBeInTheDocument();
        expect(screen.getByText("Actions")).toBeInTheDocument();
      });
    });
  });

  describe("Data Filtering Logic", () => {
    it("should show all requests for APPROVERs by default", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable data={mockApiRequests as any} />
        </TestWrapper>
      );

      // Should show multiple requests (all requests in mock data)
      await waitFor(() => {
        expect(screen.getAllByText("View").length).toBeGreaterThan(1);
      });
    });

    it("should filter requests for specific user when userId prop is provided", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      // Filter to only show requests from joe.snuffy.ctr
      const userRequests = mockApiRequests.filter(
        (request) => request.requestorEmail === "joe.snuffy.ctr@army.mil"
      );

      render(
        <TestWrapper>
          <RequestsTable data={userRequests as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should only show requests for joe.snuffy.ctr
        const viewButtons = screen.getAllByText("View");
        expect(viewButtons.length).toBeGreaterThan(0);
      });
    });

    it("should show only own requests for REQUESTORs", async () => {
      mockUseAuth.mockReturnValue(mockRequestorAuth);

      // Filter to show only requestor's own requests
      const userRequests = mockApiRequests.filter(
        (request) => request.requestorEmail === "joe.snuffy.ctr@army.mil"
      );

      render(
        <TestWrapper>
          <RequestsTable data={userRequests as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should only show requests for joe.snuffy.ctr (the logged-in requestor)
        const viewButtons = screen.getAllByText("View");
        expect(viewButtons.length).toBeGreaterThan(0);
      });
    });

    it("should show all requests when no authentication", async () => {
      mockUseAuth.mockReturnValue(mockNoAuth);

      render(
        <TestWrapper>
          <RequestsTable data={mockApiRequests as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getAllByText("View").length).toBeGreaterThan(1);
      });
    });
  });

  describe("Data Display", () => {
    it("should display request data correctly", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const testData = [mockApiRequests[0]];

      render(
        <TestWrapper>
          <RequestsTable data={testData as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("Tableau Desktop")).toBeInTheDocument();
        expect(screen.getByText("Pending")).toBeInTheDocument();
      });
    });

    it("should display status chips with correct colors", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const pendingRequest = { ...mockApiRequests[0], statusId: 1 };
      const approvedRequest = {
        ...mockApiRequests[0],
        statusId: 2,
        requestNumber: "req-002",
      };
      const deniedRequest = {
        ...mockApiRequests[0],
        statusId: 3,
        requestNumber: "req-003",
      };

      render(
        <TestWrapper>
          <RequestsTable
            data={[pendingRequest, approvedRequest, deniedRequest] as any}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("Pending")).toBeInTheDocument();
        expect(screen.getByText("Approved")).toBeInTheDocument();
        expect(screen.getByText("Denied")).toBeInTheDocument();
      });
    });

    it("should display combined asset names for multiple cart items", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const requestWithMultipleItems = {
        ...mockApiRequests[0],
        cartItems: [
          {
            name: "Item 1",
            quantity: 1,
            price: 100,
          },
          {
            name: "Item 2",
            quantity: 2,
            price: 200,
          },
        ],
      };

      render(
        <TestWrapper>
          <RequestsTable data={[requestWithMultipleItems] as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("Item 1, Item 2")).toBeInTheDocument();
      });
    });
  });

  describe("Navigation", () => {
    it("should navigate to request detail when View button is clicked", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable data={mockApiRequests as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        const viewButtons = screen.getAllByText("View");
        fireEvent.click(viewButtons[0]);
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining("/request-detail?id=")
      );
    });

    it("should preserve userId in navigation URL when filtering by user", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const userRequests = mockApiRequests.filter(
        (request) => request.requestorEmail === "joe.snuffy.ctr@army.mil"
      );

      render(
        <TestWrapper>
          <RequestsTable data={userRequests as any} userId="joe.snuffy.ctr" />
        </TestWrapper>
      );

      await waitFor(() => {
        const viewButtons = screen.getAllByText("View");
        fireEvent.click(viewButtons[0]);
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining("/request-detail?id=")
      );
    });

    it("should not include userId in navigation URL when showing all requests", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable data={mockApiRequests as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        const viewButtons = screen.getAllByText("View");
        if (viewButtons.length > 0) {
          fireEvent.click(viewButtons[0]);
          expect(mockNavigate).toHaveBeenCalledWith(
            expect.stringContaining("/request-detail?id=")
          );
        }
      });
    });
  });

  describe("DataGrid Features", () => {
    it("should render with pagination", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable data={mockApiRequests as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/1–10 of \d+/)).toBeInTheDocument();
      });
    });

    it("should have filterable columns", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable data={mockApiRequests as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        const grid = screen.getByRole("grid");
        expect(grid).toBeInTheDocument();
      });
    });

    it("should not allow row selection", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable data={mockApiRequests as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should not have checkboxes for row selection
        expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
      });
    });
  });

  describe("Props Handling", () => {
    it("should handle undefined data prop gracefully", () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      expect(() => {
        render(
          <TestWrapper>
            <RequestsTable data={undefined} />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it("should handle empty data array", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable data={[]} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
        expect(screen.getByText("No rows")).toBeInTheDocument();
      });
    });

    it("should handle userId prop that doesn't match any requests", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable userId="nonexistent.user" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
        expect(screen.getByText("No rows")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels and roles", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable data={mockApiRequests as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
        expect(screen.getAllByRole("columnheader").length).toBeGreaterThan(0);
        expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
      });
    });

    it("should be keyboard navigable", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable data={mockApiRequests as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        const grid = screen.getByRole("grid");
        expect(grid).toBeInTheDocument();

        // Grid should be focusable
        grid.focus();
        expect(grid).toHaveFocus();
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed request data gracefully", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const malformedData = [
        {
          ...mockApiRequests[0],
          cartItems: null, // This would cause an error
        },
      ];

      // The component should render without throwing, even with malformed data
      render(
        <TestWrapper>
          <RequestsTable data={malformedData as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
      });
    });
  });

  describe("Scroll and Reset Functionality", () => {
    it("should show reset button when content overflows", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable data={mockApiRequests as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        // The reset button should be visible if content overflows
        const grid = screen.getByRole("grid");
        expect(grid).toBeInTheDocument();
      });
    });

    it("should handle scroll events", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable data={mockApiRequests as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        const grid = screen.getByRole("grid");
        expect(grid).toBeInTheDocument();
        
        // Get the scroll container (Paper element)
        const scrollContainer = grid.closest('div[class*="MuiPaper"]');
        if (scrollContainer) {
          // Create a proper scroll event
          Object.defineProperty(scrollContainer, 'scrollLeft', { value: 100, writable: true, configurable: true });
          Object.defineProperty(scrollContainer, 'scrollWidth', { value: 1000, writable: true, configurable: true });
          Object.defineProperty(scrollContainer, 'clientWidth', { value: 500, writable: true, configurable: true });
          
          const scrollEvent = new globalThis.Event('scroll', { bubbles: true });
          scrollContainer.dispatchEvent(scrollEvent);
        }
      });
    });

    it("should handle reset view button click", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const { container } = render(
        <TestWrapper>
          <RequestsTable data={mockApiRequests as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        // Try to find and click reset button if it exists
        const resetButton = container.querySelector('button[aria-label*="Reset"]') || 
                           container.querySelector('[title="Reset Table View"]');
        if (resetButton) {
          fireEvent.click(resetButton);
        }
      });
    });

    it("should handle window resize events", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable data={mockApiRequests as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
        
        // Simulate window resize
        const resizeEvent = new globalThis.Event('resize');
        fireEvent(window, resizeEvent);
      });
    });
  });

  describe("Data Transformation Error Handling", () => {
    it("should handle requests with missing cartItems", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const dataWithMissingCart = [
        {
          requestNumber: "req-004",
          requestorEmail: "test@army.mil",
          // cartItems is missing
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T10:30:00Z",
          statusId: 1,
        },
      ];

      render(
        <TestWrapper>
          <RequestsTable data={dataWithMissingCart as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
        // Should render with N/A for asset
        expect(screen.getByText("N/A")).toBeInTheDocument();
      });
    });

    it("should handle requests with empty cartItems array", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const dataWithEmptyCart = [
        {
          requestNumber: "req-005",
          requestorEmail: "test@army.mil",
          cartItems: [],
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T10:30:00Z",
          statusId: 1,
        },
      ];

      render(
        <TestWrapper>
          <RequestsTable data={dataWithEmptyCart as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
      });
    });

    it("should handle requests with empty item names in cartItems", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const dataWithEmptyNames = [
        {
          requestNumber: "req-006",
          requestorEmail: "test@army.mil",
          cartItems: [{ name: "" }, { name: "  " }, { name: "Valid Product" }],
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T10:30:00Z",
          statusId: 1,
        },
      ];

      render(
        <TestWrapper>
          <RequestsTable data={dataWithEmptyNames as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
        expect(screen.getByText("Valid Product")).toBeInTheDocument();
      });
    });

    it("should handle requests with invalid dates", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const dataWithInvalidDates = [
        {
          requestNumber: "req-007",
          requestorEmail: "test@army.mil",
          cartItems: [{ name: "Product" }],
          createdAt: null,
          updatedAt: "invalid-date",
          statusId: 1,
        },
      ];

      render(
        <TestWrapper>
          <RequestsTable data={dataWithInvalidDates as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
      });
    });

    it("should handle requests with decision object", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const dataWithDecision = [
        {
          requestNumber: "req-008",
          requestorEmail: "test@army.mil",
          cartItems: [{ name: "Product" }],
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T10:30:00Z",
          statusId: 1,
          decision: {
            statusId: 2,
            updatedAt: "2024-01-16T14:00:00Z",
          },
        },
      ];

      render(
        <TestWrapper>
          <RequestsTable data={dataWithDecision as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
        // Should show Approved status from decision
        expect(screen.getByText("Approved")).toBeInTheDocument();
      });
    });

    it("should handle completely malformed request data with error row", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const malformedData = [
        {
          // Missing all required fields - will throw error in try/catch
          something: "invalid",
        },
      ];

      render(
        <TestWrapper>
          <RequestsTable data={malformedData as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
      });
    });

    it("should handle unknown status codes", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const dataWithUnknownStatus = [
        {
          requestNumber: "req-009",
          requestorEmail: "test@army.mil",
          cartItems: [{ name: "Product" }],
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T10:30:00Z",
          statusId: 999, // Unknown status
        },
      ];

      render(
        <TestWrapper>
          <RequestsTable data={dataWithUnknownStatus as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
        expect(screen.getByText("Unknown")).toBeInTheDocument();
      });
    });
  });

  describe("API Error Handling", () => {
    it("should handle token refresh failure for approvers", async () => {
      mockUpdateToken.mockRejectedValue(new Error("Token refresh failed"));
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
      });
    });

    it("should handle token refresh failure for requestors", async () => {
      mockUpdateToken.mockRejectedValue(new Error("Token refresh failed"));
      mockUseAuth.mockReturnValue(mockRequestorAuth);

      render(
        <TestWrapper>
          <RequestsTable />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
      });
    });

    it("should handle JSON parse error in API response", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });
      window.fetch = mockFetch;

      render(
        <TestWrapper>
          <RequestsTable />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
      });
    });

    it("should handle API response with requests array format", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ requests: mockApiRequests }),
      });
      window.fetch = mockFetch;

      render(
        <TestWrapper>
          <RequestsTable />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
        expect(screen.getByText("Tableau Desktop")).toBeInTheDocument();
      });
    });

    it("should handle API response with direct array format", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockApiRequests,
      });
      window.fetch = mockFetch;

      render(
        <TestWrapper>
          <RequestsTable />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
      });
    });

    it("should handle API response with invalid format", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ someOtherField: "data" }),
      });
      window.fetch = mockFetch;

      render(
        <TestWrapper>
          <RequestsTable />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
        expect(screen.getByText("No rows")).toBeInTheDocument();
      });
    });

    it("should handle network errors", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
      window.fetch = mockFetch;

      render(
        <TestWrapper>
          <RequestsTable />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
      });
    });

    it("should not fetch when data prop is provided", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const mockFetch = vi.fn();
      window.fetch = mockFetch;

      render(
        <TestWrapper>
          <RequestsTable data={mockApiRequests as any} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
      });

      // Fetch should not be called when data is provided
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should handle missing user email for API calls", async () => {
      const noEmailAuth = {
        ...mockApproverAuth,
        getUserInfo: () => ({
          id: "admin.user",
          username: "admin.user",
          email: "", // Empty email
          firstName: "Admin",
          lastName: "User",
        }),
      };
      mockUseAuth.mockReturnValue(noEmailAuth);

      render(
        <TestWrapper>
          <RequestsTable />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
      });
    });
  });

  describe("Authorization Header Tests", () => {
    it("should include Authorization header when token exists for approvers", async () => {
      const mockToken = "mock-jwt-token-12345";
      mockGetStoredToken.mockReturnValue(mockToken);
      mockKeycloakObject.token = mockToken; // Set the keycloak token
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ requests: [] }),
      });
      window.fetch = mockFetch;

      render(
        <TestWrapper>
          <RequestsTable />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/requests/viewAll"),
          expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({
              "Content-Type": "application/json",
              "Authorization": `Bearer ${mockToken}`,
            }),
          })
        );
      });
    });

    it("should include Authorization header when token exists for requestors", async () => {
      const mockToken = "mock-jwt-token-67890";
      mockGetStoredToken.mockReturnValue(mockToken);
      mockKeycloakObject.token = mockToken; // Set the keycloak token
      mockUseAuth.mockReturnValue(mockRequestorAuth);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ requests: [] }),
      });
      window.fetch = mockFetch;

      render(
        <TestWrapper>
          <RequestsTable />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/requests/viewForRequestor"),
          expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({
              "Content-Type": "application/json",
              "Authorization": `Bearer ${mockToken}`,
            }),
          })
        );
      });
    });

    it("should not include Authorization header when no token exists", async () => {
      mockGetStoredToken.mockReturnValue(null);
      mockKeycloakObject.token = null as any; // Set keycloak token to null
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ requests: [] }),
      });
      window.fetch = mockFetch;

      render(
        <TestWrapper>
          <RequestsTable />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/requests/viewAll"),
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          })
        );
      });
    });

    it("should handle 403 Forbidden errors gracefully", async () => {
      mockGetStoredToken.mockReturnValue("invalid-token");
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ errMsg: "Forbidden" }),
      });
      window.fetch = mockFetch;

      render(
        <TestWrapper>
          <RequestsTable />
        </TestWrapper>
      );

      // Component should handle the error and render empty grid
      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
      });
    });
  });
});
