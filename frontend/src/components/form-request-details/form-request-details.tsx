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
  useSubmissionAttempts,
  useValidationErrors,
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

  const { hasAttemptedSubmission } = useSubmissionAttempts();

  const { updateValidationErrors } = useValidationErrors();

  // Validation state for phone and email
  const [phoneError, setPhoneError] = React.useState<string>("");
  const [emailError, setEmailError] = React.useState<string>("");

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

  // Validation functions
  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone) {
      setPhoneError("");
      updateValidationErrors({ phoneError: "" });
      return true; // Empty is valid (field is optional)
    }

    // Phone number regex: supports various formats
    // Examples: (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890, +1 123 456 7890
    const phoneRegex =
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;

    if (!phoneRegex.test(phone)) {
      const errorMsg = "Please enter a valid phone number";
      setPhoneError(errorMsg);
      updateValidationErrors({ phoneError: errorMsg });
      return false;
    }

    setPhoneError("");
    updateValidationErrors({ phoneError: "" });
    return true;
  };

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailError("");
      updateValidationErrors({ emailError: "" });
      return true; // Empty is valid (field is optional)
    }

    // Email regex: ReDoS-safe email validation using atomic grouping via possessive quantifiers
    // Uses character classes with specific length limits to prevent catastrophic backtracking
    const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{1,63}$/;

    if (!emailRegex.test(email)) {
      const errorMsg = "Please enter a valid email address";
      setEmailError(errorMsg);
      updateValidationErrors({ emailError: errorMsg });
      return false;
    }

    setEmailError("");
    updateValidationErrors({ emailError: "" });
    return true;
  };

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
      const value = e.target.value;
      const update: Record<string, string> = { [fieldName]: value };
      updateRequestDetails(update);

      // Clear error when user is typing (don't validate on every keystroke)
      if (fieldName === "pocPhone" && phoneError) {
        setPhoneError("");
        updateValidationErrors({ phoneError: "" });
      } else if (fieldName === "pocEmail" && emailError) {
        setEmailError("");
        updateValidationErrors({ emailError: "" });
      }
    };

  // Handle blur events for validation
  const handlePhoneBlur = () => {
    validatePhoneNumber(data.pocPhone);
  };

  const handleEmailBlur = () => {
    validateEmail(data.pocEmail);
  };

  return (
    <div className="form-request-details__container">
      {/* Display warning if organization is not selected - only in edit mode */}
      {!isViewMode && data.organization === "" && (
        <Alert severity="warning">
          Please select an organization that this request is on behalf of
        </Alert>
      )}
      {/* Display warning if "Other" is selected but no organization input - only in edit mode and after submission attempt */}
      {!isViewMode &&
        data.organization === "Other" &&
        data.organizationOther === "" &&
        hasAttemptedSubmission && (
          <Alert severity="warning">
            Please specify the organization you are requesting on behalf of
          </Alert>
        )}
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="request-details-content"
          id="request-details-header"
          component="h2"
        >
          <span>Request Details</span>
        </AccordionSummary>
        <AccordionDetails
          className={`form-request-details__accordion-details ${
            isViewMode ? "view-mode" : "edit-mode"
          }`}
        >
          {isViewMode ? (
            <>
              <div>
                <label>Organization</label>
                <p>{data.organization || "N/A"}</p>
              </div>
              {data.organization === "Other" && data.organizationOther && (
                <div>
                  <label>Other Organization</label>
                  <p>{data.organizationOther}</p>
                </div>
              )}
              <div>
                <label>Point of Contact Name</label>
                <p>{data.pocName || "N/A"}</p>
              </div>
              <div>
                <label>Phone Number</label>
                <p>{data.pocPhone || "N/A"}</p>
              </div>
              <div>
                <label>Email Address</label>
                <p>{data.pocEmail || "N/A"}</p>
              </div>
              <div>
                <label>Use Case Description</label>
                <p>{data.useCaseDescription || "N/A"}</p>
              </div>
            </>
          ) : (
            <>
              <FormControl
                fullWidth
                className="form-request-details__organization"
              >
                <label id="organization-label">
                  Organization<span>*</span>
                </label>
                <p>Select the organization that this request is on behalf of</p>
                <Select
                  displayEmpty
                  required
                  id="organization-select"
                  name="organization"
                  size="small"
                  value={data.organization}
                  onChange={handleOrganizationChange}
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
                    Please specify the organization you are requesting on behalf
                    of
                    <span style={{ color: "red", paddingLeft: "2px" }}>*</span>
                  </label>
                  <TextField
                    required
                    id="organization-other"
                    name="organizationOther"
                    variant="outlined"
                    fullWidth
                    size="small"
                    className="form-request-details__organization-other"
                    value={data.organizationOther}
                    error={
                      data.organization === "Other" &&
                      data.organizationOther === "" &&
                      hasAttemptedSubmission
                    }
                    helperText={
                      data.organization === "Other" &&
                      data.organizationOther === "" &&
                      hasAttemptedSubmission
                        ? "This field is required when 'Other' is selected"
                        : ""
                    }
                    onChange={handleOrganizationOtherChange}
                  />
                </>
              )}
              <div className="form-request-details__poc-details">
                <div className="form-request-details__poc-detail-item">
                  <label htmlFor="poc-name">Point of Contact Name</label>
                  <TextField
                    id="poc-name"
                    name="pocName"
                    variant="outlined"
                    size="small"
                    value={data.pocName}
                    onChange={handleFieldChange("pocName")}
                  />
                </div>
                <div className="form-request-details__poc-detail-item">
                  <label htmlFor="poc-phone">Phone Number</label>
                  <TextField
                    id="poc-phone"
                    name="pocPhone"
                    variant="outlined"
                    type="tel"
                    size="small"
                    value={data.pocPhone}
                    error={!!phoneError}
                    helperText={phoneError}
                    onChange={handleFieldChange("pocPhone")}
                    onBlur={handlePhoneBlur}
                  />
                </div>
                <div className="form-request-details__poc-detail-item">
                  <label htmlFor="poc-email">Email Address</label>
                  <TextField
                    id="poc-email"
                    name="pocEmail"
                    variant="outlined"
                    type="email"
                    size="small"
                    value={data.pocEmail}
                    error={!!emailError}
                    helperText={emailError}
                    onChange={handleFieldChange("pocEmail")}
                    onBlur={handleEmailBlur}
                  />
                </div>
              </div>
              <label htmlFor="use-case-description">Use Case Description</label>
              <TextField
                multiline
                id="use-case-description"
                name="useCaseDescription"
                variant="outlined"
                fullWidth
                size="small"
                value={data.useCaseDescription}
                onChange={handleFieldChange("useCaseDescription")}
                minRows={6}
              />
            </>
          )}
        </AccordionDetails>
      </Accordion>
    </div>
  );
};
