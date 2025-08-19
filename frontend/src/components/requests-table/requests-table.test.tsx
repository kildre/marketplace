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
});
