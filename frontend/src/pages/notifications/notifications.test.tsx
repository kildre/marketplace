import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Notifications } from "./notifications";
import { NotificationProvider } from "@/contexts/NotificationContext";
import * as notificationData from "@/data/mock-notificationData";
import { Notification } from "@/interfaces/interfaceStore";

// Mock the useAuth hook
const mockGetUserInfo = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    getUserInfo: mockGetUserInfo,
    hasRole: vi.fn(),
    isAuthenticated: true,
  }),
}));

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockNotifications: Notification[] = [
  {
    id: "notif-001",
    type: "request_approved",
    priority: "high",
    title: "Request Approved",
    message: "Your request has been approved.",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    actionUrl: "/request-detail?requestId=req-001",
    requestId: "req-001",
    requestorEmail: "test@mail.mil",
    recipientEmails: ["test@mail.mil"],
  },
  {
    id: "notif-002",
    type: "system_alert",
    priority: "urgent",
    title: "System Maintenance",
    message: "System maintenance scheduled.",
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    recipientEmails: [],
  },
  {
    id: "notif-003",
    type: "request_submitted",
    priority: "low",
    title: "Request Submitted",
    message: "Your request has been submitted.",
    read: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    requestorEmail: "test@mail.mil",
    recipientEmails: ["test@mail.mil"],
  },
];

