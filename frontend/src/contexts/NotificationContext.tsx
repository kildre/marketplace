import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Notification } from "../interfaces/interfaceStore";
import { ApiService } from "../services/apiService";
import { getNotificationsForUser } from "../data/mock-notificationData";
import { useAuth } from "../hooks/useAuth";

const POLL_INTERVAL_MS = 30_000;

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { getUserInfo } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = useCallback(async () => {
    const userEmail = getUserInfo()?.email ?? "";

    const [apiNotifications, mockNotifications] = await Promise.all([
      ApiService.getNotifications(),
      Promise.resolve(
        userEmail ? getNotificationsForUser(userEmail) : []
      ),
    ]);

    // Merge: real API notifications first, then mock notifications.
    // IDs never collide (API uses numeric strings e.g. "42"; mock uses "notif-001").
    const merged = [...apiNotifications, ...mockNotifications];

    // Preserve any locally-applied read state across polls.
    setNotifications((prev) => {
      const localReadIds = new Set(
        prev.filter((n) => n.read).map((n) => n.id)
      );
      return merged.map((n) =>
        localReadIds.has(n.id) ? { ...n, read: true } : n
      );
    });
  }, []); // getUserInfo intentionally omitted to avoid infinite loop

  useEffect(() => {
    loadNotifications();

    const intervalId = setInterval(loadNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [loadNotifications]);

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const refreshNotifications = () => {
    loadNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
};
