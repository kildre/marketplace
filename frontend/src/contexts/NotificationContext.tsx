import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Notification } from "../interfaces/interfaceStore";
import { getNotificationsForUser } from "../data/mock-notificationData";
import { useAuth } from "../hooks/useAuth";

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

  const loadNotifications = () => {
    const userInfo = getUserInfo();
    if (userInfo?.email) {
      const userNotifications = getNotificationsForUser(userInfo.email);
      setNotifications(userNotifications);
    } else {
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []); // Only load once on mount

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
