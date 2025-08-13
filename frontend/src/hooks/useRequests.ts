import { useMemo, useState, useEffect } from "react";
import { useAuth } from "./useAuth";

export const useRequests = (overrideUserId?: string) => {
  const { isRequestor, isApprover, getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  const [allRequests, setAllRequests] = useState<
    Array<Record<string, unknown>>
  >([]);

  // Determine which user's requests to show
  const userId = useMemo(() => {
    // If overrideUserId is provided (from URL), use it regardless of auth status
    if (overrideUserId) {
      return overrideUserId;
    }

    // If no authentication is available, show all requests
    if (!userInfo) {
      return undefined; // Show all requests
    }

    // If user is an approver, they can see all requests or filter by specific user
    if (isApprover()) {
      return undefined; // undefined = all requests
    }

    // If user is a requestor, they can only see their own requests
    if (isRequestor()) {
      return userInfo?.username; // Always their own requests
    }

    // Default fallback - show all requests
    return undefined;
  }, [overrideUserId, isApprover, isRequestor, userInfo]);

  // Fetch requests from API (same logic as requests-table.tsx)
  useEffect(() => {
    const fetchRequests = async () => {
      if (!userInfo?.email) {
        setAllRequests([]);
        return;
      }

      try {
        let response;

        if (isApprover()) {
          // Approvers can see all requests, pass their email
          response = await window.fetch("/api/requests/viewAll", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userEmail: userInfo.email,
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
              userEmail: userInfo.email,
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
    };

    fetchRequests();
  }, [userInfo?.email, userInfo?.roles, isApprover]);

  const requests = useMemo(() => {
    return allRequests;
  }, [allRequests]);

  const requestsCount = useMemo(() => {
    return requests.length;
  }, [requests]);

  return {
    requestsCount,
    requests,
    userId, // Expose the actual userId being used for debugging
  };
};
