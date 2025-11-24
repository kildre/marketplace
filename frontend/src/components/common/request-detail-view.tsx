import React from "react";
import { FormRequestDetails } from "../form-request-details/form-request-details";
import { FormSelectedApplications } from "../form-selected-applications/form-selected-applications";
import { FormPersonalInformation } from "../form-personal-information/form-personal-information";
import { FormCostDetails } from "../form-cost-details/form-cost-details";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import { RequestDetailViewProps } from "../../interfaces";

// Get status color for the chip
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

export const RequestDetailView: React.FC<RequestDetailViewProps> = ({
  request,
  statusReason,
  onReasoningChange,
  onAccept,
  onReject,
  buttonClass: _buttonClass,
  mode,
}) => {
  const isReadOnly = mode === "view";
  const showActionButtons = mode === "approve";

  return (
    <div className="cart-page__content-wrapper">
      <div className="cart-page__content-left">
        <div className="cart-form__container">
          <div id="cart-form">
            {/* Reuse existing FormRequestDetails with view-only mode */}
            <FormRequestDetails mode="view" viewData={request.requestDetails} />
          </div>
        </div>
        {/* Reuse existing FormSelectedApplications with view-only mode */}
        <FormSelectedApplications
          mode="view"
          viewData={{
            cartItems: request.cartItems,
            totalItems: request.summary.totalItems,
          }}
        />
      </div>
      <div className="cart-page__content-right">
        <div className="form-personal-information">
          {/* Enhanced FormPersonalInformation with dynamic data */}
          <FormPersonalInformation personalData={request.personalData} />

          {/* Enhanced FormCostDetails with request data */}
          <FormCostDetails source="request" summary={request.summary} />
        </div>

        {/* Approval Section */}
        <div className="form-personal-information approval-section">
          <div className="approval-status__header">
            <p className="approval-status__title">Approval Status</p>
            <Chip
              label={request.status}
              color={getStatusColor(request.status)}
              size="small"
            />
          </div>
          <label htmlFor="reasoning">Reasoning</label>
          <TextField
            multiline
            disabled={isReadOnly}
            id="reasoning"
            name="reasoning"
            variant="outlined"
            fullWidth
            size="small"
            minRows={6}
            value={statusReason || ""}
            onChange={onReasoningChange}
          />
          {showActionButtons && (
            <>
              <button
                className="button button--status button--submit"
                onClick={onAccept}
              >
                Accept
              </button>
              <button
                className="button button--status button--denied"
                onClick={onReject}
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
