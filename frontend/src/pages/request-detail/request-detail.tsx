import { mockProducts } from "@/data/mock-productData";
import { useAuth } from "@/hooks/useAuth";
import { CartItemData, RequestData } from "@/interfaces/interfaceStore";
import { ApiError, ApiService } from "@/services/apiService";
import { AppRoles } from "@/types/auth";
import {
  calculateEstimatedCost,
  generateRequestId,
  getUserNameFromEmail,
} from "@/utils/helper-functions";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { RequestDetailView } from "../../components/common/request-detail-view";
import { PageTitle } from "../../components/page-title/page-title";

// Transform API response to RequestData format (similar to useRequestsData)
const transformApiRequestToRequestData = (
  apiRequest: Record<string, unknown>
): RequestData => {
  // Transform cart items by matching names to mock product data
  const transformCartItems = (cartItems: unknown[]): CartItemData[] => {
    if (!Array.isArray(cartItems)) return [];

    return cartItems.map((item: unknown) => {
      const cartItem = item as Record<string, unknown>;
      const itemName = (cartItem.name as string) || "";
      const quantity = (cartItem.quantity as number) || 1;

      // Find matching product in mock data
      const mockProduct = mockProducts.items.find(
        (product) => product.name.toLowerCase() === itemName.toLowerCase()
      );

      if (mockProduct) {
        return {
          productId: mockProduct.id,
          productName: mockProduct.name,
          productType: mockProduct.type,
          quantity: quantity,
          price: mockProduct.price,
          description: mockProduct.description,
          unit: mockProduct.unit,
          rom: mockProduct.rom,
        };
      } else {
        // Fallback for unknown products
        return {
          productId: 0,
          productName: itemName,
          productType: "Unknown" as const,
          quantity: quantity,
          price: null,
          description: "Product not found in catalog",
          unit: 1,
        };
      }
    });
  };

  // Extract decision information
  const decision = apiRequest.decision as Record<string, unknown> | null;
  const decisionComments = decision?.comments as string;
  const hasDecision = decision !== null;

  // Use decision.statusId if available, otherwise fall back to apiRequest.statusId
  const statusId = decision?.statusId || apiRequest.statusId;

  return {
    requestId: (apiRequest.requestNumber as string) || "",
    personalData: {
      name: getUserNameFromEmail((apiRequest.requestorEmail as string) || ""),
      email: (apiRequest.requestorEmail as string) || "N/A",
      designation: (apiRequest.designation as string) || "N/A",
      agency: (apiRequest.agency as string) || "N/A",
    },
    requestDetails: {
      organization: (apiRequest.organization as string) || "N/A",
      organizationOther: (apiRequest.otherOrganization as string) || "",
      pocName: (apiRequest.pointOfContact as string) || "",
      pocPhone: (apiRequest.phoneNumber as string) || "",
      pocEmail: (apiRequest.email as string) || "",
      useCaseDescription: (apiRequest.description as string) || "",
    },
    cartItems: transformCartItems((apiRequest.cartItems as unknown[]) || []),
    summary: {
      totalItems: Array.isArray(apiRequest.cartItems)
        ? apiRequest.cartItems.length
        : 0,
      totalQuantity: Array.isArray(apiRequest.cartItems)
        ? (apiRequest.cartItems as Array<Record<string, unknown>>).reduce(
            (sum, item) => sum + ((item.quantity as number) || 1),
            0
          )
        : 0,
      pendingPriceItems: Array.isArray(apiRequest.cartItems)
        ? (apiRequest.cartItems as Array<Record<string, unknown>>).filter(
            (item) => {
              const itemName = (item.name as string) || "";
              const mockProduct = mockProducts.items.find(
                (product) =>
                  product.name.toLowerCase() === itemName.toLowerCase()
              );
              return mockProduct && mockProduct.price === null;
            }
          ).length
        : 0,
      estimatedROM: calculateEstimatedCost(
        (apiRequest.cartItems as Array<Record<string, unknown>>) || [],
        mockProducts
      ),
    },
    submittedAt: (apiRequest.createdAt as string) || new Date().toISOString(),
    status:
      (statusId as number) === 1
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
        ? "Procuring Products"
        : (statusId as number) === 7
        ? "Allocation Pending"
        : (statusId as number) === 8
        ? "Complete"
        : "Unknown",
    statusReason: hasDecision
      ? decisionComments || ""
      : (apiRequest.statusReason as string) || "",
    decisionNumber: decision?.decisionNumber as string,
    createdAt: (apiRequest.createdAt as string) || new Date().toISOString(),
    updatedAt: (apiRequest.updatedAt as string) || new Date().toISOString(),
  };
};

