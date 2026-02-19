import { Box, Button, Chip, IconButton, Paper, Tooltip } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
    RequestData,
    RequestsTableProps,
} from "../../interfaces/interfaceStore";
// import { RequestsDebugPanel } from "../debug/RequestsDebugPanel"; // Uncomment to use debug panel with userId and component
import { ApiError, ApiService } from "@/services/apiService";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { mockProducts } from "../../data/mock-productData";
import { calculateEstimatedCost } from "../../utils/helper-functions";

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
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollContainerRef = React.useRef<globalThis.HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = React.useState(false);
  const [showRightFade, setShowRightFade] = React.useState(false);
  const [showResetButton, setShowResetButton] = React.useState(false);
  const [columnVisibilityModel, setColumnVisibilityModel] = React.useState({});
  const [resetKey, setResetKey] = React.useState(0);

  // Fetch requests from API - memoized to prevent infinite loops
  const fetchData = React.useCallback(async () => {
    if (isLoading) return; // Prevent concurrent requests

    setIsLoading(true);
    try {
      const userInfo = getUserInfo();
      if (!userInfo) {
        // eslint-disable-next-line no-console
        console.error("User info not available");
        setAllRequests([]);
        return;
      }

      if (isApprover()) {
        const response = await ApiService.getAllRequests(userInfo.email);
        // Cast the API response to the expected RequestData format
        setAllRequests((response.requests || []) as unknown as RequestData[]);
      } else {
        const response = await ApiService.getRequestsForRequestor(
          userInfo.email
        );
        // Cast the API response to the expected RequestData format
        setAllRequests((response.requests || []) as unknown as RequestData[]);
      }
    } catch (err) {
      const error = err as Error | ApiError;
      // Check if it's a 500-level server error
      if (
        ("name" in error && error.name === "ServerError") ||
        ("statusCode" in error && error.statusCode >= 500)
      ) {
        navigate("/500", { replace: true });
        return;
      }
      // eslint-disable-next-line no-console
      console.error("Error fetching data:", error);
      setAllRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove the dependencies that cause infinite loops

  React.useEffect(() => {
    // When data prop is provided, use it directly
    // When no data prop, fetch from API
    if (data !== undefined) {
      setAllRequests(data);
    } else if (!isLoading) {
      fetchData();
    }
  }, [data, isLoading]); // Depend on both data and isLoading

  // Handle scroll to show/hide fade indicators
  const handleScroll = React.useCallback((event: globalThis.Event) => {
    const target = event.target as HTMLElement;
    if (!target) return;

    const scrollLeft = target.scrollLeft;
    const scrollWidth = target.scrollWidth;
    const clientWidth = target.clientWidth;

    // Show left fade if scrolled right
    setShowLeftFade(scrollLeft > 10);

    // Show right fade if not at the end
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);

    // Show reset button if scrolled or content is wider than container
    setShowResetButton(scrollLeft > 10 || scrollWidth > clientWidth);
  }, []);

  // Check if content overflows on mount and window resize
  React.useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const checkOverflow = () => {
      const scrollWidth = scrollContainer.scrollWidth;
      const clientWidth = scrollContainer.clientWidth;
      const hasOverflow = scrollWidth > clientWidth;

      setShowRightFade(hasOverflow);
      setShowResetButton(hasOverflow || scrollContainer.scrollLeft > 10);
    };

    // Initial check
    checkOverflow();

    // Add scroll listener
    scrollContainer.addEventListener(
      "scroll",
      handleScroll as globalThis.EventListener
    );

    // Add resize listener
    window.addEventListener("resize", checkOverflow);

    // Use MutationObserver to detect when table content changes (e.g., column resize)
    const observer = new globalThis.MutationObserver(checkOverflow);
    observer.observe(scrollContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style"],
    });

    return () => {
      scrollContainer.removeEventListener(
        "scroll",
        handleScroll as globalThis.EventListener
      );
      window.removeEventListener("resize", checkOverflow);
      observer.disconnect();
    };
  }, [handleScroll]);

  // Reset table view - reset column widths and scroll position
  const handleResetView = () => {
    // Reset the DataGrid by changing the key, which forces a remount
    setResetKey((prev) => prev + 1);

    // Also reset scroll position
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.scrollTo({ left: 0, behavior: "smooth" });
      window.setTimeout(() => {
        if (scrollContainer.scrollLeft !== 0) {
          scrollContainer.scrollLeft = 0;
        }
      }, 100);
    }

    // Hide the reset button temporarily
    setShowResetButton(false);
  };

  // Update allRequests state when data prop changes
  React.useEffect(() => {
    if (data) {
      setAllRequests(data);
    }
  }, [data]);

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
        requestNumber: (apiRequest.requestNumber as string) || "N/A",
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
            : (statusId as number) === 4
            ? "ROM Generated"
            : (statusId as number) === 5
            ? "MIPR Needed"
            : (statusId as number) === 6
            ? "Procuring"
            : (statusId as number) === 7
            ? "Allocation Pending"
            : (statusId as number) === 8
            ? "Complete"
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
    const baseColumns: GridColDef[] = [
      {
        field: "requestNumber",
        headerName: "Request #",
        width: 110,
        filterable: true,
      },
    ];

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
        width: 150,
        filterable: true,
        type: "singleSelect",
        valueOptions: [
          "Pending",
          "Approved",
          "Denied",
          "ROM Generated",
          "MIPR Needed",
          "Procuring Products",
          "Allocation Pending",
          "Complete",
        ],
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
    <div style={{ width: "100%", marginBottom: "2rem", position: "relative" }}>
      {/* Left fade gradient */}
      {showLeftFade && (
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "60px",
            background:
              "linear-gradient(to right, rgba(255,255,255,0.95), transparent)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      )}

      {/* Right fade gradient */}
      {showRightFade && (
        <Box
          sx={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "60px",
            background:
              "linear-gradient(to left, rgba(255,255,255,0.95), transparent)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      )}

      {/* Reset View Button */}
      {showResetButton && (
        <Tooltip title="Reset Table View" placement="left">
          <IconButton
            onClick={handleResetView}
            sx={{
              position: "absolute",
              bottom: "16px",
              right: "16px",
              zIndex: 20,
              backgroundColor: "white",
              boxShadow: 2,
              "&:hover": {
                backgroundColor: "#f5f5f5",
                boxShadow: 4,
              },
            }}
            size="small"
          >
            <RestartAltIcon />
          </IconButton>
        </Tooltip>
      )}

      <Paper
        ref={scrollContainerRef}
        sx={{
          width: "100%",
          overflowX: "auto",
          position: "relative",
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#bbb",
            borderRadius: "4px",
            "&:hover": {
              backgroundColor: "#999",
            },
          },
        }}
      >
        <DataGrid
          key={resetKey}
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
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={setColumnVisibilityModel}
          sx={{
            minWidth: "100%",
            width: "fit-content",
            "& .MuiDataGrid-main": {
              overflow: "visible",
            },
            "& .MuiDataGrid-virtualScroller": {
              overflow: "visible",
            },
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
