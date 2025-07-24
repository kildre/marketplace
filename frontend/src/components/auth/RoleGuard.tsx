import React, { ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import { AppRoles, Resources, Actions } from "../../types/auth";

interface RoleGuardProps {
  children: ReactNode;
  roles?: AppRoles[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user roles
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles = [],
  requireAll = false,
  fallback = null,
}) => {
  const { hasAnyRole, hasAllRoles, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (roles.length === 0) {
    return <>{children}</>;
  }

  const hasAccess = requireAll ? hasAllRoles(roles) : hasAnyRole(roles);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

interface PermissionGuardProps {
  children: ReactNode;
  resource: Resources;
  action: Actions;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  resource,
  action,
  fallback = null,
}) => {
  const { hasPermission, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  const hasAccess = hasPermission(resource, action);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

interface RequestorOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that only renders children for requestor users
 */
export const RequestorOnly: React.FC<RequestorOnlyProps> = ({
  children,
  fallback = null,
}) => {
  return (
    <RoleGuard roles={[AppRoles.REQUESTOR]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
};

interface ApproverOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that only renders children for approver users
 */
export const ApproverOnly: React.FC<ApproverOnlyProps> = ({
  children,
  fallback = null,
}) => {
  return (
    <RoleGuard roles={[AppRoles.APPROVER]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
};
