import { AuthService } from "./authService";

// Base configuration for API calls
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

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
   * Get authorization headers for API requests
   */
  private static getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // In bypass auth mode, try to use mock user email
    if (import.meta.env.VITE_BYPASS_AUTH === "true") {
      // Still try to get the stored token from mock keycloak
      const token = AuthService.getStoredToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      // eslint-disable-next-line no-console
      console.log("Using bypass auth mode");
    } else {
      const token = AuthService.getStoredToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
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

      try {
        const errorData = await response.json();
        if (errorData.errMsg) {
          errorMessage = errorData.errMsg;
        }
      } catch {
        // If JSON parsing fails, use the default error message
      }

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
      const headers = this.getAuthHeaders();

      // eslint-disable-next-line no-console
      console.log("Submitting request to:", `${API_BASE_URL}/api/requests`);
      // eslint-disable-next-line no-console
      console.log("Request data:", requestData);
      // eslint-disable-next-line no-console
      console.log("Headers:", headers);

      const response = await window.fetch(`${API_BASE_URL}/api/requests`, {
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

      // In development mode with bypass auth, return a mock success response
      if (import.meta.env.VITE_BYPASS_AUTH === "true") {
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
        `${API_BASE_URL}/api/requests/viewForRequestor`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(requestData),
        }
      );

      return this.handleResponse<ViewRequestsApiResponse>(response);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching requests for requestor:", error);
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

      const response = await window.fetch(
        `${API_BASE_URL}/api/requests/viewPending`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(requestData),
        }
      );

      return this.handleResponse<ViewRequestsApiResponse>(response);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching pending requests:", error);
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

      const response = await window.fetch(
        `${API_BASE_URL}/api/requests/viewAll`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(requestData),
        }
      );

      return this.handleResponse<ViewRequestsApiResponse>(response);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching all requests:", error);
      throw error;
    }
  }
}
