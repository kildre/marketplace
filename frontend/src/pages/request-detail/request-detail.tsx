import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageTitle } from "../../components/page-title/page-title";
import { mockRequestData } from "@/data/mock-requestData";
import { RequestDetailView } from "../../components/common/request-detail-view";
import { useAuth } from "@/hooks/useAuth";
import { AppRoles } from "@/types/auth";

export const RequestDetail = (): React.ReactElement => {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get("id");
  const { hasRole } = useAuth();

  // If an ID is provided, show the specific request detail
  if (requestId) {
    const request = mockRequestData.find(
      (req) => req.requestId.toString() === requestId
    );

    if (!request) {
      return (
        <div className="requests-page marketplace-content">
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
    } else {
      buttonClass = "button"; // Default case
    }

    const updateRequest = () => {
      // Logic to update the request status
      // @TODO: Replace with actual API call
      /* eslint-disable-next-line */
      console.log("Updated request: ", request);
    };

    const handleReasoningChange = (
      event: React.ChangeEvent<{ value: string }>
    ) => {
      setStatusReason(event.target.value);
    };

    const handleAccept = () => {
      // Logic to handle accept action
      request.status = "Approved";
      request.statusReason = statusReason || "Request accepted.";
      updateRequest();
    };

    const handleReject = () => {
      // Logic to handle reject action
      request.status = "Denied";
      request.statusReason = statusReason || "Request denied.";
      updateRequest();
    };

    // Render main layout with role-based approval section
    if (hasRole(AppRoles.APPROVER) || hasRole(AppRoles.REQUESTOR)) {
      const isApprover = hasRole(AppRoles.APPROVER);
      const mode = isApprover ? "approve" : "view";

      return (
        <div className="request-detail-page cart-page marketplace-content">
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
      <PageTitle title="Request Not Found" />
      <p>
        No Request ID was given as a parameter. Please return to the previous
        page.
      </p>
    </div>
  );
};
