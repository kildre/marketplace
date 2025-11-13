import Keycloak, { KeycloakConfig, KeycloakInitOptions } from "keycloak-js";
import { AuthService } from "./authService";

// Debug environment variables in development - uncomment for debugging
// if (import.meta.env.DEV) {
// console.log('Keycloak Environment Variables:', {
//   url: import.meta.env.VITE_KEYCLOAK_URL,
//   realm: import.meta.env.VITE_KEYCLOAK_REALM,
//   clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
//   bypassAuth: import.meta.env.VITE_BYPASS_AUTH
// });
// }

const keycloakConfig: KeycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL, // e.g., https://keycloak.example.com/auth
  realm: import.meta.env.VITE_KEYCLOAK_REALM, // e.g., myrealm
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID, // e.g., react-app
};

// Helper function to validate required configuration field
function validateConfigField(
  value: string | undefined,
  fieldName: string,
  envVar: string
): void {
  if (!value) {
    throw new Error(
      `Keycloak configuration missing '${fieldName}'. Check ${envVar} environment variable. Current value: ${value}`
    );
  }
}

// Validate required configuration
validateConfigField(keycloakConfig.url, 'url', 'VITE_KEYCLOAK_URL');
validateConfigField(keycloakConfig.realm, 'realm', 'VITE_KEYCLOAK_REALM');
validateConfigField(keycloakConfig.clientId, 'clientId', 'VITE_KEYCLOAK_CLIENT_ID');

const keycloak = new Keycloak(keycloakConfig);

// Enhanced initialization options with token capture
export const keycloakInitOptions: KeycloakInitOptions = {
  onLoad: "login-required", // Forces login on app load
  checkLoginIframe:
    import.meta.env.VITE_KEYCLOAK_CHECK_LOGIN_IFRAME !== "false",
  pkceMethod: "S256", // Use PKCE for enhanced security
  // Additional security options
  scope: "openid profile email", // Request specific scopes
};

/**
 * Enhanced Keycloak service with token capture and storage
 */
export class KeycloakService {
  private static instance: KeycloakService | null = null;
  private keycloak: Keycloak.KeycloakInstance;
  private refreshTimer: number | null = null;

  private constructor() {
    this.keycloak = keycloak;
    this.setupEventListeners();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): KeycloakService {
    if (!KeycloakService.instance) {
      KeycloakService.instance = new KeycloakService();
    }
    return KeycloakService.instance;
  }

  /**
   * Get the Keycloak instance
   */
  getKeycloak(): Keycloak.KeycloakInstance {
    return this.keycloak;
  }

  /**
   * Setup event listeners for token management
   */
  private setupEventListeners(): void {
    // Listen for successful authentication
    this.keycloak.onAuthSuccess = () => {
      this.handleTokenUpdate();
    };

    // Listen for token refresh
    this.keycloak.onAuthRefreshSuccess = () => {
      this.handleTokenUpdate();
    };

    // Listen for authentication errors
    this.keycloak.onAuthError = (error) => {
      // eslint-disable-next-line no-console
      console.error("Keycloak authentication error:", error);
      AuthService.clearStoredAuth();
    };

    // Listen for logout
    this.keycloak.onAuthLogout = () => {
      AuthService.clearStoredAuth();
      this.clearRefreshTimer();
    };

    // Listen for token expiration
    this.keycloak.onTokenExpired = () => {
      this.refreshToken();
    };
  }

  /**
   * Handle token updates (store user info only, not tokens)
   */
  private handleTokenUpdate(): void {
    if (this.keycloak.token && this.keycloak.tokenParsed) {
      // SECURITY: Do NOT store tokens in localStorage
      // Keycloak manages tokens securely in memory
      
      // Extract and store only user information (no sensitive token data)
      const userInfo = AuthService.createUserInfoFromToken(
        this.keycloak.tokenParsed
      );
      AuthService.storeUserInfo(userInfo);

      // Set up automatic token refresh
      this.setupTokenRefresh();
    }
  }

  /**
   * Setup automatic token refresh
   */
  private setupTokenRefresh(): void {
    this.clearRefreshTimer();

    if (this.keycloak.tokenParsed?.exp) {
      const now = Math.floor(Date.now() / 1000);
      const expiration = this.keycloak.tokenParsed.exp;
      const refreshTime = (expiration - now - 30) * 1000; // Refresh 30 seconds before expiration

      if (refreshTime > 0) {
        this.refreshTimer = window.setTimeout(() => {
          this.refreshToken();
        }, refreshTime);
      }
    }
  }

  /**
   * Clear the refresh timer
   */
  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      window.clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Refresh the authentication token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const refreshed = await this.keycloak.updateToken(30);
      if (refreshed) {
        this.handleTokenUpdate();
        return true;
      }
      return false;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to refresh token:", error);
      AuthService.clearStoredAuth();
      return false;
    }
  }

  /**
   * Initialize Keycloak with enhanced token handling
   */
  async initialize(
    initOptions: KeycloakInitOptions = keycloakInitOptions
  ): Promise<boolean> {
    try {
      const authenticated = await this.keycloak.init(initOptions);

      if (authenticated) {
        this.handleTokenUpdate();
      }

      return authenticated;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Keycloak initialization failed:", error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(): Promise<void> {
    try {
      await this.keycloak.login();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Keycloak login failed:", error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      AuthService.clearStoredAuth();
      this.clearRefreshTimer();
      await this.keycloak.logout();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Keycloak logout failed:", error);
      throw error;
    }
  }

  /**
   * Get current user info
   */
  getCurrentUserInfo() {
    return AuthService.getStoredUserInfo();
  }

  /**
   * Check if user has specific roles (checks both realm and resource roles)
   */
  hasRoles(roles: string[]): boolean {
    return roles.some((role) => {
      // Check realm roles
      if (this.keycloak.hasRealmRole(role)) {
        return true;
      }

      // Check resource roles for marketplace
      if (this.keycloak.hasResourceRole(role, "marketplace")) {
        return true;
      }

      // Check other resource roles
      return this.keycloak.hasResourceRole(role);
    });
  }
}

export default keycloak;
export { keycloak };
