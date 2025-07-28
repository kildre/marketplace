import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { organizationOptions } from "../../data/organizationOptionsData";
import {
  useOrganizationForm,
  useRequestDetailsForm,
} from "../../hooks/useFormQueries";
import { FormRequestDetailsProps } from "../../interfaces";

export const FormRequestDetails = ({
  mode = "edit",
  viewData,
}: FormRequestDetailsProps = {}): React.ReactElement => {
  const { organization, organizationOther, updateOrganization } =
    useOrganizationForm();

  const {
    pocName,
    pocPhone,
    pocEmail,
    useCaseDescription,
    updateRequestDetails,
  } = useRequestDetailsForm();

  // Use viewData for view mode, form data for edit mode
  const data =
    mode === "view" && viewData
      ? viewData
      : {
          organization,
          organizationOther,
          pocName,
          pocPhone,
          pocEmail,
          useCaseDescription,
        };

  const isViewMode = mode === "view";

  const handleOrganizationChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as string;

    // Update organization and reset organizationOther if needed in a single call
    const updateData: Partial<{
      organization: string;
      organizationOther: string;
    }> = {
      organization: value,
    };

    if (value !== "Other") {
      updateData.organizationOther = "";
    }

    updateOrganization(updateData);
  };

  const handleOrganizationOtherChange = (
    e: React.ChangeEvent<{ value: string }>
  ) => {
    updateOrganization({ organizationOther: e.target.value });
  };

  const handleFieldChange =
    (fieldName: string) => (e: React.ChangeEvent<{ value: string }>) => {
      const update: Record<string, string> = { [fieldName]: e.target.value };
      updateRequestDetails(update);
    };

  return (
    <div className="form-request-details__container">
      {/* Display warning if organization is not selected - only in edit mode */}
      {!isViewMode && data.organization === "" && (
        <Alert severity="warning">
          Please select an organization that this request is on behalf of.
        </Alert>
      )}
      {/* Display warning if "Other" is selected but no organization input - only in edit mode */}
      {!isViewMode &&
        data.organization === "Other" &&
        data.organizationOther === "" && (
          <Alert severity="warning">
            Please specify the organization you are requesting on behalf of.
          </Alert>
        )}
      <Accordion defaultExpanded slotProps={{ heading: { component: "h2" } }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="request-details-content"
          id="request-details-header"
        >
          <span>Request Details</span>
        </AccordionSummary>
        <AccordionDetails className="form-request-details__accordion-details">
          <FormControl fullWidth className="form-request-details__organization">
            <label id="organization-label">
              Organization{!isViewMode && <span>*</span>}
            </label>
            {!isViewMode && (
              <p>Select the organization that this request is on behalf of.</p>
            )}
            <Select
              displayEmpty
              required={!isViewMode}
              disabled={isViewMode}
              id="organization-select"
              name="organization"
              size="small"
              value={data.organization}
              onChange={isViewMode ? undefined : handleOrganizationChange}
              labelId="organization-label"
              inputProps={{ "aria-label": "Organization" }}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <em>- Select -</em>;
                }
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
          {data.organization === "Other" && (
            <>
              <label htmlFor="organization-other">
                {isViewMode
                  ? "Other Organization"
                  : "Please specify the organization you are requesting on behalf of."}
              </label>
              <TextField
                required={!isViewMode}
                disabled={isViewMode}
                id="organization-other"
                name="organizationOther"
                variant="outlined"
                fullWidth
                size="small"
                className="form-request-details__organization-other"
                value={data.organizationOther}
                onChange={
                  isViewMode ? undefined : handleOrganizationOtherChange
                }
              />
            </>
          )}
          <div className="form-request-details__poc-details">
            <div className="form-request-details__poc-detail-item">
              <label htmlFor="poc-name">Point of Contact Name</label>
              <TextField
                disabled={isViewMode}
                id="poc-name"
                name="pocName"
                variant="outlined"
                size="small"
                value={data.pocName}
                onChange={isViewMode ? undefined : handleFieldChange("pocName")}
              />
            </div>
            <div className="form-request-details__poc-detail-item">
              <label htmlFor="poc-phone">Phone Number</label>
              <TextField
                disabled={isViewMode}
                id="poc-phone"
                name="pocPhone"
                variant="outlined"
                type="tel"
                size="small"
                value={data.pocPhone}
                onChange={
                  isViewMode ? undefined : handleFieldChange("pocPhone")
                }
              />
            </div>
            <div className="form-request-details__poc-detail-item">
              <label htmlFor="poc-email">Email Address</label>
              <TextField
                disabled={isViewMode}
                id="poc-email"
                name="pocEmail"
                variant="outlined"
                type="email"
                size="small"
                value={data.pocEmail}
                onChange={
                  isViewMode ? undefined : handleFieldChange("pocEmail")
                }
              />
            </div>
          </div>
          <label htmlFor="use-case-description">Use Case Description</label>
          <TextField
            disabled={isViewMode}
            multiline
            id="use-case-description"
            name="useCaseDescription"
            variant="outlined"
            fullWidth
            size="small"
            value={data.useCaseDescription}
            onChange={
              isViewMode ? undefined : handleFieldChange("useCaseDescription")
            }
            minRows={6}
          />
        </AccordionDetails>
      </Accordion>
    </div>
  );
};
