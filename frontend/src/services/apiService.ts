import { getEndpointUrl, isBypassAuth } from "../utils/api-config";

// Interface definitions for API requests and responses
export interface SubmitRequestApiRequest {
  requestNumber: string;
  requestorEmail: string;
  designation: string;
  agency: string;
  organization: string;
  otherOrganization: string;
  pointOfContact: string;
  email: string;
  phoneNumber: string;
  estimatedRom: string;
  requestedToolName: string;
  description: string;
  cartItems: CartItemApiDto[];
}

export interface CartItemApiDto {
  name: string;
  quantity: number;
}

export interface SubmitRequestApiResponse {
  requestNumber?: string;
  errMsg?: string;
}

export interface ViewRequestsApiRequest {
  userEmail: string;
}

export interface ViewRequestsApiResponse {
  requests?: UseCaseRequestApiDto[];
  errMsg?: string;
}

export interface ViewRequestByNumberApiRequest {
  userEmail: string;
  requestNumber: string;
}

export interface ViewRequestByNumberApiResponse {
  request?: UseCaseRequestApiDto;
  errMsg?: string;
}

export interface UseCaseRequestApiDto {
  requestNumber: string;
  statusId: number;
  requestorEmail: string;
  requestorUsername: string;
  designation: string;
  agency: string;
  organization: string;
  otherOrganization: string;
  pointOfContact: string;
  email: string;
  phoneNumber: string;
  requestedToolName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  cartItems: CartItemApiDto[];
}

/**
 * API Service for communicating with the advana-marketplace-monolith backend
 */
export class ApiService {
  /**
   * Get authorization headers for API requests using Keycloak's current token
   */
  private static async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    try {
      // Import keycloak instance dynamically to avoid circular dependencies
      const { default: keycloak } = await import("../keycloak");
      
      // Check if keycloak is authenticated and has a valid token
      if (keycloak?.authenticated && keycloak.token) {
        // Ensure token is fresh before using it (refresh if expires within 30 seconds)
        await keycloak.updateToken(30);
        headers["Authorization"] = `Bearer ${keycloak.token}`;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get authentication token from Keycloak:", error);
      // Continue without token - let the backend handle unauthenticated requests
    }

    return headers;
  }

