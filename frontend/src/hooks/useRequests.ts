import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { mockRequestData } from '../data/mock-requestData';

export const useRequests = (overrideUserId?: string) => {
  const { isRequestor, isApprover, getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  
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
  
  const requests = useMemo(() => {
    // If no userId, show all requests
    if (!userId) {
      return mockRequestData;
    }
    
    // Filter by extracting user ID from email (before @)
    return mockRequestData.filter(request => {
      const emailUserId = request.personalData.email.split('@')[0];
      return emailUserId.toLowerCase() === userId.toLowerCase();
    });
  }, [userId]);

  const requestsCount = useMemo(() => {
    return requests.length;
  }, [requests]);

  return {
    requestsCount,
    requests,
    userId, // Expose the actual userId being used for debugging
  };
};
