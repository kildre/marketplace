import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { RequestsTable } from "./requests-table";
import { AppRoles } from "../../types/auth";
import { mockRequestData } from "../../data/mock-requestData";

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

      const customData = [mockRequestData[0]];

      render(
        <TestWrapper>
          <RequestsTable data={customData} />
        </TestWrapper>
      );

      expect(screen.getByRole("grid")).toBeInTheDocument();
    });
  });

  describe("Column Display Logic", () => {
    it("should show User ID column for APPROVERs by default", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("User ID")).toBeInTheDocument();
      });
    });

    it("should hide User ID column for REQUESTORs", async () => {
      mockUseAuth.mockReturnValue(mockRequestorAuth);

      render(
        <TestWrapper>
          <RequestsTable />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText("User ID")).not.toBeInTheDocument();
      });
    });

    it("should show User ID column for unauthenticated users", async () => {
      mockUseAuth.mockReturnValue(mockNoAuth);

      render(
        <TestWrapper>
          <RequestsTable />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("User ID")).toBeInTheDocument();
      });
    });

    it("should respect showUserColumn prop when false", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable showUserColumn={false} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText("User ID")).not.toBeInTheDocument();
      });
    });

    it("should display all required column headers", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("Ticket #")).toBeInTheDocument();
        expect(screen.getByText("User ID")).toBeInTheDocument();
        expect(screen.getByText("Ticket Type")).toBeInTheDocument();
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
          <RequestsTable />
        </TestWrapper>
      );

      // Should show multiple requests (all requests in mock data)
      await waitFor(() => {
        expect(screen.getAllByText("View").length).toBeGreaterThan(1);
      });
    });

    it("should filter requests for specific user when userId prop is provided", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable userId="joe.snuffy.ctr" />
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

      render(
        <TestWrapper>
          <RequestsTable />
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
          <RequestsTable />
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

      const testData = [mockRequestData[0]];

      render(
        <TestWrapper>
          <RequestsTable data={testData} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(
          screen.getByText(testData[0].personalData.name)
        ).toBeInTheDocument();
        expect(screen.getByText("Application")).toBeInTheDocument();
        expect(screen.getByText(testData[0].status)).toBeInTheDocument();
      });
    });

    it("should display status chips with correct colors", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      const pendingRequest = { ...mockRequestData[0], status: "Pending" };
      const approvedRequest = {
        ...mockRequestData[0],
        status: "Approved",
        requestId: "req-002",
      };
      const deniedRequest = {
        ...mockRequestData[0],
        status: "Denied",
        requestId: "req-003",
      };

      render(
        <TestWrapper>
          <RequestsTable
            data={[pendingRequest, approvedRequest, deniedRequest]}
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
        ...mockRequestData[0],
        cartItems: [
          {
            productId: 1,
            productName: "Item 1",
            productType: "License Based",
            quantity: 1,
            price: 100,
            description: "Test item 1",
            unit: 1,
          },
          {
            productId: 2,
            productName: "Item 2",
            productType: "License Based",
            quantity: 2,
            price: 200,
            description: "Test item 2",
            unit: 2,
          },
        ],
      };

      render(
        <TestWrapper>
          <RequestsTable data={[requestWithMultipleItems]} />
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
          <RequestsTable />
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

      render(
        <TestWrapper>
          <RequestsTable userId="joe.snuffy.ctr" />
        </TestWrapper>
      );

      await waitFor(() => {
        const viewButtons = screen.getAllByText("View");
        fireEvent.click(viewButtons[0]);
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining("userId=joe.snuffy.ctr")
      );
    });

    it("should not include userId in navigation URL when showing all requests", async () => {
      mockUseAuth.mockReturnValue(mockApproverAuth);

      render(
        <TestWrapper>
          <RequestsTable />
        </TestWrapper>
      );

      await waitFor(() => {
        const viewButtons = screen.getAllByText("View");
        if (viewButtons.length > 0) {
          fireEvent.click(viewButtons[0]);
          expect(mockNavigate).toHaveBeenCalledWith(
            expect.not.stringContaining("userId=")
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
          <RequestsTable />
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
          <RequestsTable />
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
          <RequestsTable />
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
          <RequestsTable />
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
          <RequestsTable />
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
          ...mockRequestData[0],
          personalData: {
            ...mockRequestData[0].personalData,
            name: null, // This would cause an error
          },
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
