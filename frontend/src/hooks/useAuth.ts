import { useKeycloak } from "../hooks/useKeycloak";
import { AppRoles, ROLE_PERMISSIONS, Resources, Actions } from "../types/auth";
import { AuthService } from "../services/authService";

/**
 * Hook for role-based access control with enhanced authentication
 */
export const useAuth = () => {
  const { keycloak } = useKeycloak();

  /**
   * Check if user has a specific role (supports both app roles and Keycloak roles)
   */
  const hasRole = (role: AppRoles): boolean => {
    if (!keycloak.authenticated) return false;
    
    // Check against app roles first
    const userInfo = AuthService.getStoredUserInfo();
    if (userInfo?.roles.includes(role)) {
      return true;
    }

    // Fallback to Keycloak role checking
    const keycloakRoleMap = {
      [AppRoles.APPROVER]: ["marketplace-approver", "APPROVER"],
      [AppRoles.REQUESTOR]: ["marketplace-requestor", "REQUESTOR"],
    };

    const rolesToCheck = keycloakRoleMap[role] || [role];
    return rolesToCheck.some(r => 
      keycloak.hasRealmRole(r) || keycloak.hasResourceRole(r)
    );
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
   * Get all user roles (prioritizes stored user info, falls back to Keycloak)
   */
  const getUserRoles = (): AppRoles[] => {
    if (!keycloak.authenticated) return [];
    
    // Get from stored user info first
    const userInfo = AuthService.getStoredUserInfo();
    if (userInfo?.roles) {
      return userInfo.roles;
    }

    // Fallback to extracting from current token
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
