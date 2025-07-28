import React, { createContext, useContext, useState, ReactNode } from "react";

interface OrganizationContextType {
  organization: string;
  organizationOther: string;
  setOrganization: (organization: string) => void;
  setOrganizationOther: (organizationOther: string) => void;
  resetOrganization: () => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }
  return context;
};

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({
  children,
}) => {
  const [organization, setOrganization] = useState<string>("");
  const [organizationOther, setOrganizationOther] = useState<string>("");

  const resetOrganization = () => {
    setOrganization("");
    setOrganizationOther("");
  };

  const value: OrganizationContextType = {
    organization,
    organizationOther,
    setOrganization,
    setOrganizationOther,
    resetOrganization,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};
