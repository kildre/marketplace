// Utility functions for role-based access control

export const MARKETPLACE_ROLES = {
  REQUESTOR: "marketplace-requestor",
  APPROVER: "marketplace-approver",
} as const;

export type MarketplaceRole = typeof MARKETPLACE_ROLES[keyof typeof MARKETPLACE_ROLES];

// Type for Keycloak token structure
export interface KeycloakTokenParsed {
  preferred_username?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  resource_access?: {
    marketplace?: {
      roles: string[];
    };
    account?: {
      roles: string[];
    };
    [key: string]: {
      roles: string[];
    } | undefined;
  };
}

// Utility function to check if user has a specific marketplace role
export const hasMarketplaceRole = (
  tokenParsed: KeycloakTokenParsed | undefined,
  role: MarketplaceRole
): boolean => {
  const marketplaceRoles = tokenParsed?.resource_access?.marketplace?.roles || [];
  return marketplaceRoles.includes(role);
};

// Utility function to check if user is an approver
export const isApprover = (tokenParsed: KeycloakTokenParsed | undefined): boolean => {
  return hasMarketplaceRole(tokenParsed, MARKETPLACE_ROLES.APPROVER);
};

// Utility function to check if user is a requestor
export const isRequestor = (tokenParsed: KeycloakTokenParsed | undefined): boolean => {
  return hasMarketplaceRole(tokenParsed, MARKETPLACE_ROLES.REQUESTOR);
};

// Utility function to get all marketplace roles for a user
export const getMarketplaceRoles = (tokenParsed: KeycloakTokenParsed | undefined): string[] => {
  return tokenParsed?.resource_access?.marketplace?.roles || [];
};

// Utility function to check if user has any of the specified roles
export const hasAnyRole = (
  tokenParsed: KeycloakTokenParsed | undefined,
  roles: MarketplaceRole[]
): boolean => {
  return roles.some(role => hasMarketplaceRole(tokenParsed, role));
};

// Utility function to check if user has all of the specified roles
export const hasAllRoles = (
  tokenParsed: KeycloakTokenParsed | undefined,
  roles: MarketplaceRole[]
): boolean => {
  return roles.every(role => hasMarketplaceRole(tokenParsed, role));
};
