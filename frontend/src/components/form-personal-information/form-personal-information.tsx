import React from "react";
import { FormPersonalInformationProps } from "../../interfaces";
import { useAuth } from "../../hooks/useAuth";

export const FormPersonalInformation = ({
  personalData,
}: FormPersonalInformationProps = {}): React.ReactElement => {
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();

  // Use personalData if provided, otherwise use mock user information from auth
  const data = personalData || {
    name: userInfo
      ? `${userInfo.firstName} ${userInfo.lastName}`
      : "Unknown User",
    email: userInfo?.email || "unknown@example.com",
    designation: userInfo?.designation || "Unknown",
    agency: userInfo?.agency || "Unknown",
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
