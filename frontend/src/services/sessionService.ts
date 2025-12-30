import { getApiUrl } from "../utils/api-config";

/**
 * Session Service for managing backend session token storage
 * 
 * When USE_CLIENT_SESSION_STORAGE=true on backend, this service:
 * 1. Registers Keycloak tokens with backend and receives a session ID
 * 2. Uses session ID for subsequent API calls instead of JWT tokens
 * 3. Manages session lifecycle (status checks, expiration)
 */
export class SessionService {
  private static readonly SESSION_ID_KEY = "marketplace_session_id";
  private static readonly USE_SESSION_STORAGE_KEY = "marketplace_use_session_storage";
  private static readonly SESSION_DISABLED_KEY = "marketplace_session_disabled";

  /**
   * Check if we're in a browser environment
   */
  private static get hasLocalStorage(): boolean {
    return typeof window !== "undefined" && !!window.localStorage;
  }

  /**
   * Safe localStorage wrapper
   */
  private static getStorage() {
    return this.hasLocalStorage ? window.localStorage : null;
  }

  /**
   * Check if session storage is enabled
   * Can be controlled via environment variable or detected at runtime
   */
  static isSessionStorageEnabled(): boolean {
    const storage = this.getStorage();
    
    // Check if explicitly disabled (after initialization error)
    const isDisabled = storage?.getItem(this.SESSION_DISABLED_KEY) === "true";
    if (isDisabled) {
      return false;
    }
    
    // Check environment variable first
    const envEnabled = import.meta.env.VITE_USE_SESSION_STORAGE === "true";
    
    // Check stored preference (set after successful registration)
    const storedPreference = storage?.getItem(this.USE_SESSION_STORAGE_KEY);
    
    return envEnabled || storedPreference === "true";
  }

  /**
   * Enable session storage mode
   */
  static enableSessionStorage(): void {
    const storage = this.getStorage();
    if (storage) {
      storage.setItem(this.USE_SESSION_STORAGE_KEY, "true");
      storage.removeItem(this.SESSION_DISABLED_KEY);
    }
  }

  /**
   * Disable session storage mode
   */
  static disableSessionStorage(): void {
    const storage = this.getStorage();
    if (storage) {
      storage.removeItem(this.USE_SESSION_STORAGE_KEY);
      storage.removeItem(this.SESSION_ID_KEY);
      storage.setItem(this.SESSION_DISABLED_KEY, "true");
    }
  }

  /**
   * Generate a unique session ID (UUID v4)
   */
  private static generateSessionId(): string {
    // Use crypto.randomUUID if available (modern browsers)
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback for older browsers
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Register a new session with the backend
   * 
   * @param accessToken - Keycloak access token
   * @param refreshToken - Optional Keycloak refresh token
   * @returns Session ID to use for future requests
   */
  static async registerSession(
    accessToken: string,
    refreshToken?: string
  ): Promise<string> {
    const sessionId = this.generateSessionId();

    try {
      const response = await fetch(getApiUrl("/api/session/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          sessionId,
          refreshToken: refreshToken || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to register session: ${response.status} ${
            errorData.error || response.statusText
          }`
        );
      }

      const data = await response.json();
      
      if (data.stored) {
        // Store session ID for future use
        const storage = this.getStorage();
        if (storage) {
          storage.setItem(this.SESSION_ID_KEY, sessionId);
          this.enableSessionStorage();
        }
        
        // eslint-disable-next-line no-console
        console.log("[SessionService] Session registered successfully:", sessionId);
        return sessionId;
      } else {
        throw new Error("Session registration failed - not stored");
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[SessionService] Failed to register session:", error);
      throw error;
    }
  }

  /**
   * Get stored session ID
   */
  static getSessionId(): string | null {
    const storage = this.getStorage();
    if (!storage) return null;

    try {
      return storage.getItem(this.SESSION_ID_KEY);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[SessionService] Failed to retrieve session ID:", error);
      return null;
    }
  }

  /**
   * Check session status with backend
   * 
   * @param sessionId - Session ID to check
   * @returns Session status information
   */
  static async checkSessionStatus(sessionId: string): Promise<{
    exists: boolean;
    expired?: boolean;
    username?: string;
    roles?: string[];
  }> {
    try {
      const response = await fetch(getApiUrl(`/api/session/${sessionId}`), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { exists: false };
        }
        throw new Error(`Failed to check session: ${response.status}`);
      }

      const data = await response.json();
      return {
        exists: data.exists || false,
        expired: data.expired || false,
        username: data.username,
        roles: data.roles,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[SessionService] Failed to check session status:", error);
      return { exists: false };
    }
  }

  /**
   * Expire/delete session on backend
   * 
   * @param sessionId - Session ID to expire
   */
  static async expireSession(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(getApiUrl("/api/session/expire"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to expire session: ${response.status}`);
      }

      // Clear local session ID
      const storage = this.getStorage();
      if (storage) {
        storage.removeItem(this.SESSION_ID_KEY);
      }

      // eslint-disable-next-line no-console
      console.log("[SessionService] Session expired successfully:", sessionId);
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[SessionService] Failed to expire session:", error);
      return false;
    }
  }

  /**
   * Clear local session data (without calling backend)
   */
  static clearLocalSession(): void {
    const storage = this.getStorage();
    if (storage) {
      storage.removeItem(this.SESSION_ID_KEY);
    }
  }

  /**
   * Initialize session on login
   * Should be called after successful Keycloak authentication
   * 
   * @param accessToken - Keycloak access token
   * @param refreshToken - Optional Keycloak refresh token
   * @returns Session ID if session storage is enabled, null otherwise
   */
  static async initializeSession(
    accessToken: string,
    refreshToken?: string
  ): Promise<string | null> {
    // Only register session if enabled via environment variable
    const envEnabled = import.meta.env.VITE_USE_SESSION_STORAGE === "true";
    
    if (!envEnabled) {
      // eslint-disable-next-line no-console
      console.log("[SessionService] Session storage not enabled via VITE_USE_SESSION_STORAGE");
      return null;
    }

    try {
      const sessionId = await this.registerSession(accessToken, refreshToken);
      return sessionId;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[SessionService] Failed to initialize session, falling back to direct token mode:", error);
      // Fall back to direct token mode
      this.disableSessionStorage();
      return null;
    }
  }

  /**
   * Clean up session on logout
   */
  static async cleanup(): Promise<void> {
    const sessionId = this.getSessionId();
    
    if (sessionId) {
      // Try to expire session on backend
      await this.expireSession(sessionId);
    }
    
    // Clear local data
    this.clearLocalSession();
    this.disableSessionStorage();
  }
}
