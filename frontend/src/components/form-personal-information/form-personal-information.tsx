import React from "react";
import { FormPersonalInformationProps } from "../../interfaces";

export const FormPersonalInformation = ({
  personalData,
}: FormPersonalInformationProps = {}): React.ReactElement => {
  // Use personalData if provided, otherwise use hardcoded values for backward compatibility
  const data = personalData || {
    name: "Joe Snuffy",
    email: "Joe.Snuffy.mil@army.mil",
    designation: "Military",
    agency: "III Corps",
  };

  return (
    <div className="form-personal-information__section">
      <h5>Personal Information</h5>
      <p>
        NAME:<span id="username">{data.name}</span>
      </p>
      <p>
        EMAIL:<span id="email">{data.email}</span>
      </p>
      <p>
        DESIGNATION:<span id="designation">{data.designation}</span>
      </p>
      <p>
        AGENCY:<span id="agency">{data.agency}</span>
      </p>
    </div>
  );
};
