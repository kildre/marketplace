// @src/hooks/useRequestsData.ts

import { useState, useEffect } from "react";
import { mockRequestData } from "../data/mock-requestData";
import { RequestData } from "../interfaces/interfaceStore";
import { ApiService, UseCaseRequestApiDto } from "../services/apiService";

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

// Transform backend API response to frontend RequestData format
const transformApiRequestToRequestData = (
  apiRequest: UseCaseRequestApiDto
): RequestData => {
  return {
    requestId: apiRequest.requestNumber,
    ticketNumber: apiRequest.requestNumber,
    personalData: {
      name: apiRequest.pointOfContact,
      email: apiRequest.requestorEmail,
      designation: apiRequest.designation,
      agency: apiRequest.agency,
    },
    requestDetails: {
      organization: apiRequest.organization,
      organizationOther: apiRequest.otherOrganization,
      pocName: apiRequest.pointOfContact,
      pocPhone: apiRequest.phoneNumber,
      pocEmail: apiRequest.email,
      useCaseDescription: apiRequest.description,
    },
    cartItems: [], // TODO: Populate from cart items API
    summary: {
      totalItems: 0,
      totalQuantity: 0,
      pendingPriceItems: 0,
      estimatedROM: "",
    },
    submittedAt: apiRequest.createdAt,
    status:
      apiRequest.statusId === 1
        ? "PENDING"
        : apiRequest.statusId === 2
        ? "APPROVED"
        : "REJECTED",
    statusReason: "",
  };
};

// API functions that fallback to mock data
const getAllRequests = async (): Promise<RequestData[]> => {
  try {
    // TODO: Get current user email from auth context
    const userEmail = "admin@example.com"; // Placeholder
    const response = await ApiService.getAllRequests(userEmail);
    return response.requests?.map(transformApiRequestToRequestData) || [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to fetch all requests, using mock data:", error);
    return mockRequestData;
  }
};

const getRequestsByUserId = async (userId: string): Promise<RequestData[]> => {
  try {
    // Convert userId to email format for API
    const userEmail = `${userId}@example.com`; // This should come from auth context
    const response = await ApiService.getRequestsForRequestor(userEmail);
    return response.requests?.map(transformApiRequestToRequestData) || [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to fetch user requests, using mock data:", error);
    return mockRequestData.filter((request) => {
      const emailUserId = request.personalData.email.split("@")[0];
      return emailUserId.toLowerCase() === userId.toLowerCase();
    });
  }
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
