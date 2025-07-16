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

const organizationOptions = [
  { value: "AFRICOM", label: "AFRICOM" },
  { value: "Air Force", label: "Air Force" },
  { value: "Army", label: "Army" },
  { value: "CAPE", label: "CAPE" },
  { value: "CBDP", label: "CBDP" },
  { value: "CDAO", label: "CDAO" },
  { value: "CENTCOM", label: "CENTCOM" },
  { value: "CYBERCOM", label: "CYBERCOM" },
  { value: "DARPA", label: "DARPA" },
  { value: "DAU", label: "DAU" },
  { value: "DCAA", label: "DCAA" },
  { value: "DCMA", label: "DCMA" },
  { value: "DCSA", label: "DCSA" },
  { value: "DECA", label: "DECA" },
  { value: "DEHA", label: "DEHA" },
  { value: "DEMA", label: "DEMA" },
  { value: "DFAS", label: "DFAS" },
  { value: "DHA", label: "DHA" },
  { value: "DHP", label: "DHP" },
  { value: "DHRA", label: "DHRA" },
  { value: "DISA", label: "DISA" },
  { value: "DLA", label: "DLA" },
  { value: "DLSA", label: "DLSA" },
  { value: "DMA", label: "DMA" },
  { value: "DMDC", label: "DMDC" },
  { value: "DMEA", label: "DMEA" },
  { value: "DMPO", label: "DMPO" },
  { value: "DoDEA", label: "DoDEA" },
  { value: "DoDIG", label: "DoDIG" },
  { value: "DoT&E", label: "DoT&E" },
  { value: "DPAA", label: "DPAA" },
  { value: "DSCA", label: "DSCA" },
  { value: "DSS", label: "DSS" },
  { value: "DTIC", label: "DTIC" },
  { value: "DTRA", label: "DTRA" },
  { value: "DTRMC", label: "DTRMC" },
  { value: "DTSA", label: "DTSA" },
  { value: "EUCOM", label: "EUCOM" },
  { value: "INDOPACOM", label: "INDOPACOM" },
  { value: "JCS", label: "JCS" },
  { value: "MDA", label: "MDA" },
  { value: "Navy", label: "Navy" },
  { value: "NGA", label: "NGA" },
  { value: "NGB", label: "NGB" },
  { value: "NORTHCOM", label: "NORTHCOM" },
  { value: "NSA", label: "NSA" },
  { value: "OLDCC", label: "OLDCC" },
  { value: "OSD", label: "OSD" },
  { value: "PFPA", label: "PFPA" },
  { value: "SOCOM", label: "SOCOM" },
  { value: "SOUTHCOM", label: "SOUTHCOM" },
  { value: "Space Force", label: "Space Force" },
  { value: "SPACECOM", label: "SPACECOM" },
  { value: "STRATCOM", label: "STRATCOM" },
  { value: "TRANSCOM", label: "TRANSCOM" },
  { value: "USACE", label: "USACE" },
  { value: "USMC", label: "USMC" },
  { value: "USSOCOM", label: "USSOCOM" },
  { value: "WHS", label: "WHS" },
  { value: "Other", label: "Other" },
];

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
              size="small"
              value={formValues.organization}
              onChange={handleChange}
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
                size="small"
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
                size="small"
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
                size="small"
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
                size="small"
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
            size="small"
            value={formValues.useCaseDescription}
            onChange={handleChange}
            minRows={6}
          />
        </AccordionDetails>
      </Accordion>
    </div>
  );
};