export const RequestDetail = (): React.ReactElement => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestId = searchParams.get("id");
  const userId = searchParams.get("userId"); // Get userId from URL
  const { hasRole, getUserInfo } = useAuth();
  const [request, setRequest] = useState<RequestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State for managing the reasoning field value - must be at top level
  const [statusReason, setStatusReason] = useState("");
  // State to track if a decision already exists
  const [hasDecision, setHasDecision] = useState(false);

  // Create the back link URL - preserve userId if it exists
  const backToRequestsUrl = userId ? `/requests?userId=${userId}` : "/requests";

  // Initialize statusReason and hasDecision only when request ID changes
  useEffect(() => {
    if (request) {
      setStatusReason(request.statusReason || "");
      // Check if decision exists based on decisionNumber presence
      setHasDecision(!!request.decisionNumber);
    }
  }, [request?.requestId]);

  // Separate useEffect for access control
  useEffect(() => {
    if (request) {
      // Access control: Check if user can view this request
      const userInfo = getUserInfo();
      const isApprover = hasRole(AppRoles.APPROVER);
      const isRequestOwner =
        userInfo?.email?.toLowerCase() ===
        request.personalData.email.toLowerCase();

      // If user is neither an approver nor the request owner, deny access
      if (!isApprover && !isRequestOwner) {
        navigate("/403", { replace: true });
      }
    }
  }, [request, hasRole, getUserInfo, navigate]);

  // Fetch request data from API
  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId) {
        setLoading(false);
        return;
      }

      const userInfo = getUserInfo();
      if (!userInfo?.email) {
        setLoading(false);
        setError("User email not available");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Use the new direct API call to get specific request by number
        const requestData = await ApiService.getRequestByNumber(
          userInfo.email,
          requestId
        );

        if (requestData.request) {
          const transformedRequest = transformApiRequestToRequestData(
            requestData.request as unknown as Record<string, unknown>
          );
          setRequest(transformedRequest);
        } else {
          setRequest(null);
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
        setError("Failed to fetch request data");
        // eslint-disable-next-line no-console
        console.error("Error fetching request:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [requestId]); // Only depend on requestId, not on the functions

  // If an ID is provided, show the specific request detail
  if (requestId) {
    // Show loading state
    if (loading) {
      return (
        <div className="requests-page marketplace-content">
          <div className="back-button-wrapper">
            <Button
              component={Link}
              to={backToRequestsUrl}
              startIcon={<ArrowBackIcon />}
              variant="text"
              color="primary"
              sx={{ textTransform: "none" }}
            >
              Back to Requests
            </Button>
          </div>
          <PageTitle title="Loading Request..." />
          <p>Loading request details...</p>
        </div>
      );
    }

    // Show error state
    if (error) {
      return (
        <div className="requests-page marketplace-content">
          <div className="back-button-wrapper">
            <Button
              component={Link}
              to={backToRequestsUrl}
              startIcon={<ArrowBackIcon />}
              variant="text"
              color="primary"
              sx={{ textTransform: "none" }}
            >
              Back to Requests
            </Button>
          </div>
          <PageTitle title="Error Loading Request" />
          <p>{error}</p>
        </div>
      );
    }

    // Show request not found state
    if (!request) {
      return (
        <div className="requests-page marketplace-content">
          {/* Back to Requests Button */}
          <div className="back-button-wrapper">
            <Button
              component={Link}
              to={backToRequestsUrl}
              startIcon={<ArrowBackIcon />}
              variant="text"
              color="primary"
              sx={{ textTransform: "none" }}
            >
              Back to Requests
            </Button>
          </div>
          <PageTitle title="Request Not Found" />
          <p>Request with ID {requestId} was not found.</p>
        </div>
      );
    }

    // Generate button class based on status
    let buttonClass = "button button--status";
    if (request.status === "Approved") {
      buttonClass += " button--approved";
    } else if (request.status === "Denied") {
      buttonClass += " button--denied";
    } else if (request.status === "Pending") {
      buttonClass += " button--pending";
    }

    const updateRequest = async (statusId: number) => {
      const userInfo = getUserInfo();
      const computedDecisionNumber = generateRequestId(12);

      const decisionData = {
        decisionNumber: computedDecisionNumber,
        requestNumber: request.requestId,
        adjudicatorEmail: userInfo?.email,
        statusId: statusId,
        comments: request.statusReason,
        ticketType: "Request",
        asset: "",
        cartItem: {
          name: "",
          quantity: 0,
          estimatedPrice: 0,
        },
      };

      const result = await ApiService.makeDecision(decisionData);
      return result;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleReasoningChange = (event: React.ChangeEvent<any>) => {
      setStatusReason(event.target.value);
    };

    // Generic handler for status updates
    const handleStatusUpdate = async (
      statusId: number,
      statusLabel: string,
      defaultReason: string
    ) => {
      request.status = statusLabel;
      request.statusReason = statusReason || defaultReason;
      try {
        await updateRequest(statusId);
        navigate("/");
      } catch (err) {
        const error = err as Error | ApiError;
        if (
          ("name" in error && error.name === "ServerError") ||
          ("statusCode" in error && error.statusCode >= 500)
        ) {
          navigate("/500", { replace: true });
          return;
        }
        // eslint-disable-next-line no-console
        console.error(
          `Error updating request status to ${statusLabel}:`,
          error
        );
      }
    };

    // Specific status handlers using the generic function
    const handleAccept = () =>
      handleStatusUpdate(2, "Approved", "Request accepted.");
    const handleReject = () =>
      handleStatusUpdate(3, "Denied", "Request denied.");
    const handleStatusRomGenerated = () =>
      handleStatusUpdate(4, "ROM Generated", "ROM has been generated.");
    const handleStatusMiprNeeded = () =>
      handleStatusUpdate(5, "MIPR Needed", "MIPR is needed.");
    const handleStatusProcuringProducts = () =>
      handleStatusUpdate(
        6,
        "Procuring Products",
        "Currently procuring products."
      );
    const handleStatusAllocationPending = () =>
      handleStatusUpdate(7, "Allocation Pending", "Allocation is pending.");
    const handleStatusComplete = () =>
      handleStatusUpdate(8, "Complete", "Request completed.");

    // Render main layout with role-based approval section
    if (hasRole(AppRoles.APPROVER) || hasRole(AppRoles.REQUESTOR)) {
      const isApprover = hasRole(AppRoles.APPROVER);
      // If a decision exists, always use view mode; otherwise use approve mode for approvers
      const mode = hasDecision ? "view" : isApprover ? "approve" : "view";

      return (
        <div className="request-detail-page cart-page marketplace-content">
          {/* Back to Requests Button */}
          <div className="back-button-wrapper">
            <Button
              component={Link}
              to={backToRequestsUrl}
              startIcon={<ArrowBackIcon />}
              variant="text"
              color="primary"
              sx={{ textTransform: "none" }}
            >
              Back to Requests
            </Button>
          </div>
          <PageTitle title={`Request Detail - ${request.requestId}`} />
          <RequestDetailView
            request={request}
            statusReason={statusReason}
            onReasoningChange={handleReasoningChange}
            onAccept={handleAccept}
            onReject={handleReject}
            onStatusRomGenerated={handleStatusRomGenerated}
            onStatusMiprNeeded={handleStatusMiprNeeded}
            onStatusProcuringProducts={handleStatusProcuringProducts}
            onStatusAllocationPending={handleStatusAllocationPending}
            onStatusComplete={handleStatusComplete}
            buttonClass={buttonClass}
            mode={mode}
          />
        </div>
      );
    } else {
      // If the user does not have the expected roles, show an error message
      return (
        <div className="requests-page marketplace-content">
          {/* Back to Requests Button */}
          <div className="back-button-wrapper">
            <Button
              component={Link}
              to={backToRequestsUrl}
              startIcon={<ArrowBackIcon />}
              variant="text"
              color="primary"
              sx={{ textTransform: "none" }}
            >
              Back to Requests
            </Button>
          </div>
          <PageTitle title="No User Role Found" />
          <p>
            Your user role does not match any of the expected roles for this
            page. Please contact your administrator for assistance.
          </p>
        </div>
      );
    }
  }

  // If no ID is provided, show an error message
  return (
    <div className="requests-page marketplace-content">
      {/* Back to Requests Button */}
      <div className="back-button-wrapper">
        <Button
          component={Link}
          to={backToRequestsUrl}
          startIcon={<ArrowBackIcon />}
          variant="text"
          color="primary"
          sx={{ textTransform: "none" }}
        >
          Back to Requests
        </Button>
      </div>
      <PageTitle title="Request Not Found" />
      <p>
        No Request ID was given as a parameter. Please return to the previous
        page.
      </p>
    </div>
  );
};
