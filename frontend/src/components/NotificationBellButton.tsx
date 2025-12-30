import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationBell } from "./notification-bell/notification-bell";
import { useNotificationContext } from "../contexts/NotificationContext";
import { Notification } from "../interfaces/interfaceStore";

/**
 * NotificationBellButton Component
 *
 * A header-ready notification bell that fetches user-specific notifications
 * and displays them in a dropdown. Integrates with the notification bell component.
 */
export const NotificationBellButton: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotificationContext();

  // Get 5 most recent unread notifications for dropdown
  const recentUnreadNotifications = useMemo(() => {
    return notifications
      .filter((n) => !n.read)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [notifications]);

  const handleNotificationClick = (notification: Notification) => {
    // Navigate to the notification's action URL if available
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <div className="notification-bell-button">
      <NotificationBell
        notifications={recentUnreadNotifications}
        totalUnreadCount={unreadCount}
        onNotificationClick={handleNotificationClick}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
    </div>
  );
};

export default NotificationBellButton;
