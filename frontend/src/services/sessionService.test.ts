import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionService } from "./sessionService";

// Mock fetch
global.fetch = vi.fn();

// Mock crypto.randomUUID
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: () => "test-uuid-1234",
  },
});

describe("SessionService", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("isSessionStorageEnabled", () => {
    it("should return false by default", () => {
      expect(SessionService.isSessionStorageEnabled()).toBe(false);
    });

    it("should return true when enabled via environment", () => {
      // Mock environment variable
      import.meta.env.VITE_USE_SESSION_STORAGE = "true";
      expect(SessionService.isSessionStorageEnabled()).toBe(true);
      delete import.meta.env.VITE_USE_SESSION_STORAGE;
    });

    it("should return true when stored preference is set", () => {
      SessionService.enableSessionStorage();
      expect(SessionService.isSessionStorageEnabled()).toBe(true);
    });
  });

  describe("enableSessionStorage / disableSessionStorage", () => {
    it("should enable session storage", () => {
      SessionService.enableSessionStorage();
      expect(
        localStorage.getItem("marketplace_use_session_storage")
      ).toBe("true");
    });

    it("should disable session storage and clear session ID", () => {
      localStorage.setItem("marketplace_session_id", "test-session-id");
      SessionService.enableSessionStorage();

      SessionService.disableSessionStorage();

      expect(
        localStorage.getItem("marketplace_use_session_storage")
      ).toBeNull();
      expect(localStorage.getItem("marketplace_session_id")).toBeNull();
    });
  });

  describe("registerSession", () => {
    it("should register session successfully", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ sessionId: "test-uuid-1234", stored: true }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const sessionId = await SessionService.registerSession(
        "test-access-token",
        "test-refresh-token"
      );

      expect(sessionId).toBe("test-uuid-1234");
      expect(localStorage.getItem("marketplace_session_id")).toBe(
        "test-uuid-1234"
      );
      expect(
        localStorage.getItem("marketplace_use_session_storage")
      ).toBe("true");
    });

    it("should throw error on failed registration", async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({ error: "Invalid token" }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      await expect(
        SessionService.registerSession("invalid-token")
      ).rejects.toThrow("Failed to register session");
    });

    it("should handle registration with no refresh token", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ sessionId: "test-uuid-1234", stored: true }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const sessionId = await SessionService.registerSession("test-access-token");

      expect(sessionId).toBe("test-uuid-1234");

      // Verify fetch was called with correct payload (no refreshToken)
      const fetchCall = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.refreshToken).toBeUndefined();
    });
  });

  describe("getSessionId", () => {
    it("should return null when no session ID exists", () => {
      expect(SessionService.getSessionId()).toBeNull();
    });

    it("should return stored session ID", () => {
      localStorage.setItem("marketplace_session_id", "stored-session-id");
      expect(SessionService.getSessionId()).toBe("stored-session-id");
    });
  });

  describe("checkSessionStatus", () => {
    it("should return session status when exists", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          exists: true,
          expired: false,
          username: "test@example.com",
          roles: ["marketplace-approver"],
        }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const status = await SessionService.checkSessionStatus("test-session-id");

      expect(status.exists).toBe(true);
      expect(status.expired).toBe(false);
      expect(status.username).toBe("test@example.com");
      expect(status.roles).toEqual(["marketplace-approver"]);
    });

    it("should return exists: false for 404 response", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const status = await SessionService.checkSessionStatus("non-existent-session");

      expect(status.exists).toBe(false);
    });

    it("should handle network errors", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      const status = await SessionService.checkSessionStatus("test-session-id");

      expect(status.exists).toBe(false);
    });
  });

  describe("expireSession", () => {
    it("should expire session successfully", async () => {
      localStorage.setItem("marketplace_session_id", "test-session-id");

      const mockResponse = {
        ok: true,
        json: async () => ({ sessionId: "test-session-id", expired: true }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await SessionService.expireSession("test-session-id");

      expect(result).toBe(true);
      expect(localStorage.getItem("marketplace_session_id")).toBeNull();
    });

    it("should return false on error", async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await SessionService.expireSession("test-session-id");

      expect(result).toBe(false);
    });
  });

  describe("clearLocalSession", () => {
    it("should clear session ID from localStorage", () => {
      localStorage.setItem("marketplace_session_id", "test-session-id");

      SessionService.clearLocalSession();

      expect(localStorage.getItem("marketplace_session_id")).toBeNull();
    });
  });

  describe("initializeSession", () => {
    it("should initialize session when enabled via environment", async () => {
      import.meta.env.VITE_USE_SESSION_STORAGE = "true";

      const mockResponse = {
        ok: true,
        json: async () => ({ sessionId: "test-uuid-1234", stored: true }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const sessionId = await SessionService.initializeSession(
        "test-access-token",
        "test-refresh-token"
      );

      expect(sessionId).toBe("test-uuid-1234");

      delete import.meta.env.VITE_USE_SESSION_STORAGE;
    });

    it("should return null when not enabled", async () => {
      const sessionId = await SessionService.initializeSession("test-access-token");

      expect(sessionId).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should fallback to direct token mode on error", async () => {
      import.meta.env.VITE_USE_SESSION_STORAGE = "true";

      const mockResponse = {
        ok: false,
        status: 500,
        json: async () => ({ error: "Server error" }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const sessionId = await SessionService.initializeSession("test-access-token");

      expect(sessionId).toBeNull();
      expect(SessionService.isSessionStorageEnabled()).toBe(false);

      delete import.meta.env.VITE_USE_SESSION_STORAGE;
    });
  });

  describe("cleanup", () => {
    it("should cleanup session on logout", async () => {
      localStorage.setItem("marketplace_session_id", "test-session-id");
      SessionService.enableSessionStorage();

      const mockResponse = {
        ok: true,
        json: async () => ({ sessionId: "test-session-id", expired: true }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      await SessionService.cleanup();

      expect(localStorage.getItem("marketplace_session_id")).toBeNull();
      expect(
        localStorage.getItem("marketplace_use_session_storage")
      ).toBeNull();
    });

    it("should cleanup even if expiration fails", async () => {
      localStorage.setItem("marketplace_session_id", "test-session-id");
      SessionService.enableSessionStorage();

      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      await SessionService.cleanup();

      expect(localStorage.getItem("marketplace_session_id")).toBeNull();
      expect(
        localStorage.getItem("marketplace_use_session_storage")
      ).toBeNull();
    });
  });
});
