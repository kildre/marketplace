import { useMemo, useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { useRequestsRefresh } from "./useRequestsRefresh";
import { getApiUrl } from "@/utils/api-config";
import { useKeycloak } from "./useKeycloak";

export const useRequests = (
  overrideUserId?: string,
  enabled: boolean = false
) => {
  const { getUserInfo, isApprover, isRequestor } = useAuth();
  const { keycloak } = useKeycloak();
  const { subscribe } = useRequestsRefresh();
  const [allRequests, setAllRequests] = useState<Record<string, unknown>[]>([]);

  // Track user info changes to trigger re-renders in development mode
  const [userTracker, setUserTracker] = useState(0);
  const userInfo = getUserInfo();

  // Effect to poll for user changes in development mode
  useEffect(() => {
    if (import.meta.env.DEV) {
      const interval = window.setInterval(() => {
        const currentUserInfo = getUserInfo();
        // Compare user info and trigger refresh if changed
        if (
          currentUserInfo?.email !== userInfo?.email ||
          currentUserInfo?.username !== userInfo?.username
        ) {
          setUserTracker((prev) => prev + 1);
        }
      }, 1000); // Check every second

      return () => window.clearInterval(interval);
    }
  }, [getUserInfo, userInfo?.email, userInfo?.username]);

  // Determine actual user ID to use for API calls
  const actualUserId = useMemo(() => {
    // Get fresh user info to ensure we get the latest values
    const userInfo = getUserInfo();
    const currentIsApprover = isApprover();
    const currentIsRequestor = isRequestor();

    if (overrideUserId) {
      return overrideUserId;
    }

    if (currentIsRequestor && userInfo?.email) {
      return userInfo.email;
    }

    if (currentIsApprover && userInfo?.email) {
      return userInfo.email;
    }

    return undefined;
  }, [overrideUserId, isApprover, isRequestor, getUserInfo, userTracker]); // Include userTracker to make it reactive

  // Fetch requests from API - memoized to prevent infinite loops
  const fetchRequests = useCallback(async () => {
    // Get fresh auth info to ensure we have the latest values
    const userInfo = getUserInfo();
    const currentIsApprover = isApprover();
    const currentIsRequestor = isRequestor();

    if (!userInfo?.email) {
      setAllRequests([]);
      return;
    }

    try {
      let response;

      if (currentIsApprover) {
        // Approvers can see all requests
        // Refresh token before making API call to ensure it's valid
        try {
          await keycloak.updateToken(30); // Refresh if expires within 30 seconds
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("[useRequests] Failed to refresh token:", error);
          // Token refresh failed - user might need to re-authenticate
          setAllRequests([]);
          return;
        }
        
        // Get the fresh token from Keycloak (after potential refresh)
        const token = keycloak.token;
        
        if (!token) {
          // eslint-disable-next-line no-console
          console.error("[useRequests] No token available after refresh attempt");
          setAllRequests([]);
          return;
        }
        
        // eslint-disable-next-line no-console
        console.log('[useRequests] Making API call with valid token');
        
        response = await window.fetch(getApiUrl("/api/requests/viewAll"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            userEmail: userInfo.email,
          }),
        });
      } else if (currentIsRequestor) {
        // Requestors see only their own requests
        // Refresh token before making API call to ensure it's valid
        try {
          await keycloak.updateToken(30); // Refresh if expires within 30 seconds
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("[useRequests] Failed to refresh token:", error);
          // Token refresh failed - user might need to re-authenticate
          setAllRequests([]);
          return;
        }
        
        // Get the fresh token from Keycloak (after potential refresh)
        const token = keycloak.token;
        
        if (!token) {
          // eslint-disable-next-line no-console
          console.error("[useRequests] No token available after refresh attempt");
          setAllRequests([]);
          return;
        }
        
        // eslint-disable-next-line no-console
        console.log('[useRequests] Making API call with valid token');
        
        response = await window.fetch(
          getApiUrl("/api/requests/viewForRequestor"),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
              userEmail: actualUserId || userInfo.email, // Use actualUserId if available
            }),
          }
        );
      } else {
        setAllRequests([]);
        return;
      }

      if (response.ok) {
        try {
          const requestsData = await response.json();

          // Handle API response format: { requests: [...], errMsg: "..." }
          let apiRequests = [];
          if (requestsData && Array.isArray(requestsData.requests)) {
            apiRequests = requestsData.requests;
          } else if (Array.isArray(requestsData)) {
            apiRequests = requestsData;
          }

          setAllRequests(apiRequests);
        } catch (jsonError) {
          // eslint-disable-next-line no-console
          console.error("Failed to parse response as JSON:", jsonError);
          setAllRequests([]);
        }
      } else {
        // Handle error responses (403, 401, etc.)
        // eslint-disable-next-line no-console
        console.error(`API request failed with status ${response.status}: ${response.statusText}`);
        setAllRequests([]);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching requests:", error);
      setAllRequests([]);
    }
  }, [actualUserId, keycloak, getUserInfo, isApprover, isRequestor]); // Include all dependencies

  useEffect(() => {
    if (enabled) {
      fetchRequests();
    }
  }, [fetchRequests, enabled, actualUserId]); // Include actualUserId to refetch when user changes

  // Subscribe to global refresh events
  useEffect(() => {
    const unsubscribe = subscribe(() => {
      if (enabled) {
        fetchRequests();
      }
    });
    return unsubscribe;
  }, [subscribe, fetchRequests, enabled, actualUserId]); // Include actualUserId to refetch when user changes

  return {
    requestsCount: allRequests.length,
    requests: allRequests,
    userId: actualUserId, // Expose the actual userId being used for debugging
    refetch: fetchRequests,
  };
};
