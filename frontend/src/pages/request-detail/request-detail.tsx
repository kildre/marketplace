import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageTitle } from "../../components/page-title/page-title";
import { mockRequestData } from "@/data/mock-requestData";
import { organizationOptions } from "../../data/organizationOptionsData";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { getIconPath } from "../../utils/helper-functions";
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

    if (hasRole(AppRoles.APPROVER)) {
      return (
        <div className="request-detail-page cart-page marketplace-content">
          <PageTitle title={`Request Detail - ${request.requestId}`} />
          <div className="cart-page__content-wrapper">
            <div className="cart-page__content-left">
              <div className="cart-form__container">
                <div id="cart-form">
                  <div className="form-request-details__container">
                    <Accordion
                      defaultExpanded
                      slotProps={{ heading: { component: "h2" } }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="request-details-content"
                        id="request-details-header"
                      >
                        <span>Request Details</span>
                      </AccordionSummary>
                      <AccordionDetails className="form-request-details__accordion-details">
                        <FormControl
                          fullWidth
                          className="form-request-details__organization"
                        >
                          <label id="organization-label">Organization</label>
                          <Select
                            displayEmpty
                            disabled
                            id="organization-select"
                            name="organization"
                            size="small"
                            value={request.requestDetails.organization}
                            labelId="organization-label"
                            inputProps={{ "aria-label": "Organization" }}
                            renderValue={(selected) => {
                              return selected;
                            }}
                          >
                            {organizationOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {request.requestDetails.organization === "Other" && (
                          <>
                            <label htmlFor="organization-other">
                              Other Organization
                            </label>
                            <TextField
                              disabled
                              id="organization-other"
                              name="organizationOther"
                              variant="outlined"
                              fullWidth
                              size="small"
                              className="form-request-details__organization-other"
                              value={request.requestDetails.organizationOther}
                            />
                          </>
                        )}
                        <div className="form-request-details__poc-details">
                          <div className="form-request-details__poc-detail-item">
                            <label htmlFor="poc-name">
                              Point of Contact Name
                            </label>
                            <TextField
                              disabled
                              id="poc-name"
                              name="pocName"
                              variant="outlined"
                              size="small"
                              value={request.requestDetails.pocName}
                            />
                          </div>
                          <div className="form-request-details__poc-detail-item">
                            <label htmlFor="poc-phone">Phone Number</label>
                            <TextField
                              disabled
                              id="poc-phone"
                              name="pocPhone"
                              variant="outlined"
                              type="tel"
                              size="small"
                              value={request.requestDetails.pocPhone}
                            />
                          </div>
                          <div className="form-request-details__poc-detail-item">
                            <label htmlFor="poc-email">Email Address</label>
                            <TextField
                              disabled
                              id="poc-email"
                              name="pocEmail"
                              variant="outlined"
                              type="email"
                              size="small"
                              value={request.requestDetails.pocEmail}
                            />
                          </div>
                        </div>
                        <label htmlFor="use-case-description">
                          Use Case Description
                        </label>
                        <TextField
                          disabled
                          multiline
                          id="use-case-description"
                          name="useCaseDescription"
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={request.requestDetails.useCaseDescription}
                          minRows={6}
                        />
                      </AccordionDetails>
                    </Accordion>
                  </div>
                </div>
              </div>
              <div className="form-selected-applications__container">
                <Accordion
                  defaultExpanded
                  slotProps={{ heading: { component: "h2" } }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="selected-applications-content"
                    id="selected-applications-header"
                  >
                    Selected Applications ({request.summary.totalItems}{" "}
                    {request.summary.totalItems === 1 ? "product" : "products"})
                  </AccordionSummary>
                  <AccordionDetails className="form-selected-applications__accordion-details">
                    {request.cartItems.map((item) => (
                      <div key={item.productId} className="cart-item-card">
                        <img
                          className="cart-item-card__icon"
                          src={getIconPath(item.productType)}
                          alt={`${item.productType} icon`}
                        />
                        <div className="cart-item-card__details">
                          <h4>{item.productName}</h4>
                          <p>
                            Description: <span>{item.description}</span>
                          </p>
                          <p>
                            Qty requested: <span>{item.quantity}</span>
                          </p>
                        </div>
                        <div className="cart-item-card__price">
                          <p>
                            Cost:{" "}
                            <span>
                              {item.price ? `$${item.price}` : "Pending"}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </AccordionDetails>
                </Accordion>
              </div>
            </div>
            <div className="cart-page__content-right">
              <div className="form-personal-information">
                <div className="form-personal-information__section">
                  <h5>Personal Information</h5>
                  <p>
                    <strong>Name:</strong> {request.personalData.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {request.personalData.email}
                  </p>
                  <p>
                    <strong>Designation:</strong>{" "}
                    {request.personalData.designation}
                  </p>
                  <p>
                    <strong>Agency:</strong> {request.personalData.agency}
                  </p>
                </div>
                <div className="form-personal-information__section">
                  <h5>Cost Details</h5>
                  <p>
                    PRODUCTS REQUESTED<span>{request.summary.totalItems}</span>
                  </p>
                  <p>
                    APPLICATIONS PENDING PRICE
                    <span className="cost-warning">
                      {request.summary.pendingPriceItems}
                    </span>
                  </p>
                </div>
                <h6>
                  Estimated ROM
                  <span id="estimatedRom">{request.summary.estimatedROM}</span>
                </h6>
              </div>

              <div className="form-personal-information approval-section">
                <p className="approval-status__title">Approval Status</p>
                <label htmlFor="reasoning">Reasoning</label>
                <TextField
                  multiline
                  id="reasoning"
                  name="reasoning"
                  variant="outlined"
                  fullWidth
                  size="small"
                  minRows={6}
                  value={statusReason}
                  onChange={handleReasoningChange}
                />
                <button disabled className={buttonClass}>
                  {request.status}
                </button>
                <button
                  className="button button--status button--submit"
                  onClick={handleAccept}
                >
                  Accept
                </button>
                <button
                  className="button button--status button--denied"
                  onClick={handleReject}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (hasRole(AppRoles.REQUESTOR)) {
      return (
        <div className="request-detail-page cart-page marketplace-content">
          <PageTitle title={`Request Detail - ${request.requestId}`} />
          <div className="cart-page__content-wrapper">
            <div className="cart-page__content-left">
              <div className="cart-form__container">
                <div id="cart-form">
                  <div className="form-request-details__container">
                    <Accordion
                      defaultExpanded
                      slotProps={{ heading: { component: "h2" } }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="request-details-content"
                        id="request-details-header"
                      >
                        <span>Request Details</span>
                      </AccordionSummary>
                      <AccordionDetails className="form-request-details__accordion-details">
                        <FormControl
                          fullWidth
                          className="form-request-details__organization"
                        >
                          <label id="organization-label">Organization</label>
                          <Select
                            displayEmpty
                            disabled
                            id="organization-select"
                            name="organization"
                            size="small"
                            value={request.requestDetails.organization}
                            labelId="organization-label"
                            inputProps={{ "aria-label": "Organization" }}
                            renderValue={(selected) => {
                              return selected;
                            }}
                          >
                            {organizationOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {request.requestDetails.organization === "Other" && (
                          <>
                            <label htmlFor="organization-other">
                              Other Organization
                            </label>
                            <TextField
                              disabled
                              id="organization-other"
                              name="organizationOther"
                              variant="outlined"
                              fullWidth
                              size="small"
                              className="form-request-details__organization-other"
                              value={request.requestDetails.organizationOther}
                            />
                          </>
                        )}
                        <div className="form-request-details__poc-details">
                          <div className="form-request-details__poc-detail-item">
                            <label htmlFor="poc-name">
                              Point of Contact Name
                            </label>
                            <TextField
                              disabled
                              id="poc-name"
                              name="pocName"
                              variant="outlined"
                              size="small"
                              value={request.requestDetails.pocName}
                            />
                          </div>
                          <div className="form-request-details__poc-detail-item">
                            <label htmlFor="poc-phone">Phone Number</label>
                            <TextField
                              disabled
                              id="poc-phone"
                              name="pocPhone"
                              variant="outlined"
                              type="tel"
                              size="small"
                              value={request.requestDetails.pocPhone}
                            />
                          </div>
                          <div className="form-request-details__poc-detail-item">
                            <label htmlFor="poc-email">Email Address</label>
                            <TextField
                              disabled
                              id="poc-email"
                              name="pocEmail"
                              variant="outlined"
                              type="email"
                              size="small"
                              value={request.requestDetails.pocEmail}
                            />
                          </div>
                        </div>
                        <label htmlFor="use-case-description">
                          Use Case Description
                        </label>
                        <TextField
                          disabled
                          multiline
                          id="use-case-description"
                          name="useCaseDescription"
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={request.requestDetails.useCaseDescription}
                          minRows={6}
                        />
                      </AccordionDetails>
                    </Accordion>
                  </div>
                </div>
              </div>
              <div className="form-selected-applications__container">
                <Accordion
                  defaultExpanded
                  slotProps={{ heading: { component: "h2" } }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="selected-applications-content"
                    id="selected-applications-header"
                  >
                    Selected Applications ({request.summary.totalItems}{" "}
                    {request.summary.totalItems === 1 ? "product" : "products"})
                  </AccordionSummary>
                  <AccordionDetails className="form-selected-applications__accordion-details">
                    {request.cartItems.map((item) => (
                      <div key={item.productId} className="cart-item-card">
                        <img
                          className="cart-item-card__icon"
                          src={getIconPath(item.productType)}
                          alt={`${item.productType} icon`}
                        />
                        <div className="cart-item-card__details">
                          <h4>{item.productName}</h4>
                          <p>
                            Description: <span>{item.description}</span>
                          </p>
                          <p>
                            Qty requested: <span>{item.quantity}</span>
                          </p>
                        </div>
                        <div className="cart-item-card__price">
                          <p>
                            Cost:{" "}
                            <span>
                              {item.price ? `$${item.price}` : "Pending"}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </AccordionDetails>
                </Accordion>
              </div>
            </div>
            <div className="cart-page__content-right">
              <div className="form-personal-information">
                <div className="form-personal-information__section">
                  <h5>Personal Information</h5>
                  <p>
                    <strong>Name:</strong> {request.personalData.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {request.personalData.email}
                  </p>
                  <p>
                    <strong>Designation:</strong>{" "}
                    {request.personalData.designation}
                  </p>
                  <p>
                    <strong>Agency:</strong> {request.personalData.agency}
                  </p>
                </div>
                <div className="form-personal-information__section">
                  <h5>Cost Details</h5>
                  <p>
                    PRODUCTS REQUESTED<span>{request.summary.totalItems}</span>
                  </p>
                  <p>
                    APPLICATIONS PENDING PRICE
                    <span className="cost-warning">
                      {request.summary.pendingPriceItems}
                    </span>
                  </p>
                </div>
                <h6>
                  Estimated ROM
                  <span id="estimatedRom">{request.summary.estimatedROM}</span>
                </h6>
              </div>

              <div className="form-personal-information approval-section">
                <p className="approval-status__title">Approval Status</p>
                <label htmlFor="reasoning">Reasoning</label>
                <TextField
                  disabled
                  multiline
                  id="reasoning"
                  name="reasoning"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={request.statusReason}
                  minRows={6}
                />
                <button disabled className={buttonClass}>
                  {request.status}
                </button>
              </div>
            </div>
          </div>
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
