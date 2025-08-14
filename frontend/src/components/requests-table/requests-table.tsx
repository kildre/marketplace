import * as React from "react";
import { Chip, Button, Paper } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { RequestsTableProps } from "../../interfaces/interfaceStore";
// import { RequestsDebugPanel } from "../debug/RequestsDebugPanel"; // Uncomment to use debug panel with userId and component
import { calculateEstimatedCost } from "../../utils/helper-functions";
import { mockProducts } from "../../data/mock-productData";

// Transform Product data to RequestData format
const getStatusColor = (
  status: string
): "warning" | "success" | "error" | "default" => {
  switch (status) {
    case "Pending":
      return "warning";
    case "Approved":
      return "success";
    case "Denied":
      return "error";
    default:
      return "default";
  }
};

export const RequestsTable: React.FC<RequestsTableProps> = ({
  data,
  // userId,
  showUserColumn = true,
}) => {
  const navigate = useNavigate();
  const { isApprover, getUserInfo } = useAuth();
  const [allRequests, setAllRequests] = React.useState(data || []);

  // Fetch requests from API - memoized to prevent infinite loops
  const fetchRequests = React.useCallback(async () => {
    // Get fresh user info inside the function to avoid dependencies
    const currentUserInfo = getUserInfo();
    const currentIsApprover = isApprover();

    if (!currentUserInfo?.email) {
      setAllRequests(data || []);
      return;
    }

    try {
      let response;

      if (currentIsApprover) {
        // Approvers can see all requests, pass their email
        response = await window.fetch("/api/requests/viewAll", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userEmail: currentUserInfo.email,
          }),
        });
      } else {
        // Requestors see only their own requests
        response = await window.fetch("/api/requests/viewForRequestor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userEmail: currentUserInfo.email,
          }),
        });
      }

      if (response.ok) {
        const requestsData = await response.json();

        // Handle API response format: { requests: [...], errMsg: "..." }
        let dataToSet = [];
        if (requestsData && Array.isArray(requestsData.requests)) {
          dataToSet = requestsData.requests;
        } else if (Array.isArray(requestsData)) {
          dataToSet = requestsData;
        } else {
          dataToSet = [];
        }

        setAllRequests(dataToSet);
      } else {
        // Fallback to empty array if API fails
        setAllRequests(data || []);
      }
    } catch {
      // Fallback to empty array if API fails
      setAllRequests(data || []);
    }
  }, []); // No dependencies - get fresh values inside the function

  React.useEffect(() => {
    // Only fetch requests if no data is provided
    if (!data) {
      fetchRequests();
    }
  }, [fetchRequests, data]);

  // Convert to format expected by DataGrid - ensure allRequests is always an array
  const safeRequests = Array.isArray(allRequests) ? allRequests : [];

  const tableData = safeRequests.map((request, index) => {
    try {
      // Handle actual API response structure vs expected RequestData interface
      const apiRequest = request as unknown as Record<string, unknown>;

      // Handle asset field - filter out empty values
      let assetText = "N/A";
      if (apiRequest.cartItems && Array.isArray(apiRequest.cartItems)) {
        const productNames = (
          apiRequest.cartItems as Array<Record<string, unknown>>
        )
          .map((item) => item.name as string)
          .filter((name) => name && name.trim() !== "");
        assetText = productNames.length > 0 ? productNames.join(", ") : "N/A";
      }

      const mappedData = {
        id: (apiRequest.requestNumber as string) || `request-${index}`,
        userId: (apiRequest.requestorEmail as string) || "N/A",
        userEmail: (apiRequest.requestorEmail as string) || "N/A",
        ticketType: "Application", // Default since this isn't in the new structure
        asset: assetText,
        qtySize: Array.isArray(apiRequest.cartItems)
          ? (apiRequest.cartItems as Array<unknown>).length
          : 0,
        estimatedPrice: Array.isArray(apiRequest.cartItems)
          ? calculateEstimatedCost(
              apiRequest.cartItems as Array<Record<string, unknown>>,
              mockProducts
            )
          : "Free",
        dateCreated: apiRequest.createdAt
          ? new Date(apiRequest.createdAt as string).toLocaleDateString(
              "en-US",
              {
                day: "2-digit",
                month: "short",
                year: "2-digit",
              }
            )
          : "N/A",
        lastUpdated: (() => {
          // Check if decision exists and use its updatedAt, otherwise fall back to request's updatedAt
          const decision = apiRequest.decision as Record<
            string,
            unknown
          > | null;
          const updatedAt = decision?.updatedAt || apiRequest.updatedAt;

          return updatedAt
            ? new Date(updatedAt as string).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "2-digit",
              })
            : "N/A";
        })(),
        status: (() => {
          // Check if decision exists and is not null
          const decision = apiRequest.decision as Record<
            string,
            unknown
          > | null;
          const statusId = decision?.statusId || apiRequest.statusId;

          return (statusId as number) === 1
            ? "Pending"
            : (statusId as number) === 2
            ? "Approved"
            : (statusId as number) === 3
            ? "Denied"
            : "Unknown";
        })(),
      };

      return mappedData;
    } catch {
      return {
        id: `error-${index}`,
        userId: "Error",
        userEmail: "Error",
        ticketType: "Error",
        asset: "Error processing request",
        qtySize: 0,
        estimatedPrice: "Error",
        dateCreated: "Error",
        lastUpdated: "Error",
        status: "Error",
      };
    }
  });

  const handleViewClick = (requestId: string): void => {
    // Navigate to request detail without userId filtering since API handles it
    const url = `/request-detail?id=${requestId}`;
    navigate(url);
  };

  // Define columns for DataGrid with basic filtering
  const getColumns = (): GridColDef[] => {
    const baseColumns: GridColDef[] = [];

    // Conditionally add User ID column - only for APPROVERs
    if (showUserColumn && isApprover()) {
      baseColumns.push({
        field: "userId",
        headerName: "User",
        width: 120,
        filterable: true,
      });
    }

    // Add remaining columns
    baseColumns.push(
      // {
      //   field: "ticketType",
      //   headerName: "Ticket Type",
      //   width: 90,
      //   filterable: true,
      //   type: "singleSelect",
      //   valueOptions: ["Application", "Hardware", "Software", "Access"],
      // },
      {
        field: "asset",
        headerName: "Asset",
        width: 180,
        filterable: true,
        flex: 1, // This will take up remaining space
      },
      {
        field: "qtySize",
        headerName: "Qty",
        width: 70,
        filterable: true,
      },
      {
        field: "estimatedPrice",
        headerName: "Estimated Price",
        width: 100,
        filterable: true,
      },
      {
        field: "dateCreated",
        headerName: "Date Created",
        width: 100,
        filterable: true,
      },
      {
        field: "lastUpdated",
        headerName: "Last Updated",
        width: 100,
        filterable: true,
      },
      {
        field: "status",
        headerName: "Status",
        width: 100,
        filterable: true,
        type: "singleSelect",
        valueOptions: ["Pending", "Approved", "Denied"],
        renderCell: (params) => (
          <Chip
            label={params.value}
            color={getStatusColor(params.value as string)}
            size="small"
          />
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 90,
        filterable: false,
        sortable: false,
        renderCell: (params) => (
          <Button
            variant="text"
            color="primary"
            size="small"
            onClick={() => handleViewClick(params.row.id)}
          >
            View
          </Button>
        ),
      }
    );

    return baseColumns;
  };

  return (
    <div style={{ width: "100%", marginBottom: "2rem" }}>
      <Paper sx={{ width: "100%" }}>
        <DataGrid
          rows={tableData}
          columns={getColumns()}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          checkboxSelection={false}
          disableRowSelectionOnClick
          hideFooterSelectedRowCount
          disableColumnResize={false}
          sx={{
            "& .MuiDataGrid-footerContainer": {
              marginTop: 0,
              paddingTop: "8px",
              minHeight: "52px",
            },
            "& .MuiDataGrid-virtualScrollerContent": {
              marginBottom: 0,
            },
          }}
        />
      </Paper>
      {/* <RequestsDebugPanel
        userId={userId}
        effectiveUserId={userId} // Use userId prop directly since filtering is done by API
        filteredRequestsCount={safeRequests.length}
      /> */}
    </div>
  );
};