  /**
   * Handle API response errors
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static async handleResponse<T>(response: any): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorDetails = '';

      try {
        const errorData = await response.json();
        if (errorData.errMsg) {
          errorMessage = errorData.errMsg;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        // Capture additional error details for debugging
        errorDetails = JSON.stringify(errorData);
      } catch {
        // If JSON parsing fails, use the default error message
      }

      // Log detailed error for debugging
      // eslint-disable-next-line no-console
      console.error(`API Error [${response.status}]:`, errorMessage, errorDetails ? `\nDetails: ${errorDetails}` : '');

      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Submit a new request to the backend
   */
  static async submitRequest(
    requestData: SubmitRequestApiRequest
  ): Promise<SubmitRequestApiResponse> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await window.fetch(getEndpointUrl("SUBMIT_REQUEST"), {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestData),
        mode: "cors",
        credentials: "omit",
      });

      return this.handleResponse<SubmitRequestApiResponse>(response);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error submitting request:", error);

      // Handle authentication errors gracefully
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        // eslint-disable-next-line no-console
        console.log(`[DEBUG submitRequest] Checking error message: "${errorMsg}"`);
        
        // Authentication/token validation issues
        if (errorMsg.includes("introspection") || 
            errorMsg.includes("unauthorized") || 
            errorMsg.includes("forbidden")) {
          // eslint-disable-next-line no-console
          console.warn(`✅ Authentication error during request submission. Returning error response.`);
          return {
            requestNumber: undefined,
            errMsg: "Authentication failed. Please ensure you're logged in and try again."
          };
        }
      }

      // In development mode with bypass auth, return a mock success response
      if (isBypassAuth) {
        // eslint-disable-next-line no-console
        console.log(
          "API call failed in bypass auth mode, returning mock success response"
        );
        return {
          requestNumber: `MOCK-${Date.now()}`,
          errMsg: undefined,
        };
      }

      throw error;
    }
  }

  /**
   * Get requests for a specific requestor
   */
  static async getRequestsForRequestor(
    userEmail: string
  ): Promise<ViewRequestsApiResponse> {
    try {
      const requestData: ViewRequestsApiRequest = { userEmail };

      const response = await window.fetch(
        getEndpointUrl("VIEW_FOR_REQUESTOR"),
        {
          method: "POST",
          headers: await this.getAuthHeaders(),
          body: JSON.stringify(requestData),
        }
      );

      return this.handleResponse<ViewRequestsApiResponse>(response);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching requests for requestor:", error);
      
      // Handle common recoverable errors gracefully
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        // eslint-disable-next-line no-console
        console.log(`[DEBUG] Checking error message: "${errorMsg}"`);
        
        // User doesn't exist in database yet
        if (errorMsg.includes("not found") || errorMsg.includes("user with email")) {
          // eslint-disable-next-line no-console
          console.warn(`✅ User ${userEmail} not found in database. Returning empty requests list.`);
          return { requests: [] };
        }
        
        // Authentication/token validation issues
        if (errorMsg.includes("introspection") || 
            errorMsg.includes("unauthorized") || 
            errorMsg.includes("forbidden")) {
          // eslint-disable-next-line no-console
          console.warn(`✅ Authentication error for user ${userEmail}. This may indicate token issues. Returning empty requests list.`);
          return { requests: [] };
        }
      }
      
      throw error;
    }
  }

  /**
   * Get all pending requests (for approvers)
   */
  static async getPendingRequests(
    userEmail: string
  ): Promise<ViewRequestsApiResponse> {
    try {
      const requestData: ViewRequestsApiRequest = { userEmail };

      const response = await window.fetch(getEndpointUrl("VIEW_PENDING"), {
        method: "POST",
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(requestData),
      });

      return this.handleResponse<ViewRequestsApiResponse>(response);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching pending requests:", error);
      
      // Handle common recoverable errors gracefully
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        // User doesn't exist in database yet
        if (errorMsg.includes("not found") || errorMsg.includes("user with email")) {
          // eslint-disable-next-line no-console
          console.warn(`User ${userEmail} not found in database. Returning empty pending requests list.`);
          return { requests: [] };
        }
        
        // Authentication/token validation issues
        if (errorMsg.includes("introspection") || 
            errorMsg.includes("unauthorized") || 
            errorMsg.includes("forbidden")) {
          // eslint-disable-next-line no-console
          console.warn(`Authentication error for user ${userEmail}. This may indicate token issues. Returning empty pending requests list.`);
          return { requests: [] };
        }
      }
      
      throw error;
    }
  }

  /**
   * Get all requests (for approvers)
   */
  static async getAllRequests(
    userEmail: string
  ): Promise<ViewRequestsApiResponse> {
    try {
      const requestData: ViewRequestsApiRequest = { userEmail };

      const response = await window.fetch(getEndpointUrl("VIEW_ALL"), {
        method: "POST",
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(requestData),
      });

      return this.handleResponse<ViewRequestsApiResponse>(response);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching all requests:", error);
      
      // Handle common recoverable errors gracefully
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        // User doesn't exist in database yet
        if (errorMsg.includes("not found") || errorMsg.includes("user with email")) {
          // eslint-disable-next-line no-console
          console.warn(`User ${userEmail} not found in database. Returning empty requests list.`);
          return { requests: [] };
        }
        
        // Authentication/token validation issues
        if (errorMsg.includes("introspection") || 
            errorMsg.includes("unauthorized") || 
            errorMsg.includes("forbidden")) {
          // eslint-disable-next-line no-console
          console.warn(`Authentication error for user ${userEmail}. This may indicate token issues. Returning empty requests list.`);
          return { requests: [] };
        }
      }
      
      throw error;
    }
  }

  /**
   * Get a specific request by request number
   * NOTE: Temporarily includes fallback logic until local backend is updated
   */
  static async getRequestByNumber(
    userEmail: string,
    requestNumber: string
  ): Promise<ViewRequestByNumberApiResponse> {
    try {
      const requestData: ViewRequestByNumberApiRequest = { 
        userEmail, 
        requestNumber 
      };

      const response = await window.fetch(
        getEndpointUrl("VIEW_FOR_REQUEST_NUMBER"),
        {
          method: "POST",
          headers: await this.getAuthHeaders(),
          body: JSON.stringify(requestData),
        }
      );

      // Temporary fallback for local development until backend is updated
      if (response.status === 501) {
        // eslint-disable-next-line no-console
        console.warn("⚠️ Local backend not updated yet, falling back to getAllRequests");
        
        // Fall back to getAllRequests and filter client-side
        const allRequestsResponse = await this.getAllRequests(userEmail);
        
        if (allRequestsResponse.requests) {
          const foundRequest = allRequestsResponse.requests.find(
            (req: UseCaseRequestApiDto) => req.requestNumber?.toString() === requestNumber
          );
          
          return {
            request: foundRequest || undefined,
            errMsg: foundRequest ? "" : "Request not found"
          };
        }
        
        return {
          request: undefined,
          errMsg: "No requests found"
        };
      }

      // Handle the actual API response structure
      const responseData = await this.handleResponse<UseCaseRequestApiDto>(response);
      
      // The API returns the request data directly, not wrapped in a "request" property
      return {
        request: responseData,
        errMsg: ""
      };
    } catch (error) {
      // Check if this is an authorization error and fall back to existing endpoints
      if (error instanceof Error && error.message.includes("UnauthorizedAdjudicatorError")) {
        // eslint-disable-next-line no-console
        console.warn("⚠️ User not authorized as adjudicator for new endpoint, falling back to existing endpoints");
        
        try {
          // Try requestor-specific endpoint first, then fall back to getAllRequests
          let allRequestsResponse: ViewRequestsApiResponse;
          
          try {
            allRequestsResponse = await this.getRequestsForRequestor(userEmail);
          } catch {
            // If requestor endpoint fails, try getAllRequests
            allRequestsResponse = await this.getAllRequests(userEmail);
          }
          
          if (allRequestsResponse.requests) {
            const foundRequest = allRequestsResponse.requests.find(
              (req: UseCaseRequestApiDto) => req.requestNumber?.toString() === requestNumber
            );
            
            return {
              request: foundRequest || undefined,
              errMsg: foundRequest ? "" : "Request not found"
            };
          }
          
          return {
            request: undefined,
            errMsg: "No requests found"
          };
        } catch (fallbackError) {
          // eslint-disable-next-line no-console
          console.error("Error in authorization fallback:", fallbackError);
          throw fallbackError;
        }
      }
      
      // eslint-disable-next-line no-console
      console.error("Error fetching request by number:", error);
      throw error;
    }
  }

  /**
   * Make a decision on a request (approve/reject)
   */
  static async makeDecision(
    decisionData: unknown
  ): Promise<unknown> {
    try {
      const response = await window.fetch(getEndpointUrl("DECISIONS"), {
        method: "POST",
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(decisionData),
      });

      return this.handleResponse<unknown>(response);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error making decision:", error);
      throw error;
    }
  }
}
