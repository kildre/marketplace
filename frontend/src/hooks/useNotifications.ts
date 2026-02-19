import { useNotificationContext } from "../contexts/NotificationContext";

/**
 * Custom hook to access the unread notification count.
 * Data is fetched and polled by NotificationContext — this hook
 * is a thin consumer so call sites don't need to change.
 * @param enabled - When false, returns 0 (for compatibility with existing call sites)
 */
export const useNotifications = (enabled: boolean = true) => {
  const { unreadCount } = useNotificationContext();

  return {
    unreadCount: enabled ? unreadCount : 0,
  };
};
