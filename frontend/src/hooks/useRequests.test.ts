import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useRequests } from "./useRequests";
import { AppRoles } from "../types/auth";
import { ApiService } from "@/services/apiService";

// Mock useAuth hook
const mockGetUserInfo = vi.fn();
const mockIsApprover = vi.fn();
const mockIsRequestor = vi.fn();

vi.mock("./useAuth", () => ({
  useAuth: () => ({
    getUserInfo: mockGetUserInfo,
    isApprover: mockIsApprover,
    isRequestor: mockIsRequestor,
  }),
}));

// Mock useKeycloak hook
const mockUpdateToken = vi.fn().mockResolvedValue(true);
const mockKeycloakObject = {
  authenticated: true,
  token: "mock-token",
  tokenParsed: { preferred_username: "testuser" },
  updateToken: mockUpdateToken,
};
vi.mock("./useKeycloak", () => ({
  useKeycloak: vi.fn(() => ({
    keycloak: mockKeycloakObject,
    initialized: true,
  })),
}));

// Mock AuthService
const mockGetStoredToken = vi.fn();
vi.mock("@/services/authService", () => ({
  AuthService: {
    getStoredToken: () => mockGetStoredToken(),
  },
}));

// Mock useRequestsRefresh hook
const mockSubscribe = vi.fn(() => vi.fn()); // Returns unsubscribe function
vi.mock("./useRequestsRefresh", () => ({
  useRequestsRefresh: () => ({
    subscribe: mockSubscribe,
  }),
}));

// Mock API config
vi.mock("@/utils/api-config", () => ({
  getApiUrl: vi.fn((path: string) => `http://localhost:8082${path}`),
}));

// Mock ApiService
vi.mock("@/services/apiService", () => ({
  ApiService: {
    getAllRequests: vi.fn(),
    getRequestsForRequestor: vi.fn(),
  },
}));

