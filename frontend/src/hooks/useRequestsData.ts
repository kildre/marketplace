// @src/hooks/useRequestsData.ts

import { useState, useEffect } from "react";
import { mockRequestData } from "../data/mock-requestData";
import { RequestData } from "../interfaces/interfaceStore";

interface UseRequestsDataResult {
  requests: RequestData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseRequestDataResult {
  request: RequestData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Simulate API functions for the new data structure
const getAllRequests = (): Promise<RequestData[]> => {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(mockRequestData);
    }, 100); // Simulate network delay
  });
};

const getRequestsByUserId = (userId: string): Promise<RequestData[]> => {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const userRequests = mockRequestData.filter((request) => {
        // Extract the user ID part from the email (before the @)
        const emailUserId = request.personalData.email.split("@")[0];
        return emailUserId.toLowerCase() === userId.toLowerCase();
      });
      resolve(userRequests);
    }, 100); // Simulate network delay
  });
};

const getRequestById = (requestId: string): Promise<RequestData | null> => {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const request = mockRequestData.find(
        (request) => request.requestId === requestId
      );
      resolve(request || null);
    }, 100); // Simulate network delay
  });
};

// Hook to get all requests or requests for a specific user
export const useRequestsData = (userId?: string): UseRequestsDataResult => {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      let requestsData: RequestData[];
      if (userId) {
        requestsData = await getRequestsByUserId(userId);
      } else {
        requestsData = await getAllRequests();
      }

      setRequests(requestsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [userId]);

  const refetch = async () => {
    await fetchRequests();
  };

  return {
    requests,
    loading,
    error,
    refetch,
  };
};

// Hook to get a single request by ID
export const useRequestData = (requestId: string): UseRequestDataResult => {
  const [request, setRequest] = useState<RequestData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      setError(null);

      const requestData = await getRequestById(requestId);
      setRequest(requestData);

      if (!requestData) {
        setError("Request not found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load request");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (requestId) {
      fetchRequest();
    }
  }, [requestId]);

  const refetch = async () => {
    await fetchRequest();
  };

  return {
    request,
    loading,
    error,
    refetch,
  };
};
