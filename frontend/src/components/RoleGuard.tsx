import React, { ReactNode } from 'react';
import { useMockKeycloak } from '../contexts/MockKeycloakProvider';
import { 
  hasMarketplaceRole, 
  isApprover, 
  isRequestor, 
  hasAnyRole, 
  hasAllRoles,
  MarketplaceRole 
} from '../utils/roleUtils';

interface RoleGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface SpecificRoleGuardProps extends RoleGuardProps {
  roles: MarketplaceRole[];
  requireAll?: boolean; // If true, user must have ALL roles. If false, user needs ANY role
}

// Component to conditionally render content for approvers only
export const ApproverOnly: React.FC<RoleGuardProps> = ({ children, fallback = null }) => {
  const { keycloak } = useMockKeycloak();
  const userIsApprover = isApprover(keycloak.tokenParsed);

  return userIsApprover ? <>{children}</> : <>{fallback}</>;
};

// Component to conditionally render content for requestors only
export const RequestorOnly: React.FC<RoleGuardProps> = ({ children, fallback = null }) => {
  const { keycloak } = useMockKeycloak();
  const userIsRequestor = isRequestor(keycloak.tokenParsed);

  return userIsRequestor ? <>{children}</> : <>{fallback}</>;
};

// Component to conditionally render content based on specific roles
export const RoleGuard: React.FC<SpecificRoleGuardProps> = ({ 
  children, 
  fallback = null, 
  roles, 
  requireAll = false 
}) => {
  const { keycloak } = useMockKeycloak();
  
  const hasRequiredRoles = requireAll 
    ? hasAllRoles(keycloak.tokenParsed, roles)
    : hasAnyRole(keycloak.tokenParsed, roles);

  return hasRequiredRoles ? <>{children}</> : <>{fallback}</>;
};

// Hook to get current user's role information
export const useUserRoles = () => {
  const { keycloak } = useMockKeycloak();
  
  return {
    isApprover: isApprover(keycloak.tokenParsed),
    isRequestor: isRequestor(keycloak.tokenParsed),
    hasRole: (role: MarketplaceRole) => hasMarketplaceRole(keycloak.tokenParsed, role),
    roles: keycloak.tokenParsed?.resource_access?.marketplace?.roles || [],
    tokenParsed: keycloak.tokenParsed,
  };
};