describe("useRequests", () => {
  const mockApproverUserInfo = {
    id: "approver1",
    username: "approver.user",
    email: "approver@army.mil",
    firstName: "Approver",
    lastName: "User",
    roles: [AppRoles.APPROVER],
  };

  const mockRequestorUserInfo = {
    id: "requestor1",
    username: "joe.snuffy.ctr",
    email: "joe.snuffy.ctr@army.mil",
    firstName: "Joe",
    lastName: "Snuffy",
    roles: [AppRoles.REQUESTOR],
  };

  const mockRequestsData = {
    requests: [
      {
        requestNumber: "req-001",
        requestorEmail: "joe.snuffy.ctr@army.mil",
        requestorUsername: "joe.snuffy.ctr",
        designation: "Contractor",
        agency: "Army",
        organization: "CDAO",
        otherOrganization: "",
        pointOfContact: "Joe Snuffy",
        email: "joe.snuffy.ctr@army.mil",
        phoneNumber: "123-456-7890",
        requestedToolName: "AWS",
        description: "Test description",
        cartItems: [{ name: "AWS", quantity: 1 }],
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
        statusId: 1,
      },
      {
        requestNumber: "req-002",
        requestorEmail: "jane.doe@army.mil",
        requestorUsername: "jane.doe",
        designation: "Military",
        agency: "Army",
        organization: "CDAO",
        otherOrganization: "",
        pointOfContact: "Jane Doe",
        email: "jane.doe@army.mil",
        phoneNumber: "123-456-7890",
        requestedToolName: "Azure",
        description: "Test description",
        cartItems: [{ name: "Azure", quantity: 2 }],
        createdAt: "2024-01-10T14:20:00Z",
        updatedAt: "2024-01-12T09:15:00Z",
        statusId: 2,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetStoredToken.mockClear();
    mockSubscribe.mockClear();
    mockUpdateToken.mockClear();
    vi.mocked(ApiService.getAllRequests).mockClear();
    vi.mocked(ApiService.getRequestsForRequestor).mockClear();
    mockUpdateToken.mockResolvedValue(true);
    mockKeycloakObject.token = "mock-token"; // Reset to default token
  });

  describe("Authorization Header Tests", () => {
    it("should include Authorization header when token exists for approvers", async () => {
      const mockToken = "mock-jwt-token-approver";
      mockGetStoredToken.mockReturnValue(mockToken);
      mockKeycloakObject.token = mockToken; // Set the keycloak token
      mockGetUserInfo.mockReturnValue(mockApproverUserInfo);
      mockIsApprover.mockReturnValue(true);
      mockIsRequestor.mockReturnValue(false);

      // ApiService handles authentication internally
      vi.mocked(ApiService.getAllRequests).mockResolvedValue(mockRequestsData);

      const { result } = renderHook(() => useRequests(undefined, true));

      await waitFor(() => {
        expect(result.current.requests).toBeDefined();
      });

      expect(vi.mocked(ApiService.getAllRequests)).toHaveBeenCalledWith(
        mockApproverUserInfo.email
      );
    });

    it("should include Authorization header when token exists for requestors", async () => {
      const mockToken = "mock-jwt-token-requestor";
      mockGetStoredToken.mockReturnValue(mockToken);
      mockKeycloakObject.token = mockToken; // Set the keycloak token
      mockGetUserInfo.mockReturnValue(mockRequestorUserInfo);
      mockIsApprover.mockReturnValue(false);
      mockIsRequestor.mockReturnValue(true);

      // ApiService handles authentication internally
      vi.mocked(ApiService.getRequestsForRequestor).mockResolvedValue(mockRequestsData);

      const { result } = renderHook(() => useRequests(undefined, true));

      await waitFor(() => {
        expect(result.current.requests).toBeDefined();
      });

      expect(vi.mocked(ApiService.getRequestsForRequestor)).toHaveBeenCalledWith(
        mockRequestorUserInfo.email
      );
    });

    it("should not make API call when no user email exists", async () => {
      mockGetStoredToken.mockReturnValue(null);
      mockKeycloakObject.token = null as any; // Set keycloak token to null
      mockGetUserInfo.mockReturnValue({ ...mockApproverUserInfo, email: "" }); // No email
      mockIsApprover.mockReturnValue(true);
      mockIsRequestor.mockReturnValue(false);

      // ApiService methods should not be called
      vi.mocked(ApiService.getAllRequests).mockResolvedValue(mockRequestsData);

      const { result } = renderHook(() => useRequests(undefined, true));

      await waitFor(() => {
        expect(result.current.requests).toEqual([]);
      });

      // ApiService methods should NOT be called when there's no email
      expect(vi.mocked(ApiService.getAllRequests)).not.toHaveBeenCalled();
      expect(vi.mocked(ApiService.getRequestsForRequestor)).not.toHaveBeenCalled();
    });

    it("should handle 403 Forbidden errors gracefully", async () => {
      mockGetStoredToken.mockReturnValue("invalid-token");
      mockGetUserInfo.mockReturnValue(mockApproverUserInfo);
      mockIsApprover.mockReturnValue(true);
      mockIsRequestor.mockReturnValue(false);

      // ApiService throws error for 403
      vi.mocked(ApiService.getAllRequests).mockRejectedValue(new Error("Forbidden"));

      const { result } = renderHook(() => useRequests(undefined, true));

      // Hook should handle the error and return empty array
      await waitFor(() => {
        expect(result.current.requests).toEqual([]);
      });
    });

    it("should return empty array when user is not authenticated", async () => {
      mockGetUserInfo.mockReturnValue(null);
      mockIsApprover.mockReturnValue(false);
      mockIsRequestor.mockReturnValue(false);

      const { result } = renderHook(() => useRequests(undefined, true));

      await waitFor(() => {
        expect(result.current.requests).toEqual([]);
      });

      // Should not make any API calls
      expect(vi.mocked(ApiService.getAllRequests)).not.toHaveBeenCalled();
      expect(vi.mocked(ApiService.getRequestsForRequestor)).not.toHaveBeenCalled();
    });
  });

  describe("Request Fetching Logic", () => {
    it("should fetch all requests for approvers", async () => {
      mockGetStoredToken.mockReturnValue("valid-token");
      mockGetUserInfo.mockReturnValue(mockApproverUserInfo);
      mockIsApprover.mockReturnValue(true);
      mockIsRequestor.mockReturnValue(false);

      vi.mocked(ApiService.getAllRequests).mockResolvedValue(mockRequestsData);

      const { result } = renderHook(() => useRequests(undefined, true));

      await waitFor(() => {
        expect(result.current.requests.length).toBeGreaterThan(0);
      });

      expect(vi.mocked(ApiService.getAllRequests)).toHaveBeenCalledWith(
        mockApproverUserInfo.email
      );
    });

    it("should fetch only own requests for requestors", async () => {
      mockGetStoredToken.mockReturnValue("valid-token");
      mockGetUserInfo.mockReturnValue(mockRequestorUserInfo);
      mockIsApprover.mockReturnValue(false);
      mockIsRequestor.mockReturnValue(true);

      vi.mocked(ApiService.getRequestsForRequestor).mockResolvedValue(mockRequestsData);

      const { result } = renderHook(() => useRequests(undefined, true));

      await waitFor(() => {
        expect(result.current.requests.length).toBeGreaterThan(0);
      });

      expect(vi.mocked(ApiService.getRequestsForRequestor)).toHaveBeenCalledWith(
        mockRequestorUserInfo.email
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      mockGetStoredToken.mockReturnValue("valid-token");
      mockGetUserInfo.mockReturnValue(mockApproverUserInfo);
      mockIsApprover.mockReturnValue(true);
      mockIsRequestor.mockReturnValue(false);

      vi.mocked(ApiService.getAllRequests).mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useRequests(undefined, true));

      await waitFor(() => {
        expect(result.current.requests).toEqual([]);
      });
    });

    it("should handle malformed API responses", async () => {
      mockGetStoredToken.mockReturnValue("valid-token");
      mockGetUserInfo.mockReturnValue(mockApproverUserInfo);
      mockIsApprover.mockReturnValue(true);
      mockIsRequestor.mockReturnValue(false);

      vi.mocked(ApiService.getAllRequests).mockResolvedValue({ invalid: "response" } as any);

      const { result } = renderHook(() => useRequests(undefined, true));

      // Should handle gracefully and return empty array
      await waitFor(() => {
        expect(Array.isArray(result.current.requests)).toBe(true);
      });
    });
  });
});
