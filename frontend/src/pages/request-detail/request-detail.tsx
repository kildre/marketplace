import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { PageTitle } from "../../components/page-title/page-title";
import { RequestDetailView } from "../../components/common/request-detail-view";
import { useAuth } from "@/hooks/useAuth";
import { AppRoles } from "@/types/auth";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";
import { RequestData, CartItemData } from "@/interfaces/interfaceStore";
import {
  generateRequestId,
  calculateEstimatedCost,
} from "@/utils/helper-functions";
import { mockProducts } from "@/data/mock-productData";

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

  return {
    requestId: (apiRequest.requestNumber as string) || "",
    personalData: {
      name:
        (apiRequest.pointOfContact as string) ||
        (apiRequest.designation as string) ||
        "N/A",
      email: (apiRequest.requestorEmail as string) || "N/A",
      designation: (apiRequest.designation as string) || "N/A",
      agency: (apiRequest.agency as string) || "N/A",
    },
    requestDetails: {
      organization: (apiRequest.organization as string) || "N/A",
      organizationOther: (apiRequest.otherOrganization as string) || "",
      pocName: (apiRequest.pointOfContact as string) || "N/A",
      pocPhone: (apiRequest.phoneNumber as string) || "N/A",
      pocEmail:
        (apiRequest.email as string) ||
        (apiRequest.requestorEmail as string) ||
        "N/A",
      useCaseDescription: (apiRequest.description as string) || "N/A",
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
      (apiRequest.statusId as number) === 1
        ? "Pending"
        : (apiRequest.statusId as number) === 2
        ? "Approved"
        : "Denied",
    statusReason: (apiRequest.statusReason as string) || "",
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

  // Create the back link URL - preserve userId if it exists
  const backToRequestsUrl = userId ? `/requests?userId=${userId}` : "/requests";

  // Update statusReason when request changes
  useEffect(() => {
    if (request) {
      setStatusReason(request.statusReason || "");
    }
  }, [request]);

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

        let response;

        if (hasRole(AppRoles.APPROVER)) {
          // Approvers can see all requests
          response = await window.fetch("/api/requests/viewAll", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userEmail: userInfo.email,
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
              userEmail: userInfo.email,
            }),
          });
        }

        if (response.ok) {
          const requestsData = await response.json();

          // Handle API response format: { requests: [...], errMsg: "..." }
          let allRequests = [];
          if (requestsData && Array.isArray(requestsData.requests)) {
            allRequests = requestsData.requests;
          } else if (Array.isArray(requestsData)) {
            allRequests = requestsData;
          }

          // Find the specific request by requestNumber (from API) matching requestId (from URL)
          const foundRequest = allRequests.find(
            (req: Record<string, unknown>) =>
              (req.requestNumber as string) === requestId
          );

          if (foundRequest) {
            setRequest(transformApiRequestToRequestData(foundRequest));
          } else {
            setRequest(null);
          }
        } else {
          setError("Failed to fetch request data");
        }
      } catch (err) {
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

    // Determine status number for API request
    const statusNumber =
      request.status === "Pending" ? 1 : request.status === "Approved" ? 2 : 3;

    const updateRequest = async () => {
      const userInfo = getUserInfo();
      const computedDecisionNumber = generateRequestId(12);
      const response = await window.fetch("/api/decisions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          decisionNumber: computedDecisionNumber,
          requestNumber: request.requestId,
          adjudicatorEmail: userInfo?.email,
          statusId: statusNumber,
          comments: request.statusReason,
          ticketType: "Request",
          asset: "",
          quantity: 0,
          estimatedPrice: 0,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      return result;
    };

    const handleReasoningChange = (
      event: React.ChangeEvent<{ value: string }>
    ) => {
      setStatusReason(event.target.value);
    };

    const handleAccept = async () => {
      // Logic to handle accept action
      request.status = "Approved";
      request.statusReason = statusReason || "Request accepted.";
      try {
        await updateRequest();
        // Navigate to home page after successful approval
        navigate("/");
      } catch {
        // Handle error appropriately in your UI
      }
    };

    const handleReject = async () => {
      // Logic to handle reject action
      request.status = "Denied";
      request.statusReason = statusReason || "Request denied.";
      try {
        await updateRequest();
        // Navigate to home page after successful rejection
        navigate("/");
      } catch {
        // Handle error appropriately in your UI
      }
    };

    // Render main layout with role-based approval section
    if (hasRole(AppRoles.APPROVER) || hasRole(AppRoles.REQUESTOR)) {
      const isApprover = hasRole(AppRoles.APPROVER);
      const mode = isApprover ? "approve" : "view";

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
            statusReason={isApprover ? statusReason : request.statusReason}
            onReasoningChange={handleReasoningChange}
            onAccept={handleAccept}
            onReject={handleReject}
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
