import { AppRoles } from "../types/auth";

// Type definitions for Keycloak token structure
interface KeycloakTokenParsed {
  sub?: string;
  preferred_username?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  exp?: number;
  realm_access?: {
    roles: string[];
  };
  resource_access?: Record<string, {
    roles: string[];
  }>;
}

interface UserInfo {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: AppRoles[];
  keycloakRoles: string[];
  tokenExpiry?: number;
}

/**
 * Authentication service for token management and role mapping
 */
export class AuthService {
  private static readonly TOKEN_KEY = "marketplace_auth_token";
  private static readonly REFRESH_TOKEN_KEY = "marketplace_refresh_token";
  private static readonly USER_INFO_KEY = "marketplace_user_info";

  /**
   * Check if we're in a browser environment
   */
  private static get hasLocalStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  /**
   * Safe localStorage wrapper
   */
  private static getStorage() {
    return this.hasLocalStorage ? window.localStorage : null;
  }

  /**
   * Map Keycloak roles to application roles
   */
  static mapKeycloakRolesToAppRoles(keycloakRoles: string[]): AppRoles[] {
    const roleMapping: Record<string, AppRoles> = {
      "marketplace-approver": AppRoles.APPROVER,
      "marketplace-requestor": AppRoles.REQUESTOR,
      // Legacy mappings for backwards compatibility
      "APPROVER": AppRoles.APPROVER,
      "REQUESTOR": AppRoles.REQUESTOR,
    };

    return keycloakRoles
      .map((role) => roleMapping[role])
      .filter((role): role is AppRoles => role !== undefined);
  }

  /**
   * Extract roles from Keycloak token
   */
  static extractRolesFromToken(tokenParsed: KeycloakTokenParsed): string[] {
    const roles: string[] = [];

    // Extract realm roles
    if (tokenParsed.realm_access?.roles) {
      roles.push(...tokenParsed.realm_access.roles);
    }

    // Extract resource/client roles
    if (tokenParsed.resource_access) {
      Object.values(tokenParsed.resource_access).forEach((resource) => {
        if (resource.roles) {
          roles.push(...resource.roles);
        }
      });
    }

    return roles;
  }

  /**
   * Store authentication tokens securely
   */
  static storeTokens(token: string, refreshToken?: string): void {
    const storage = this.getStorage();
    if (!storage) return;

    try {
      storage.setItem(this.TOKEN_KEY, token);
      if (refreshToken) {
        storage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to store authentication tokens:", error);
    }
  }

  /**
   * Get stored authentication token
   */
  static getStoredToken(): string | null {
    const storage = this.getStorage();
    if (!storage) return null;

    try {
      return storage.getItem(this.TOKEN_KEY);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to retrieve authentication token:", error);
      return null;
    }
  }

  /**
   * Get stored refresh token
   */
  static getStoredRefreshToken(): string | null {
    const storage = this.getStorage();
    if (!storage) return null;

    try {
      return storage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to retrieve refresh token:", error);
      return null;
    }
  }

  /**
   * Store user information
   */
  static storeUserInfo(userInfo: UserInfo): void {
    const storage = this.getStorage();
    if (!storage) return;

    try {
      storage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to store user information:", error);
    }
  }

  /**
   * Get stored user information
   */
  static getStoredUserInfo(): UserInfo | null {
    const storage = this.getStorage();
    if (!storage) return null;

    try {
      const userInfoStr = storage.getItem(this.USER_INFO_KEY);
      return userInfoStr ? JSON.parse(userInfoStr) as UserInfo : null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to retrieve user information:", error);
      return null;
    }
  }

  /**
   * Clear all stored authentication data
   */
  static clearStoredAuth(): void {
    const storage = this.getStorage();
    if (!storage) return;

    try {
      storage.removeItem(this.TOKEN_KEY);
      storage.removeItem(this.REFRESH_TOKEN_KEY);
      storage.removeItem(this.USER_INFO_KEY);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to clear authentication data:", error);
    }
  }

  /**
   * Check if token is expired (basic check)
   */
  static isTokenExpired(tokenParsed: KeycloakTokenParsed): boolean {
    if (!tokenParsed || !tokenParsed.exp) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    const expiration = tokenParsed.exp;
    const buffer = 30; // 30 seconds buffer

    return now >= expiration - buffer;
  }

  /**
   * Parse JWT token (basic parsing without verification)
   */
  static parseJwtToken(token: string): KeycloakTokenParsed | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join('')
      );
      return JSON.parse(jsonPayload) as KeycloakTokenParsed;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to parse JWT token:", error);
      return null;
    }
  }

  /**
   * Create user info object from token
   */
  static createUserInfoFromToken(tokenParsed: KeycloakTokenParsed): UserInfo {
    const keycloakRoles = this.extractRolesFromToken(tokenParsed);
    const appRoles = this.mapKeycloakRolesToAppRoles(keycloakRoles);

    const userInfo: UserInfo = {
      id: tokenParsed.sub || "unknown",
      username: tokenParsed.preferred_username || tokenParsed.name || "unknown",
      email: tokenParsed.email || "",
      firstName: tokenParsed.given_name || "",
      lastName: tokenParsed.family_name || "",
      roles: appRoles,
      keycloakRoles,
      tokenExpiry: tokenParsed.exp,
    };

    return userInfo;
  }
}
