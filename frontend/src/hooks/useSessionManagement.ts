import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { SessionService } from "../services/sessionService";
import { clearCart } from "../store/cartSlice";
import { useKeycloak } from "./useKeycloak";

/**
 * Hook for managing backend session registration and validation
 * Handles the complete session lifecycle according to acceptance criteria
 */
export const useSessionManagement = () => {
  const { keycloak } = useKeycloak();
  const dispatch = useDispatch();
  const [isSessionRegistered, setIsSessionRegistered] = useState(false);
  const [isSessionValidating, setIsSessionValidating] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const registrationAttemptedRef = useRef(false);

  /**
   * Register session with backend after successful Keycloak authentication
   * Scenario 1: Successful session registration and use
   */
  const registerSession = useCallback(async () => {
    // Skip session registration in bypass auth mode (development)
    const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === "true";
    if (bypassAuth) {
      // eslint-disable-next-line no-console
      console.log(
        "⚠️  BYPASS AUTH MODE: Skipping session registration (development only)"
      );
      setIsSessionRegistered(false); // Don't use sessionId in bypass mode
      return;
    }

    // Only register if authenticated and not already registered
    if (!keycloak.authenticated || !keycloak.token) {
      return;
    }

    // Prevent duplicate registration attempts
    if (registrationAttemptedRef.current) {
      return;
    }

    // Check if we already have a valid session
    const existingSessionId = SessionService.getStoredSessionId();
    if (existingSessionId && SessionService.wasRecentlyValidated()) {
      setIsSessionRegistered(true);
      return;
    }

    try {
      registrationAttemptedRef.current = true;
      setSessionError(null);

      // eslint-disable-next-line no-console
      console.log("Registering session with backend...");
      // eslint-disable-next-line no-console
      console.log("Keycloak token available:", !!keycloak.token);
      // eslint-disable-next-line no-console
      console.log("Keycloak token length:", keycloak.token?.length || 0);

      // Call backend to register session with Keycloak access token
      const response = await SessionService.registerSession(
        keycloak.token!,
        keycloak.refreshToken
      );

      if (response.stored) {
        setIsSessionRegistered(true);
        // eslint-disable-next-line no-console
        console.log(
          "✅ SESSION REGISTERED SUCCESSFULLY",
          "\n  sessionId:", response.sessionId,
          "\n  Backend verified token and stored session",
          "\n  Stored in localStorage: marketplace_session_id"
        );
      } else {
        throw new Error("Session registration failed - not stored");
      }
    } catch (error) {
      // Scenario 3: Backend session registration failure
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setSessionError(errorMessage);
      // eslint-disable-next-line no-console
      console.error("Failed to register session:", error);

      // Clear any stored session ID since registration failed
      SessionService.clearStoredSessionId();
      setIsSessionRegistered(false);

      // Show user-friendly error message
      // In a real app, you might want to show a toast notification here
    }
  }, [keycloak.authenticated, keycloak.token, keycloak.refreshToken]);

  /**
   * Validate stored session on app load/refresh
   * Scenario 2: Invalid or expired sessionId on app load
   */
  const validateStoredSession = useCallback(async () => {
    const storedSessionId = SessionService.getStoredSessionId();

    // No stored session to validate
    if (!storedSessionId) {
      setIsSessionRegistered(false);
      return;
    }

    // Skip validation if recently validated
    if (SessionService.wasRecentlyValidated()) {
      setIsSessionRegistered(true);
      return;
    }

    try {
      setIsSessionValidating(true);
      setSessionError(null);

      // eslint-disable-next-line no-console
      console.log("Validating stored session...");

      const isValid = await SessionService.validateSession(storedSessionId);

      if (isValid) {
        setIsSessionRegistered(true);
        // eslint-disable-next-line no-console
        console.log("Session is valid");
      } else {
        // Session is expired or invalid
        // eslint-disable-next-line no-console
        console.warn("Session expired or invalid - clearing stored session");

        SessionService.handleExpiredSession();
        setIsSessionRegistered(false);

        // Trigger Keycloak re-authentication
        if (keycloak.authenticated) {
          // If still authenticated with Keycloak, register a new session
          registrationAttemptedRef.current = false;
          await registerSession();
        } else {
          // If not authenticated, trigger login
          await keycloak.login();
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Session validation failed:", error);
      SessionService.clearStoredSessionId();
      setIsSessionRegistered(false);
    } finally {
      setIsSessionValidating(false);
    }
  }, [keycloak, registerSession]);

  /**
   * Handle logout - clear session and tokens
   * STIG V-222578: Destroy session ID and application session data on logoff
   */
  const handleLogout = useCallback(async () => {
    try {
      const sessionId = SessionService.getStoredSessionId();

      // Expire session on backend if we have one
      if (sessionId) {
        try {
          await SessionService.expireSession(sessionId);
          // eslint-disable-next-line no-console
          console.log("Session expired on backend");
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Failed to expire session on backend:", error);
          // Continue with logout even if backend call fails
        }
      }

      // Clear stored session
      SessionService.clearStoredSessionId();
      
      // STIG V-222578 Compliance: Clear cart data on logout
      // Cart is considered application session data and must be destroyed
      dispatch(clearCart());
      
      setIsSessionRegistered(false);
      setSessionError(null);
      registrationAttemptedRef.current = false;

      // Logout from Keycloak
      await keycloak.logout();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Logout failed:", error);
    }
  }, [keycloak, dispatch]);

  /**
   * Effect: Register session when Keycloak authentication succeeds
   */
  useEffect(() => {
    if (keycloak.authenticated && keycloak.token && !isSessionRegistered) {
      registerSession();
    }
  }, [keycloak.authenticated, keycloak.token, isSessionRegistered, registerSession]);

  /**
   * Effect: Validate session on component mount (page load/refresh)
   */
  useEffect(() => {
    // Only validate if we have a stored session but it's not registered yet
    const storedSessionId = SessionService.getStoredSessionId();
    if (storedSessionId && !isSessionRegistered && !isSessionValidating) {
      validateStoredSession();
    }
  }, [isSessionRegistered, isSessionValidating, validateStoredSession]);

  return {
    isSessionRegistered,
    isSessionValidating,
    sessionError,
    registerSession,
    validateStoredSession,
    handleLogout,
    sessionId: SessionService.getStoredSessionId(),
  };
};
