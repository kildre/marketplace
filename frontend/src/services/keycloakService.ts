import Keycloak, { KeycloakConfig, KeycloakInitOptions } from "keycloak-js";
import { AuthService } from "./authService";

// Debug environment variables in development
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log('Keycloak Environment Variables:', {
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    bypassAuth: import.meta.env.VITE_BYPASS_AUTH
  });
}

const keycloakConfig: KeycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL, // e.g., https://keycloak.example.com/auth
  realm: import.meta.env.VITE_KEYCLOAK_REALM, // e.g., myrealm
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID, // e.g., react-app
};

// Validate required configuration
if (!keycloakConfig.url) {
  throw new Error(`Keycloak configuration missing 'url'. Check VITE_KEYCLOAK_URL environment variable. Current value: ${import.meta.env.VITE_KEYCLOAK_URL}`);
}

if (!keycloakConfig.realm) {
  throw new Error(`Keycloak configuration missing 'realm'. Check VITE_KEYCLOAK_REALM environment variable. Current value: ${import.meta.env.VITE_KEYCLOAK_REALM}`);
}

if (!keycloakConfig.clientId) {
  throw new Error(`Keycloak configuration missing 'clientId'. Check VITE_KEYCLOAK_CLIENT_ID environment variable. Current value: ${import.meta.env.VITE_KEYCLOAK_CLIENT_ID}`);
}

const keycloak = new Keycloak(keycloakConfig);

// Enhanced initialization options with token capture
export const keycloakInitOptions: KeycloakInitOptions = {
  onLoad: "login-required", // Forces login on app load
  checkLoginIframe: import.meta.env.VITE_KEYCLOAK_CHECK_LOGIN_IFRAME !== 'false',
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
      // eslint-disable-next-line no-console
      console.log('Keycloak authentication successful');
      this.handleTokenUpdate();
    };

    // Listen for token refresh
    this.keycloak.onAuthRefreshSuccess = () => {
      // eslint-disable-next-line no-console
      console.log('Keycloak token refreshed successfully');
      this.handleTokenUpdate();
    };

    // Listen for authentication errors
    this.keycloak.onAuthError = (error) => {
      // eslint-disable-next-line no-console
      console.error('Keycloak authentication error:', error);
      AuthService.clearStoredAuth();
    };

    // Listen for logout
    this.keycloak.onAuthLogout = () => {
      // eslint-disable-next-line no-console
      console.log('Keycloak logout detected');
      AuthService.clearStoredAuth();
      this.clearRefreshTimer();
    };

    // Listen for token expiration
    this.keycloak.onTokenExpired = () => {
      // eslint-disable-next-line no-console
      console.log('Keycloak token expired, attempting refresh');
      this.refreshToken();
    };
  }

  /**
   * Handle token updates (store tokens and user info)
   */
  private handleTokenUpdate(): void {
    if (this.keycloak.token && this.keycloak.tokenParsed) {
      // Log token information for debugging (production-safe)
      // eslint-disable-next-line no-console
      console.log('🔐 Keycloak JWT Token Captured:', {
        token: this.keycloak.token,
        tokenLength: this.keycloak.token.length,
        expiresIn: this.keycloak.tokenParsed.exp ? 
          new Date(this.keycloak.tokenParsed.exp * 1000).toISOString() : 'Unknown',
        user: this.keycloak.tokenParsed.preferred_username,
        email: this.keycloak.tokenParsed.email,
        roles: this.keycloak.tokenParsed.realm_access?.roles || []
      });

      // Store tokens
      AuthService.storeTokens(this.keycloak.token, this.keycloak.refreshToken);

      // Extract and store user information
      const userInfo = AuthService.createUserInfoFromToken(this.keycloak.tokenParsed);
      AuthService.storeUserInfo(userInfo);

      // Set up automatic token refresh
      this.setupTokenRefresh();

      // eslint-disable-next-line no-console
      console.log('User authenticated with roles:', userInfo.roles);
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
      console.error('Failed to refresh token:', error);
      AuthService.clearStoredAuth();
      return false;
    }
  }

  /**
   * Initialize Keycloak with enhanced token handling
   */
  async initialize(initOptions: KeycloakInitOptions = keycloakInitOptions): Promise<boolean> {
    try {
      const authenticated = await this.keycloak.init(initOptions);
      
      if (authenticated) {
        this.handleTokenUpdate();
      }

      return authenticated;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Keycloak initialization failed:', error);
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
      console.error('Keycloak login failed:', error);
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
      console.error('Keycloak logout failed:', error);
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
   * Check if user has specific roles
   */
  hasRoles(roles: string[]): boolean {
    return roles.some(role => 
      this.keycloak.hasRealmRole(role) || this.keycloak.hasResourceRole(role)
    );
  }
}

export default keycloak;
export { keycloak };
