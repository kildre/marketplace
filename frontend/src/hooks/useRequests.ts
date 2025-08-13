import { useMemo, useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { useRequestsRefresh } from "./useRequestsRefresh";

export const useRequests = (
  overrideUserId?: string,
  enabled: boolean = true
) => {
  const { isRequestor, isApprover, getUserInfo } = useAuth();
  const { subscribe } = useRequestsRefresh();
  const [allRequests, setAllRequests] = useState<
    Array<Record<string, unknown>>
  >([]);

  // Determine which user's requests to show
  const userId = useMemo(() => {
    // If overrideUserId is provided (from URL), use it regardless of auth status
    if (overrideUserId) {
      return overrideUserId;
    }

    // If user is an approver, they can see all requests or filter by specific user
    if (isApprover()) {
      return undefined; // undefined = all requests
    }

    // If user is a requestor, they can only see their own requests
    if (isRequestor()) {
      // We'll get the username when we actually need it in the fetch function
      return "current-user"; // Placeholder to indicate we want current user's requests
    }

    // Default fallback - show all requests
    return undefined;
  }, [overrideUserId, isApprover, isRequestor]); // Remove getUserInfo from dependencies

  // Fetch requests from API - memoized to prevent infinite loops
  const fetchRequests = useCallback(async () => {
    // Get fresh user info inside the function
    const currentUserInfo = getUserInfo();
    const currentIsApprover = isApprover();

    if (!currentUserInfo?.email) {
      setAllRequests([]);
      return;
    }

    try {
      let response;

      if (currentIsApprover) {
        // Approvers can see all requests, pass their email
        response = await window.fetch("/api/requests/viewAll", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userEmail: currentUserInfo.email,
          }),
        });
      } else {
        // Requestors see only their own requests
        response = await window.fetch("/api/requests/viewForRequestor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userEmail: currentUserInfo.email,
          }),
        });
      }

      if (response.ok) {
        const requestsData = await response.json();

        // Handle API response format: { requests: [...], errMsg: "..." }
        let dataToSet = [];
        if (requestsData && Array.isArray(requestsData.requests)) {
          dataToSet = requestsData.requests;
        } else if (Array.isArray(requestsData)) {
          dataToSet = requestsData;
        } else {
          dataToSet = [];
        }

        setAllRequests(dataToSet);
      } else {
        // Fallback to empty array if API fails
        setAllRequests([]);
      }
    } catch {
      // Fallback to empty array if API fails
      setAllRequests([]);
    }
  }, []); // No dependencies - get fresh values inside the function

  useEffect(() => {
    if (enabled) {
      fetchRequests();
    }
  }, [fetchRequests, enabled]);

  // Subscribe to global refresh events
  useEffect(() => {
    const unsubscribe = subscribe(() => {
      if (enabled) {
        fetchRequests();
      }
    });
    return unsubscribe;
  }, [subscribe, fetchRequests, enabled]);

  const requests = useMemo(() => {
    return allRequests;
  }, [allRequests]);

  const requestsCount = useMemo(() => {
    return requests.length;
  }, [requests]);

  const refetch = useCallback(async () => {
    if (enabled) {
      await fetchRequests();
    }
  }, [fetchRequests, enabled]);

  return {
    requestsCount,
    requests,
    userId, // Expose the actual userId being used for debugging
    refetch, // Expose refetch function for manual updates
  };
};
