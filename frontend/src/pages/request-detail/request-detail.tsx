import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { PageTitle } from "../../components/page-title/page-title";
import { mockRequestData } from "@/data/mock-requestData";
import { RequestDetailView } from "../../components/common/request-detail-view";
import { useAuth } from "@/hooks/useAuth";
import { AppRoles } from "@/types/auth";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";

export const RequestDetail = (): React.ReactElement => {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get("id");
  const userId = searchParams.get("userId"); // Get userId from URL
  const { hasRole, getUserInfo } = useAuth();

  // Create the back link URL - preserve userId if it exists
  const backToRequestsUrl = userId ? `/requests?userId=${userId}` : "/requests";

  // If an ID is provided, show the specific request detail
  if (requestId) {
    const request = mockRequestData.find(
      (req) => req.requestId.toString() === requestId
    );

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

    // State for managing the reasoning field value
    const [statusReason, setStatusReason] = useState(
      request.statusReason || ""
    );

    // Generate button class based on status
    let buttonClass = "button button--status";
    if (request.status === "Approved") {
      buttonClass += " button--approved";
    } else if (request.status === "Denied") {
      buttonClass += " button--denied";
    } else if (request.status === "Pending") {
      buttonClass += " button--pending";
    }

    const updateRequest = async () => {
      const userInfo = getUserInfo();
      const response = await window.fetch("/api/decisions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: request.requestId,
          status: request.status,
          statusReason: request.statusReason,
          adjudicatorEmail: userInfo?.email || "",
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