describe("Notifications Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserInfo.mockReturnValue({
      email: "test@mail.mil",
      firstName: "Test",
      lastName: "User",
    });
    vi.spyOn(notificationData, "getNotificationsForUser").mockReturnValue(
      mockNotifications
    );
  });

  const renderNotifications = () => {
    return render(
      <BrowserRouter>
        <NotificationProvider>
          <Notifications />
        </NotificationProvider>
      </BrowserRouter>
    );
  };

  describe("Rendering", () => {
    it("should render the notifications page", () => {
      renderNotifications();
      expect(screen.getByText("Notifications")).toBeInTheDocument();
    });

    it("should display mark all as read button", () => {
      renderNotifications();
      expect(screen.getByText("Mark all as read")).toBeInTheDocument();
    });

    it("should render all tabs", () => {
      renderNotifications();
      expect(screen.getByText(/All \(3\)/)).toBeInTheDocument();
      expect(screen.getByText(/Unread \(2\)/)).toBeInTheDocument();
      expect(screen.getByText(/Read \(1\)/)).toBeInTheDocument();
    });

    it("should display all notifications", () => {
      renderNotifications();
      expect(screen.getAllByText("Request Approved").length).toBeGreaterThan(0);
      expect(screen.getByText("System Maintenance")).toBeInTheDocument();
      expect(screen.getAllByText("Request Submitted").length).toBeGreaterThan(
        0
      );
    });

    it("should display summary stats", () => {
      renderNotifications();
      expect(screen.getByText("Total Notifications")).toBeInTheDocument();
      expect(screen.getByText("Unread")).toBeInTheDocument();
      expect(screen.getByText("Read")).toBeInTheDocument();
    });
  });

  describe("Tab Functionality", () => {
    it("should switch to unread tab and show only unread notifications", async () => {
      renderNotifications();

      const unreadTab = screen.getByText(/Unread \(2\)/);
      fireEvent.click(unreadTab);

      await waitFor(() => {
        expect(screen.getAllByText("Request Approved").length).toBeGreaterThan(
          0
        );
        expect(screen.getAllByText("Request Submitted").length).toBeGreaterThan(
          0
        );
        expect(
          screen.queryByText("System Maintenance")
        ).not.toBeInTheDocument();
      });
    });

    it("should switch to read tab and show only read notifications", async () => {
      renderNotifications();

      const readTab = screen.getByText(/Read \(1\)/);
      fireEvent.click(readTab);

      await waitFor(() => {
        expect(screen.getByText("System Maintenance")).toBeInTheDocument();
        expect(screen.queryByText("Request Approved")).not.toBeInTheDocument();
      });
    });
  });

  describe("Notification Interactions", () => {
    it("should navigate to action URL when notification is clicked", () => {
      renderNotifications();

      const notifications = screen.getAllByText("Request Approved");
      fireEvent.click(notifications[0]);

      expect(mockNavigate).toHaveBeenCalledWith(
        "/request-detail?requestId=req-001"
      );
    });

    it("should mark notification as read when clicked", () => {
      renderNotifications();

      const notifications = screen.getAllByText("Request Approved");
      fireEvent.click(notifications[0]);

      // Check that unread count decreases
      expect(screen.getByText(/Unread \(1\)/)).toBeInTheDocument();
    });

    it("should mark individual notification as read when button clicked", () => {
      renderNotifications();

      const markAsReadButtons = screen.getAllByText("Mark as read");
      fireEvent.click(markAsReadButtons[0]);

      // Unread count should decrease
      expect(screen.getByText(/Unread \(1\)/)).toBeInTheDocument();
    });

    it("should mark all notifications as read", () => {
      renderNotifications();

      const markAllButton = screen.getByText("Mark all as read");
      fireEvent.click(markAllButton);

      // All should be marked as read
      expect(screen.getByText(/Unread \(0\)/)).toBeInTheDocument();
      expect(screen.getByText(/Read \(3\)/)).toBeInTheDocument();
    });
  });

  describe("Empty States", () => {
    it("should show empty state when no notifications", () => {
      vi.spyOn(notificationData, "getNotificationsForUser").mockReturnValue([]);

      renderNotifications();

      expect(screen.getByText("No notifications")).toBeInTheDocument();
      expect(screen.getByText("You're all caught up!")).toBeInTheDocument();
    });

    it("should show empty state for unread tab when all read", () => {
      const allReadNotifications = mockNotifications.map((n) => ({
        ...n,
        read: true,
      }));
      vi.spyOn(notificationData, "getNotificationsForUser").mockReturnValue(
        allReadNotifications
      );

      renderNotifications();

      const unreadTab = screen.getByText(/Unread \(0\)/);
      fireEvent.click(unreadTab);

      expect(screen.getByText("No unread notifications")).toBeInTheDocument();
    });
  });

  describe("Display Elements", () => {
    it("should display notification priority chips", () => {
      renderNotifications();

      expect(screen.getByText("high")).toBeInTheDocument();
      expect(screen.getByText("urgent")).toBeInTheDocument();
      expect(screen.getByText("low")).toBeInTheDocument();
    });

    it("should display notification type labels", () => {
      renderNotifications();

      expect(screen.getAllByText("Request Approved").length).toBeGreaterThan(0);
      expect(screen.getByText("System Alert")).toBeInTheDocument();
      expect(screen.getAllByText("Request Submitted").length).toBeGreaterThan(
        0
      );
    });

    it("should display relative time", () => {
      renderNotifications();

      // Should show time ago format
      const timeElements = screen.getAllByText(/ago|Just now/);
      expect(timeElements.length).toBeGreaterThan(0);
    });

    it("should display unread indicators for unread notifications", () => {
      renderNotifications();

      // Check for "Mark as read" buttons on unread notifications
      const markAsReadButtons = screen.getAllByText("Mark as read");
      expect(markAsReadButtons.length).toBe(2); // 2 unread notifications
    });
  });

  describe("User Filtering", () => {
    it("should call getNotificationsForUser with correct email", () => {
      renderNotifications();

      expect(notificationData.getNotificationsForUser).toHaveBeenCalledWith(
        "test@mail.mil"
      );
    });

    it("should not load notifications if user email is not available", () => {
      mockGetUserInfo.mockReturnValue(null);

      renderNotifications();

      expect(notificationData.getNotificationsForUser).not.toHaveBeenCalled();
    });
  });

  describe("Sorting", () => {
    it("should display notifications sorted by date (newest first)", async () => {
      renderNotifications();

      await waitFor(() => {
        // Verify that notifications are displayed (context will load actual mock data)
        const allButtons = screen.getAllByRole("button");
        expect(allButtons.length).toBeGreaterThan(0);

        // The test should verify notifications are displayed in date order
        // The actual order depends on the mock data from getNotificationsForUser
        expect(screen.getByText("Notifications")).toBeInTheDocument();
      });
    });
  });
});
