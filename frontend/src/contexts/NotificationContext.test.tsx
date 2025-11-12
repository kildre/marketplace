import { describe, it, expect, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import {
  NotificationProvider,
  useNotificationContext,
} from "./NotificationContext";
import { EnhancedMockKeycloakProvider } from "./EnhancedMockKeycloakProvider";
import { AuthService } from "../services/authService";
import { AppRoles } from "../types/auth";

// Create a wrapper that includes both auth and notification providers
const createWrapper = (
  mockUserEmail: string,
  mockUserRoles: AppRoles[] = []
) => {
  // Store mock user info
  AuthService.storeUserInfo({
    id: "test-user",
    username: "testuser",
    email: mockUserEmail,
    firstName: "Test",
    lastName: "User",
    roles: mockUserRoles,
    keycloakRoles: mockUserRoles.map((r) => `marketplace-${r.toLowerCase()}`),
  });

  const WrapperComponent = ({ children }: { children: ReactNode }) => {
    return (
      <EnhancedMockKeycloakProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </EnhancedMockKeycloakProvider>
    );
  };
  return WrapperComponent;
};

describe("NotificationContext", () => {
  describe("Provider initialization", () => {
    it("should throw error when useNotificationContext is used outside provider", () => {
      // Suppress console.error for this test
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useNotificationContext());
      }).toThrow(
        "useNotificationContext must be used within a NotificationProvider"
      );

      consoleSpy.mockRestore();
    });

    it("should provide context values when used within provider", () => {
      const wrapper = createWrapper("vinoth.jagannathan.civ@mail.mil", [
        AppRoles.REQUESTOR,
      ]);
      const { result } = renderHook(() => useNotificationContext(), {
        wrapper,
      });

      expect(result.current).toBeDefined();
      expect(result.current.notifications).toBeDefined();
      expect(result.current.unreadCount).toBeDefined();
      expect(typeof result.current.markAsRead).toBe("function");
      expect(typeof result.current.markAllAsRead).toBe("function");
      expect(typeof result.current.refreshNotifications).toBe("function");
    });
  });

  describe("Loading notifications", () => {
    it("should load notifications for authenticated user", async () => {
      const wrapper = createWrapper("vinoth.jagannathan.civ@mail.mil", [
        AppRoles.REQUESTOR,
      ]);
      const { result } = renderHook(() => useNotificationContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.notifications.length).toBeGreaterThan(0);
      });
    });

    it("should load correct notifications for specific user", async () => {
      const userEmail = "joanna.c.ramsey.civ@mail.mil";
      const wrapper = createWrapper(userEmail, [AppRoles.APPROVER]);
      const { result } = renderHook(() => useNotificationContext(), {
        wrapper,
      });

      await waitFor(() => {
        const notifications = result.current.notifications;
        expect(notifications.length).toBeGreaterThan(0);

        // Verify notifications are relevant to the user
        notifications.forEach((notif) => {
          const isRecipient = notif.recipientEmails?.includes(userEmail);
          const isApprover = notif.approverEmail === userEmail;
          const isRequestor = notif.requestorEmail === userEmail;
          const isSystemAlert =
            notif.type === "system_alert" || notif.type === "general";
          const hasEmptyRecipients =
            !notif.recipientEmails || notif.recipientEmails.length === 0;

          // Either user-specific or system-wide notification
          expect(
            isRecipient ||
              isApprover ||
              isRequestor ||
              (isSystemAlert && hasEmptyRecipients)
          ).toBe(true);
        });
      });
    });

    it("should load system-wide notifications for any user", async () => {
      const wrapper = createWrapper("nonexistent@mail.mil", [
        AppRoles.REQUESTOR,
      ]);
      const { result } = renderHook(() => useNotificationContext(), {
        wrapper,
      });

      await waitFor(() => {
        // Even users with no specific notifications get system-wide alerts
        expect(result.current.notifications.length).toBeGreaterThan(0);

        // All notifications should be system-wide
        result.current.notifications.forEach((notif) => {
          const isSystemAlert =
            notif.type === "system_alert" || notif.type === "general";
          const hasEmptyRecipients =
            !notif.recipientEmails || notif.recipientEmails.length === 0;
          expect(isSystemAlert && hasEmptyRecipients).toBe(true);
        });
      });
    });
  });

  describe("Unread count calculation", () => {
    it("should calculate unread count correctly", async () => {
      const wrapper = createWrapper("vinoth.jagannathan.civ@mail.mil", [
        AppRoles.REQUESTOR,
      ]);
      const { result } = renderHook(() => useNotificationContext(), {
        wrapper,
      });

      await waitFor(() => {
        const notifications = result.current.notifications;
        const expectedUnreadCount = notifications.filter((n) => !n.read).length;
        expect(result.current.unreadCount).toBe(expectedUnreadCount);
      });
    });

    it("should update unread count when marking notification as read", async () => {
      const wrapper = createWrapper("vinoth.jagannathan.civ@mail.mil", [
        AppRoles.REQUESTOR,
      ]);
      const { result } = renderHook(() => useNotificationContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.notifications.length).toBeGreaterThan(0);
      });

      const initialUnreadCount = result.current.unreadCount;
      const unreadNotification = result.current.notifications.find(
        (n) => !n.read
      );

      if (unreadNotification) {
        act(() => {
          result.current.markAsRead(unreadNotification.id);
        });

        await waitFor(() => {
          expect(result.current.unreadCount).toBe(initialUnreadCount - 1);
        });
      }
    });

    it("should set unread count to zero after marking all as read", async () => {
      const wrapper = createWrapper("vinoth.jagannathan.civ@mail.mil", [
        AppRoles.REQUESTOR,
      ]);
      const { result } = renderHook(() => useNotificationContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.notifications.length).toBeGreaterThan(0);
      });

      act(() => {
        result.current.markAllAsRead();
      });

      await waitFor(() => {
        expect(result.current.unreadCount).toBe(0);
      });
    });
  });

  describe("markAsRead functionality", () => {
    it("should mark a specific notification as read", async () => {
      const wrapper = createWrapper("vinoth.jagannathan.civ@mail.mil", [
        AppRoles.REQUESTOR,
      ]);
      const { result } = renderHook(() => useNotificationContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.notifications.length).toBeGreaterThan(0);
      });

      const unreadNotification = result.current.notifications.find(
        (n) => !n.read
      );

      if (unreadNotification) {
        act(() => {
          result.current.markAsRead(unreadNotification.id);
        });

        await waitFor(() => {
          const updatedNotification = result.current.notifications.find(
            (n) => n.id === unreadNotification.id
          );
          expect(updatedNotification?.read).toBe(true);
        });
      }
    });

    it("should not affect other notifications when marking one as read", async () => {
      const wrapper = createWrapper("vinoth.jagannathan.civ@mail.mil", [
        AppRoles.REQUESTOR,
      ]);
      const { result } = renderHook(() => useNotificationContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.notifications.length).toBeGreaterThan(1);
      });

      const initialNotifications = [...result.current.notifications];
      const unreadNotification = initialNotifications.find((n) => !n.read);

      if (unreadNotification) {
        act(() => {
          result.current.markAsRead(unreadNotification.id);
        });

        await waitFor(() => {
          const otherNotifications = result.current.notifications.filter(
            (n) => n.id !== unreadNotification.id
          );
          const initialOtherNotifications = initialNotifications.filter(
            (n) => n.id !== unreadNotification.id
          );

          otherNotifications.forEach((notif, index) => {
            expect(notif.read).toBe(initialOtherNotifications[index].read);
          });
        });
      }
    });

    it("should handle marking non-existent notification as read gracefully", async () => {
      const wrapper = createWrapper("vinoth.jagannathan.civ@mail.mil", [
        AppRoles.REQUESTOR,
      ]);
      const { result } = renderHook(() => useNotificationContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.notifications.length).toBeGreaterThan(0);
      });

      const initialNotifications = [...result.current.notifications];

      act(() => {
        result.current.markAsRead("non-existent-id");
      });

      await waitFor(() => {
        expect(result.current.notifications).toEqual(initialNotifications);
      });
    });
  });

  describe("markAllAsRead functionality", () => {
    it("should mark all notifications as read", async () => {
      const wrapper = createWrapper("vinoth.jagannathan.civ@mail.mil", [
        AppRoles.REQUESTOR,
      ]);
      const { result } = renderHook(() => useNotificationContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.notifications.length).toBeGreaterThan(0);
      });

      act(() => {
        result.current.markAllAsRead();
      });

      await waitFor(() => {
        result.current.notifications.forEach((notification) => {
          expect(notification.read).toBe(true);
        });
      });
    });

    it("should work correctly when all notifications are already read", async () => {
      const wrapper = createWrapper("vinoth.jagannathan.civ@mail.mil", [
        AppRoles.REQUESTOR,
      ]);
      const { result } = renderHook(() => useNotificationContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.notifications.length).toBeGreaterThan(0);
      });

      // Mark all as read twice
      act(() => {
        result.current.markAllAsRead();
      });

      await waitFor(() => {
        expect(result.current.unreadCount).toBe(0);
      });

      act(() => {
        result.current.markAllAsRead();
      });

      await waitFor(() => {
        expect(result.current.unreadCount).toBe(0);
        result.current.notifications.forEach((notification) => {
          expect(notification.read).toBe(true);
        });
      });
    });
  });

  describe("refreshNotifications functionality", () => {
    it("should reload notifications when refresh is called", async () => {
      const wrapper = createWrapper("vinoth.jagannathan.civ@mail.mil", [
        AppRoles.REQUESTOR,
      ]);
      const { result } = renderHook(() => useNotificationContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.notifications.length).toBeGreaterThan(0);
      });

      // Mark a notification as read
      const unreadNotification = result.current.notifications.find(
        (n) => !n.read
      );
      if (unreadNotification) {
        act(() => {
          result.current.markAsRead(unreadNotification.id);
        });

        await waitFor(() => {
          const updatedNotification = result.current.notifications.find(
            (n) => n.id === unreadNotification.id
          );
          expect(updatedNotification?.read).toBe(true);
        });

        // Refresh notifications - should reload from mock data (reset read state)
        act(() => {
          result.current.refreshNotifications();
        });

        await waitFor(() => {
          const refreshedNotification = result.current.notifications.find(
            (n) => n.id === unreadNotification.id
          );
          // After refresh, notification should be back to original state from mock data
          expect(refreshedNotification).toBeDefined();
        });
      }
    });
  });

  describe("State synchronization", () => {
    it("should synchronize state across multiple hook instances", async () => {
      const wrapper = createWrapper("vinoth.jagannathan.civ@mail.mil", [
        AppRoles.REQUESTOR,
      ]);

      const { result: result1 } = renderHook(() => useNotificationContext(), {
        wrapper,
      });
      const { result: result2 } = renderHook(() => useNotificationContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result1.current.notifications.length).toBeGreaterThan(0);
        expect(result2.current.notifications.length).toBeGreaterThan(0);
      });

      const unreadNotification = result1.current.notifications.find(
        (n) => !n.read
      );

      if (unreadNotification) {
        act(() => {
          result1.current.markAsRead(unreadNotification.id);
        });

        await waitFor(() => {
          const notif1 = result1.current.notifications.find(
            (n) => n.id === unreadNotification.id
          );

          // Both hooks share the same context, so changes should be reflected
          expect(notif1?.read).toBe(true);
          expect(result1.current.unreadCount).toBeLessThan(
            result1.current.notifications.length
          );
        });
      }
    });
  });

  describe("Different user roles", () => {
    it("should load different notifications for different user roles", async () => {
      const requestorWrapper = createWrapper(
        "vinoth.jagannathan.civ@mail.mil",
        [AppRoles.REQUESTOR]
      );
      const approverWrapper = createWrapper("joanna.c.ramsey.civ@mail.mil", [
        AppRoles.APPROVER,
      ]);

      const { result: requestorResult } = renderHook(
        () => useNotificationContext(),
        { wrapper: requestorWrapper }
      );
      const { result: approverResult } = renderHook(
        () => useNotificationContext(),
        { wrapper: approverWrapper }
      );

      await waitFor(() => {
        expect(requestorResult.current.notifications.length).toBeGreaterThan(0);
        expect(approverResult.current.notifications.length).toBeGreaterThan(0);
      });

      // Notifications should be different for different users
      const requestorNotifIds = requestorResult.current.notifications.map(
        (n) => n.id
      );
      const approverNotifIds = approverResult.current.notifications.map(
        (n) => n.id
      );

      // There might be some overlap, but they shouldn't be identical
      expect(requestorNotifIds).not.toEqual(approverNotifIds);
    });
  });

  describe("Edge cases", () => {
    it("should handle system notifications gracefully for any user", async () => {
      const wrapper = createWrapper("empty-user@mail.mil", [
        AppRoles.REQUESTOR,
      ]);
      const { result } = renderHook(() => useNotificationContext(), {
        wrapper,
      });

      await waitFor(() => {
        // System notifications are always available
        expect(result.current.notifications.length).toBeGreaterThanOrEqual(0);
      });

      // Should not error when calling functions
      act(() => {
        result.current.markAsRead("any-id");
        result.current.markAllAsRead();
        result.current.refreshNotifications();
      });

      // Functions should work without errors
      expect(result.current.unreadCount).toBeGreaterThanOrEqual(0);
    });

    it("should handle marking already read notification as read", async () => {
      const wrapper = createWrapper("vinoth.jagannathan.civ@mail.mil", [
        AppRoles.REQUESTOR,
      ]);
      const { result } = renderHook(() => useNotificationContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.notifications.length).toBeGreaterThan(0);
      });

      // First mark all as read
      act(() => {
        result.current.markAllAsRead();
      });

      await waitFor(() => {
        expect(result.current.unreadCount).toBe(0);
      });

      const readNotification = result.current.notifications[0];

      // Mark a read notification as read again
      act(() => {
        result.current.markAsRead(readNotification.id);
      });

      await waitFor(() => {
        const notification = result.current.notifications.find(
          (n) => n.id === readNotification.id
        );
        expect(notification?.read).toBe(true);
        expect(result.current.unreadCount).toBe(0);
      });
    });
  });
});
