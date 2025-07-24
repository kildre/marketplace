import { useKeycloak } from "../hooks/useKeycloak";
import { AppRoles, ROLE_PERMISSIONS, Resources, Actions } from "../types/auth";

/**
 * Hook for role-based access control
 */
export const useAuth = () => {
  const { keycloak } = useKeycloak();

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: AppRoles): boolean => {
    if (!keycloak.authenticated) return false;
    return keycloak.hasRealmRole(role) || keycloak.hasResourceRole(role);
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
   * Get all user roles
   */
  const getUserRoles = (): AppRoles[] => {
    if (!keycloak.authenticated) return [];
    return Object.values(AppRoles).filter((role) => hasRole(role));
  };

  /**
   * Get user information from token
   */
  const getUserInfo = () => {
    if (!keycloak.authenticated || !keycloak.tokenParsed) {
      return null;
    }

    const tokenParsed = keycloak.tokenParsed as Record<string, unknown>;

    return {
      id: (tokenParsed.sub as string) || "unknown",
      username: keycloak.tokenParsed.preferred_username,
      email: keycloak.tokenParsed.email,
      firstName: keycloak.tokenParsed.given_name,
      lastName: keycloak.tokenParsed.family_name,
      roles: getUserRoles(),
    };
  };

  /**
   * Check if user is requestor
   */
  const isRequestor = (): boolean => hasRole(AppRoles.REQUESTOR);

  /**
   * Check if user is approver
   */
  const isApprover = (): boolean => hasRole(AppRoles.APPROVER);

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
