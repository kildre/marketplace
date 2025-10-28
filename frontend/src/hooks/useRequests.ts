import { ApiService } from "@/services/apiService";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./useAuth";
import { useRequestsRefresh } from "./useRequestsRefresh";

export const useRequests = (
  overrideUserId?: string,
  enabled: boolean = false
) => {
  const { getUserInfo, isApprover, isRequestor } = useAuth();
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
      if (currentIsApprover) {
        // Approvers can see all requests
        const requestsData = await ApiService.getAllRequests(userInfo.email);
        
        // Handle API response format: { requests: [...], errMsg: "..." }
        let allRequestsResponse: unknown[] = [];
        if (requestsData && Array.isArray(requestsData.requests)) {
          allRequestsResponse = requestsData.requests;
        } else if (Array.isArray(requestsData)) {
          allRequestsResponse = requestsData;
        }

        setAllRequests(allRequestsResponse as Record<string, unknown>[]);
      } else if (currentIsRequestor) {
        // Requestors see only their own requests
        const requestsData = await ApiService.getRequestsForRequestor(
          actualUserId || userInfo.email
        );
        
        // Handle API response format: { requests: [...], errMsg: "..." }
        let allRequestsResponse: unknown[] = [];
        if (requestsData && Array.isArray(requestsData.requests)) {
          allRequestsResponse = requestsData.requests;
        } else if (Array.isArray(requestsData)) {
          allRequestsResponse = requestsData;
        }

        setAllRequests(allRequestsResponse as Record<string, unknown>[]);
      } else {
        setAllRequests([]);
        return;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching requests:", error);
      setAllRequests([]);
    }
  }, [actualUserId]); // Removed keycloak dependency since ApiService handles auth internally

  useEffect(() => {
    if (enabled) {
      fetchRequests();
    }
  }, [fetchRequests, enabled]); // Remove actualUserId - it's already in fetchRequests dependencies

  // Subscribe to global refresh events
  useEffect(() => {
    const unsubscribe = subscribe(() => {
      if (enabled) {
        fetchRequests();
      }
    });
    return unsubscribe;
  }, [subscribe, fetchRequests, enabled]); // Remove actualUserId - it's already in fetchRequests dependencies

  return {
    requestsCount: allRequests.length,
    requests: allRequests,
    userId: actualUserId, // Expose the actual userId being used for debugging
    refetch: fetchRequests,
  };
};
