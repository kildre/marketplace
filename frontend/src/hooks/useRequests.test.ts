import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useRequests } from "./useRequests";
import { AppRoles } from "../types/auth";

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
        cartItems: [{ name: "AWS", quantity: 1 }],
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
        statusId: 1,
      },
      {
        requestNumber: "req-002",
        requestorEmail: "jane.doe@army.mil",
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
    window.fetch = vi.fn();
  });

  describe("Authorization Header Tests", () => {
    it("should include Authorization header when token exists for approvers", async () => {
      const mockToken = "mock-jwt-token-approver";
      mockGetStoredToken.mockReturnValue(mockToken);
      mockGetUserInfo.mockReturnValue(mockApproverUserInfo);
      mockIsApprover.mockReturnValue(true);
      mockIsRequestor.mockReturnValue(false);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockRequestsData,
      });
      window.fetch = mockFetch;

      const { result } = renderHook(() => useRequests(undefined, true));

      await waitFor(() => {
        expect(result.current.requests).toBeDefined();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/requests/viewAll"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "Authorization": `Bearer ${mockToken}`,
          }),
          body: expect.stringContaining(mockApproverUserInfo.email),
        })
      );
    });

    it("should include Authorization header when token exists for requestors", async () => {
      const mockToken = "mock-jwt-token-requestor";
      mockGetStoredToken.mockReturnValue(mockToken);
      mockGetUserInfo.mockReturnValue(mockRequestorUserInfo);
      mockIsApprover.mockReturnValue(false);
      mockIsRequestor.mockReturnValue(true);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockRequestsData,
      });
      window.fetch = mockFetch;

      const { result } = renderHook(() => useRequests(undefined, true));

      await waitFor(() => {
        expect(result.current.requests).toBeDefined();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/requests/viewForRequestor"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "Authorization": `Bearer ${mockToken}`,
          }),
        })
      );
    });

    it("should not include Authorization header when no token exists", async () => {
      mockGetStoredToken.mockReturnValue(null);
      mockGetUserInfo.mockReturnValue(mockApproverUserInfo);
      mockIsApprover.mockReturnValue(true);
      mockIsRequestor.mockReturnValue(false);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockRequestsData,
      });
      window.fetch = mockFetch;

      const { result } = renderHook(() => useRequests(undefined, true));

      await waitFor(() => {
        expect(result.current.requests).toBeDefined();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/requests/viewAll"),
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
      );
    });

    it("should handle 403 Forbidden errors gracefully", async () => {
      mockGetStoredToken.mockReturnValue("invalid-token");
      mockGetUserInfo.mockReturnValue(mockApproverUserInfo);
      mockIsApprover.mockReturnValue(true);
      mockIsRequestor.mockReturnValue(false);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ errMsg: "Forbidden" }),
      });
      window.fetch = mockFetch;

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
      expect(window.fetch).not.toHaveBeenCalled();
    });
  });

  describe("Request Fetching Logic", () => {
    it("should fetch all requests for approvers", async () => {
      mockGetStoredToken.mockReturnValue("valid-token");
      mockGetUserInfo.mockReturnValue(mockApproverUserInfo);
      mockIsApprover.mockReturnValue(true);
      mockIsRequestor.mockReturnValue(false);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockRequestsData,
      });
      window.fetch = mockFetch;

      const { result } = renderHook(() => useRequests(undefined, true));

      await waitFor(() => {
        expect(result.current.requests.length).toBeGreaterThan(0);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/requests/viewAll"),
        expect.any(Object)
      );
    });

    it("should fetch only own requests for requestors", async () => {
      mockGetStoredToken.mockReturnValue("valid-token");
      mockGetUserInfo.mockReturnValue(mockRequestorUserInfo);
      mockIsApprover.mockReturnValue(false);
      mockIsRequestor.mockReturnValue(true);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockRequestsData,
      });
      window.fetch = mockFetch;

      const { result } = renderHook(() => useRequests(undefined, true));

      await waitFor(() => {
        expect(result.current.requests.length).toBeGreaterThan(0);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/requests/viewForRequestor"),
        expect.any(Object)
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      mockGetStoredToken.mockReturnValue("valid-token");
      mockGetUserInfo.mockReturnValue(mockApproverUserInfo);
      mockIsApprover.mockReturnValue(true);
      mockIsRequestor.mockReturnValue(false);

      const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
      window.fetch = mockFetch;

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

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: "response" }),
      });
      window.fetch = mockFetch;

      const { result } = renderHook(() => useRequests(undefined, true));

      // Should handle gracefully and return empty array
      await waitFor(() => {
        expect(Array.isArray(result.current.requests)).toBe(true);
      });
    });
  });
});
