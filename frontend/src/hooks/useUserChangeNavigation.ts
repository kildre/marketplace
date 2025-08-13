import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

/**
 * Hook to handle navigation when user changes in development mode
 */
export const useUserChangeNavigation = () => {
  const navigate = useNavigate();
  const { getUserInfo } = useAuth();
  const previousUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (import.meta.env.DEV) {
      const userInfo = getUserInfo();
      const currentUserKey = userInfo?.email || userInfo?.username;

      // Check if user has changed
      if (
        previousUserRef.current !== null &&
        previousUserRef.current !== currentUserKey
      ) {
        // Navigate to home page when user changes
        // eslint-disable-next-line no-console
        console.log(
          `🎭 User changed from "${previousUserRef.current}" to "${currentUserKey}", navigating to home page`
        );
        navigate("/", { replace: true });
      }

      // Update the previous user reference
      previousUserRef.current = currentUserKey;
    }
  }, [getUserInfo, navigate]);

  return null; // This hook doesn't return anything, it just handles navigation
};
