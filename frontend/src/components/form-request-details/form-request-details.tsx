import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

interface FormValues {
  organization: string;
  organizationOther: string;
  pocName?: string;
  pocPhone?: string;
  pocEmail?: string;
  useCaseDescription?: string;
}

interface FormRequestDetailsProps {
  formValues: FormValues;
  handleChange: (
    e:
      | React.ChangeEvent<{ name?: string; value: unknown }>
      | { target: { name?: string; value: unknown } }
  ) => void;
}

export const FormRequestDetails = ({
  formValues,
  handleChange,
}: FormRequestDetailsProps): React.ReactElement => {
  return (
    <div className="form-request-details__container">
      {/* Display warning if organization is not selected */}
      {formValues.organization === "" && (
        <Alert severity="warning">
          Please select an organization that this request is on behalf of.
        </Alert>
      )}
      {/* Display warning if "Other" is selected but no organization input */}
      {formValues.organization === "Other" &&
        formValues.organizationOther === "" && (
          <Alert severity="warning">
            Please specify the organization you are requesting on behalf of.
          </Alert>
        )}
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="request-details-content"
          id="request-details-header"
        >
          <span>Request Details</span>
        </AccordionSummary>
        <AccordionDetails className="form-request-details__accordion-details">
          <FormControl
            required
            fullWidth
            className="form-request-details__organization"
          >
            <label id="organization-label">
              Organization<span>*</span>
            </label>
            <p>Select the organization that this request is on behalf of.</p>
            <Select
              displayEmpty
              id="organization-select"
              name="organization"
              value={formValues.organization}
              onChange={handleChange}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <em>- Select -</em>;
                }

                return selected;
              }}
            >
              <MenuItem value={"Org 1"}>Org 1</MenuItem>
              <MenuItem value={"Org 2"}>Org 2</MenuItem>
              <MenuItem value={"Org 3"}>Org 3</MenuItem>
              <MenuItem value={"Other"}>Other</MenuItem>
            </Select>
          </FormControl>
          {formValues.organization === "Other" && (
            <>
              <label htmlFor="organization-other">
                Please specify the organization you are requesting on behalf of.
              </label>
              <TextField
                id="organization-other"
                name="organizationOther"
                variant="outlined"
                fullWidth
                className="form-request-details__organization-other"
                value={formValues.organizationOther}
                onChange={handleChange}
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
                fullWidth
                value={formValues.pocName}
                onChange={handleChange}
              />
            </div>
            <div className="form-request-details__poc-detail-item">
              <label htmlFor="poc-phone">Phone Number</label>
              <TextField
                id="poc-phone"
                name="pocPhone"
                variant="outlined"
                type="tel"
                fullWidth
                value={formValues.pocPhone}
                onChange={handleChange}
              />
            </div>
            <div className="form-request-details__poc-detail-item">
              <label htmlFor="poc-email">Email Address</label>
              <TextField
                id="poc-email"
                name="pocEmail"
                variant="outlined"
                type="email"
                fullWidth
                value={formValues.pocEmail}
                onChange={handleChange}
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
            value={formValues.useCaseDescription}
            onChange={handleChange}
            minRows={6}
          />
        </AccordionDetails>
      </Accordion>
    </div>
  );
};
