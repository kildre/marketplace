import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiService } from "./apiService";
import { AuthService } from "./authService";
import * as apiConfig from "../utils/api-config";

// Mock dependencies
vi.mock("./authService");
vi.mock("../utils/api-config");

  // Mock Keycloak module with proper typing
  const mockKeycloak = {
    authenticated: true,
    token: "mock-token-123" as string | null,
    updateToken: vi.fn().mockResolvedValue(true),
  };
vi.mock("../keycloak", () => ({ default: mockKeycloak }));

describe("ApiService", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Reset keycloak mock
    mockKeycloak.authenticated = true;
    mockKeycloak.token = "mock-token-123";
    mockKeycloak.updateToken.mockClear();
    mockKeycloak.updateToken.mockResolvedValue(true);

    // Mock console methods to suppress expected error/log outputs
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Mock getApiUrl to return a predictable URL
    vi.mocked(apiConfig.getApiUrl).mockImplementation(
      (path: string) => `http://localhost:3000${path}`
    );

    // Mock getEndpointUrl to return predictable URLs for typed endpoints
    vi.mocked(apiConfig.getEndpointUrl).mockImplementation(
      (endpoint: string) => {
        const endpoints: Record<string, string> = {
          SUBMIT_REQUEST: "http://localhost:3000/api/requests",
          VIEW_FOR_REQUESTOR:
            "http://localhost:3000/api/requests/viewForRequestor",
          VIEW_PENDING: "http://localhost:3000/api/requests/viewPending",
          VIEW_ALL: "http://localhost:3000/api/requests/viewAll",
        };
        return endpoints[endpoint] || `http://localhost:3000/api/${endpoint}`;
      }
    );

    // Mock AuthService.getStoredToken
    vi.mocked(AuthService.getStoredToken).mockReturnValue("mock-token-123");

    // Mock window.fetch
    mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
    window.fetch = mockFetch;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    vi.restoreAllMocks();
  });

  describe("submitRequest", () => {
    const mockRequestData = {
      requestNumber: "",
      requestorEmail: "test@example.com",
      designation: "Engineer",
      agency: "Test Agency",
      organization: "Test Org",
      otherOrganization: "",
      pointOfContact: "John Doe",
      email: "john@example.com",
      phoneNumber: "123-456-7890",
      estimatedRom: "10000",
      requestedToolName: "Tool A",
      description: "Test description",
      cartItems: [{ name: "Item 1", quantity: 1 }],
    };

    it("should successfully submit a request", async () => {
      const mockResponse = { requestNumber: "REQ-123" };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await ApiService.submitRequest(mockRequestData);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/requests",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer mock-token-123",
          }),
          body: JSON.stringify(mockRequestData),
          mode: "cors",
          credentials: "omit",
        })
      );
    });

    it("should include Authorization header when token is available", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ requestNumber: "REQ-123" }),
      });

      await ApiService.submitRequest(mockRequestData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token-123",
          }),
        })
      );
    });

    it("should handle network errors in bypass auth mode by returning mock response", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      // In bypass auth mode (test environment), network errors return mock response
      const result = await ApiService.submitRequest(mockRequestData);

      expect(result.requestNumber).toMatch(/^MOCK-/);
      expect(result.errMsg).toBeUndefined();
    });

    it("should handle HTTP error responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ errMsg: "Server error" }),
      });

      await expect(ApiService.submitRequest(mockRequestData)).rejects.toThrow(
        "Server error"
      );
    });

    it("should handle HTTP error without errMsg in response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      });

      await expect(ApiService.submitRequest(mockRequestData)).rejects.toThrow(
        "HTTP error! status: 404"
      );
    });

    it("should handle JSON parsing errors in error response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      await expect(ApiService.submitRequest(mockRequestData)).rejects.toThrow(
        "HTTP error! status: 500"
      );
    });

    it("should return mock response in bypass auth mode on failure", async () => {
      // Mock environment variable
      vi.stubGlobal("import", {
        meta: {
          env: { VITE_BYPASS_AUTH: "true" },
        },
      });

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await ApiService.submitRequest(mockRequestData);

      expect(result.requestNumber).toMatch(/^MOCK-/);
      expect(result.errMsg).toBeUndefined();

      vi.unstubAllGlobals();
    });

    it("should not include Authorization header when Keycloak is not authenticated", async () => {
      // Set Keycloak to not authenticated state
      mockKeycloak.authenticated = false;
      mockKeycloak.token = null;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ requestNumber: "REQ-123" }),
      });

      await ApiService.submitRequest(mockRequestData);

      const callArgs = mockFetch.mock.calls[0][1];
      const headers = callArgs?.headers as Record<string, string>;

      expect(headers?.["Authorization"]).toBeUndefined();
      expect(headers?.["Content-Type"]).toBe("application/json");
    });
  });

  describe("getRequestsForRequestor", () => {
    it("should fetch requests for requestor successfully", async () => {
      const mockRequests = {
        requests: [
          { requestNumber: "REQ-001", requestorEmail: "test@example.com" },
          { requestNumber: "REQ-002", requestorEmail: "test@example.com" },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockRequests,
      });

      const result = await ApiService.getRequestsForRequestor(
        "test@example.com"
      );

      expect(result).toEqual(mockRequests);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/requests/viewForRequestor",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer mock-token-123",
          }),
          body: JSON.stringify({ userEmail: "test@example.com" }),
        })
      );
    });

    it("should handle errors when fetching requests for requestor", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(
        ApiService.getRequestsForRequestor("test@example.com")
      ).rejects.toThrow("Network error");
    });

    it("should handle HTTP errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ errMsg: "Unauthorized" }),
      });

      await expect(
        ApiService.getRequestsForRequestor("test@example.com")
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("getPendingRequests", () => {
    it("should fetch pending requests successfully", async () => {
      const mockRequests = {
        requests: [
          { requestNumber: "REQ-001", statusId: 1 },
          { requestNumber: "REQ-002", statusId: 1 },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockRequests,
      });

      const result = await ApiService.getPendingRequests(
        "approver@example.com"
      );

      expect(result).toEqual(mockRequests);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/requests/viewPending",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ userEmail: "approver@example.com" }),
        })
      );
    });

    it("should handle errors when fetching pending requests", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Server error"));

      await expect(
        ApiService.getPendingRequests("approver@example.com")
      ).rejects.toThrow("Server error");
    });
  });

  describe("getAllRequests", () => {
    it("should fetch all requests successfully", async () => {
      const mockRequests = {
        requests: [
          { requestNumber: "REQ-001", statusId: 1 },
          { requestNumber: "REQ-002", statusId: 2 },
          { requestNumber: "REQ-003", statusId: 3 },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockRequests,
      });

      const result = await ApiService.getAllRequests("approver@example.com");

      expect(result).toEqual(mockRequests);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/requests/viewAll",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ userEmail: "approver@example.com" }),
        })
      );
    });

    it("should handle errors when fetching all requests", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Fetch failed"));

      await expect(
        ApiService.getAllRequests("approver@example.com")
      ).rejects.toThrow("Fetch failed");
    });

    it("should send request with authorization header", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ requests: [] }),
      });

      await ApiService.getAllRequests("approver@example.com");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token-123",
          }),
        })
      );
    });
  });

  describe("getAuthHeaders", () => {
    it("should include Content-Type header", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ requests: [] }),
      });

      await ApiService.getAllRequests("test@example.com");

      const callArgs = mockFetch.mock.calls[0][1];
      const headers = callArgs?.headers as Record<string, string>;

      expect(headers?.["Content-Type"]).toBe("application/json");
    });

    it("should include Authorization header when Keycloak is authenticated", async () => {
      // Ensure Keycloak is authenticated with a token
      mockKeycloak.authenticated = true;
      mockKeycloak.token = "test-keycloak-token";

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ requests: [] }),
      });

      await ApiService.getAllRequests("test@example.com");

      const callArgs = mockFetch.mock.calls[0][1];
      const headers = callArgs?.headers as Record<string, string>;

      expect(headers?.["Authorization"]).toBe("Bearer test-keycloak-token");
      expect(headers?.["Content-Type"]).toBe("application/json");
    });
  });

  describe("handleResponse", () => {
    it("should parse successful JSON responses", async () => {
      const mockData = { data: "test" };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await ApiService.getAllRequests("test@example.com");

      expect(result).toEqual(mockData);
    });

    it("should handle 400 error responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ errMsg: "Bad Request" }),
      });

      await expect(
        ApiService.getAllRequests("test@example.com")
      ).rejects.toThrow("Bad Request");
    });

    it("should handle 403 error responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ errMsg: "Forbidden" }),
      });

      await expect(
        ApiService.getAllRequests("test@example.com")
      ).rejects.toThrow("Forbidden");
    });

    it("should handle 500 error responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ errMsg: "Internal Server Error" }),
      });

      await expect(
        ApiService.getAllRequests("test@example.com")
      ).rejects.toThrow("Internal Server Error");
    });
  });
});
