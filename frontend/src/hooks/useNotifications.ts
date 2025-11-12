import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { getUnreadNotificationsForUser } from "../data/mock-notificationData";

/**
 * Custom hook to fetch and manage notification state
 * @param enabled - Whether to fetch notifications (default: true)
 * @returns Object with unread notification count
 */
export const useNotifications = (enabled: boolean = true) => {
  const { getUserInfo } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const userInfo = getUserInfo();
    if (!enabled || !userInfo?.email) {
      setUnreadCount(0);
      return;
    }

    // In production, this would be an API call
    // For now, use mock data
    const unreadNotifications = getUnreadNotificationsForUser(userInfo.email);
    setUnreadCount(unreadNotifications.length);
  }, [enabled]); // getUserInfo intentionally omitted to avoid infinite loop

  return {
    unreadCount,
  };
};
