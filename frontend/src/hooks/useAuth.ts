import { useKeycloak } from "../hooks/useKeycloak";
import { AppRoles, ROLE_PERMISSIONS, Resources, Actions } from "../types/auth";
import { AuthService } from "../services/authService";
import { useMemo } from "react";

/**
 * Hook for role-based access control with enhanced authentication
 */
export const useAuth = () => {
  const { keycloak } = useKeycloak();

  // Memoize user info to prevent recalculation on every render
  const userInfo = useMemo(() => {
    // First try to get from stored user info (for production)
    const storedUserInfo = AuthService.getStoredUserInfo();
    if (storedUserInfo) {
      return {
        id: storedUserInfo.id,
        username: storedUserInfo.username,
        email: storedUserInfo.email,
        firstName: storedUserInfo.firstName,
        lastName: storedUserInfo.lastName,
        roles: storedUserInfo.roles,
        designation: storedUserInfo.designation,
        agency: storedUserInfo.agency,
      };
    }

    // Fallback to direct token parsing (for development)
    if (!keycloak.authenticated || !keycloak.tokenParsed) {
      return null;
    }

    const tokenParsed = keycloak.tokenParsed as Record<string, unknown>;
    const roles = Object.values(AppRoles).filter((role) => {
      // Simplified role check without excessive logging
      if (!keycloak.authenticated) return false;

      const userRoles = AuthService.getStoredUserInfo()?.roles || [];
      if (userRoles.includes(role)) return true;

      const keycloakRoleMap = {
        [AppRoles.APPROVER]: ["marketplace-approver", "APPROVER"],
        [AppRoles.REQUESTOR]: ["marketplace-requestor", "REQUESTOR"],
      };

      const rolesToCheck = keycloakRoleMap[role] || [role];
      return rolesToCheck.some(
        (r) => keycloak.hasRealmRole(r) || keycloak.hasResourceRole(r)
      );
    });

    return {
      id: (tokenParsed.sub as string) || "unknown",
      username: keycloak.tokenParsed.preferred_username,
      email: keycloak.tokenParsed.email,
      firstName: keycloak.tokenParsed.given_name,
      lastName: keycloak.tokenParsed.family_name,
      roles,
      designation: keycloak.tokenParsed.designation,
      agency: keycloak.tokenParsed.agency,
    };
  }, [keycloak.authenticated, keycloak.tokenParsed]);

  // Memoize role checks
  const roleChecks = useMemo(() => {
    const isRequestor = userInfo?.roles?.includes(AppRoles.REQUESTOR) || false;
    const isApprover = userInfo?.roles?.includes(AppRoles.APPROVER) || false;

    return {
      isRequestor,
      isApprover,
    };
  }, [userInfo?.roles]);

  /**
   * Check if user has a specific role (supports both app roles and Keycloak roles)
   */
  const hasRole = (role: AppRoles): boolean => {
    if (!keycloak.authenticated) {
      return false;
    }

    // Check against stored user info first (no logging in production)
    if (userInfo?.roles?.includes(role)) {
      return true;
    }

    // Fallback to Keycloak role checking
    const keycloakRoleMap = {
      [AppRoles.APPROVER]: ["marketplace-approver", "APPROVER"],
      [AppRoles.REQUESTOR]: ["marketplace-requestor", "REQUESTOR"],
    };

    const rolesToCheck = keycloakRoleMap[role] || [role];

    return rolesToCheck.some((r) => {
      return keycloak.hasRealmRole(r) || keycloak.hasResourceRole(r);
    });
  };

  /**
   * Get all mapped Keycloak roles as app roles
   */
  const getKeycloakRoles = (): string[] => {
    if (!keycloak.authenticated || !keycloak.tokenParsed) return [];

    return AuthService.extractRolesFromToken(keycloak.tokenParsed);
  };

  /**
   * Get app roles from Keycloak roles
   */
  const getAppRoles = (): AppRoles[] => {
    const keycloakRoles = getKeycloakRoles();
    return AuthService.mapKeycloakRolesToAppRoles(keycloakRoles);
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: AppRoles[]): boolean => {
    return roles.some((role) => hasRole(role));
  };

  /**
   * Check if user has all of the specified roles
   */
  const hasAllRoles = (roles: AppRoles[]): boolean => {
    return roles.every((role) => hasRole(role));
  };

  /**
   * Check if user has permission to perform an action on a resource
   */
  const hasPermission = (resource: Resources, action: Actions): boolean => {
    if (!keycloak.authenticated) return false;

    // Get user's roles
    const userRoles = Object.values(AppRoles).filter((role) => hasRole(role));

    // Check if any of the user's roles has the required permission
    return userRoles.some((role) => {
      const rolePermissions = ROLE_PERMISSIONS[role];
      return rolePermissions.some(
        (permission) =>
          permission.resource === resource &&
          permission.actions.includes(action)
      );
    });
  };

  /**
   * Get user information from token
   */
  const getUserInfo = () => userInfo;

  /**
   * Get all user roles
   */
  const getUserRoles = (): AppRoles[] => userInfo?.roles || [];

  /**
   * Check if user is requestor
   */
  const isRequestor = (): boolean => roleChecks.isRequestor;

  /**
   * Check if user is approver
   */
  const isApprover = (): boolean => roleChecks.isApprover;

  /**
   * Check if user can approve requests
   */
  const canApproveRequests = (): boolean =>
    hasPermission(Resources.APPROVALS, Actions.APPROVE);

  /**
   * Check if user can create requests
   */
  const canCreateRequests = (): boolean =>
    hasPermission(Resources.REQUESTS, Actions.CREATE);

  return {
    // Authentication status
    isAuthenticated: keycloak.authenticated,

    // User info
    getUserInfo,
    getUserRoles,
    getKeycloakRoles,
    getAppRoles,

    // Role checks
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isRequestor,
    isApprover,

    // Permission checks
    hasPermission,
    canApproveRequests,
    canCreateRequests,

    // Keycloak instance for advanced usage
    keycloak,
  };
};

export default useAuth;
