import { getApiUrl } from "../utils/api-config";

/**
 * Session registration and validation service for backend session management
 * Implements IL2/IL5-compliant session handling with Keycloak token registration
 */

export interface RegisterSessionRequest {
  sessionId: string;
  refreshToken?: string;
}

export interface RegisterSessionResponse {
  sessionId: string;
  stored: boolean;
}

export interface SessionStatusResponse {
  sessionId: string;
  token: string;
  refreshToken: string;
}

export interface ExpireSessionRequest {
  sessionId: string;
}

export interface ExpireSessionResponse {
  success: boolean;
  message: string;
}

/**
 * Session service for managing backend session registration and validation
 */
export class SessionService {
  private static readonly SESSION_ID_KEY = "marketplace_session_id";
  private static readonly SESSION_VALIDATED_KEY =
    "marketplace_session_validated";

  /**
   * Generate a unique session ID (UUID v4)
   */
  static generateSessionId(): string {
    return window.crypto.randomUUID();
  }

  /**
   * Register a new session with the backend using Keycloak access token
   *
   * @param accessToken - The Keycloak access token from authentication
   * @param refreshToken - Optional Keycloak refresh token
   * @returns Promise resolving to the registration response with sessionId
   * @throws Error if registration fails
   */
  static async registerSession(
    accessToken: string,
    refreshToken?: string
  ): Promise<RegisterSessionResponse> {
    try {
      // SECURITY: Only log token substring in development with debug flag
      if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_AUTH === "true") {
        // eslint-disable-next-line no-console
        console.log(
          "SessionService.registerSession called with token:",
          accessToken ? `${accessToken.substring(0, 20)}...` : "MISSING"
        );
      }

      if (!accessToken) {
        throw new Error("Access token is required for session registration");
      }

      const sessionId = this.generateSessionId();

      const requestBody: RegisterSessionRequest = {
        sessionId,
        refreshToken,
      };

      const response = await window.fetch(getApiUrl("/api/session/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = `Session registration failed: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Ignore JSON parse errors
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Store the sessionId on successful registration
      if (data.stored) {
        this.storeSessionId(data.sessionId);
        this.markSessionAsValidated();
      }

      return data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to register session with backend:", error);
      throw error;
    }
  }

  /**
   * Validate the stored session with the backend
   *
   * @param sessionId - The session ID to validate
   * @returns Promise resolving to true if session is valid, false otherwise
   */
  static async validateSession(sessionId: string): Promise<boolean> {
    try {
      const response = await window.fetch(
        getApiUrl(`/api/session/${sessionId}`),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 404) {
        // Session not found or expired
        return false;
      }

      if (!response.ok) {
        // Other errors indicate invalid session
        return false;
      }

      const data: SessionStatusResponse = await response.json();

      // Session is valid if we get a valid response with a token
      return !!data.token;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to validate session:", error);
      return false;
    }
  }

  /**
   * Expire/revoke a session with the backend
   *
   * @param sessionId - The session ID to expire
   * @returns Promise resolving to the expiration response
   */
  static async expireSession(
    sessionId: string
  ): Promise<ExpireSessionResponse> {
    try {
      const requestBody: ExpireSessionRequest = {
        sessionId,
      };

      const response = await window.fetch(getApiUrl("/api/session/expire"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = `Session expiration failed: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Ignore JSON parse errors
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to expire session:", error);
      throw error;
    }
  }

  /**
   * Store session ID in localStorage
   */
  static storeSessionId(sessionId: string): void {
    if (typeof window === "undefined" || !window.localStorage) return;

    try {
      window.localStorage.setItem(this.SESSION_ID_KEY, sessionId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to store session ID:", error);
    }
  }

  /**
   * Get stored session ID from localStorage
   */
  static getStoredSessionId(): string | null {
    if (typeof window === "undefined" || !window.localStorage) return null;

    try {
      return window.localStorage.getItem(this.SESSION_ID_KEY);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to retrieve session ID:", error);
      return null;
    }
  }

  /**
   * Clear stored session ID from localStorage
   */
  static clearStoredSessionId(): void {
    if (typeof window === "undefined" || !window.localStorage) return;

    try {
      window.localStorage.removeItem(this.SESSION_ID_KEY);
      window.localStorage.removeItem(this.SESSION_VALIDATED_KEY);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to clear session ID:", error);
    }
  }

  /**
   * Mark session as validated (to avoid re-validation on every page load)
   */
  private static markSessionAsValidated(): void {
    if (typeof window === "undefined" || !window.localStorage) return;

    try {
      window.localStorage.setItem(
        this.SESSION_VALIDATED_KEY,
        Date.now().toString()
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to mark session as validated:", error);
    }
  }

  /**
   * Check if session was validated recently (within the last 5 minutes)
   * This helps reduce unnecessary validation calls
   */
  static wasRecentlyValidated(): boolean {
    if (typeof window === "undefined" || !window.localStorage) return false;

    try {
      const validatedAt = window.localStorage.getItem(
        this.SESSION_VALIDATED_KEY
      );
      if (!validatedAt) return false;

      const validatedTime = parseInt(validatedAt, 10);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      return now - validatedTime < fiveMinutes;
    } catch {
      return false;
    }
  }

  /**
   * Handle session expiration - clear stored session and trigger re-authentication
   */
  static handleExpiredSession(): void {
    this.clearStoredSessionId();
    // eslint-disable-next-line no-console
    console.warn("Session expired. Please sign in again.");
  }
}
