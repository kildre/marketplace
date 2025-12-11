import React, { useState } from "react";
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import {
  Notification,
  NotificationBellProps,
} from "@/interfaces/interfaceStore";
import { useNavigate } from "react-router-dom";
import "@/styles/components/_notification-bell.scss";

/**
 * NotificationBell Component
 *
 * Displays a notification bell icon with a badge showing unread count.
 * Clicking opens a dropdown menu with notification list.
 */
export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications = [],
  totalUnreadCount,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const open = Boolean(anchorEl);

  // Use totalUnreadCount if provided, otherwise calculate from notifications array
  const unreadCount =
    totalUnreadCount ?? notifications.filter((n) => !n.read).length;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }

    // Mark as read
    if (onMarkAsRead && !notification.read) {
      onMarkAsRead(notification.id);
    }

    // Navigate to action URL if provided
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }

    handleClose();
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    // Add to removing set to trigger animation
    setRemovingIds((prev) => new Set(prev).add(notificationId));

    // Wait for animation to complete before actually marking as read
    window.setTimeout(() => {
      if (onMarkAsRead) {
        onMarkAsRead(notificationId);
      }
      setRemovingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }, 300); // Match animation duration
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return time.toLocaleDateString();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        aria-label={`${unreadCount} unread notifications`}
        aria-controls={open ? "notification-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        color="inherit"
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
        </Badge>
      </IconButton>

      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        classes={{ paper: "notification-bell__menu-paper" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        disableScrollLock={true}
      >
        <Box className="notification-bell__header">
          <Typography variant="h6" className="notification-bell__title">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />

        {notifications.length === 0 ? (
          <Box className="notification-bell__empty">
            <NotificationsNoneIcon className="notification-bell__empty-icon" />
            <Typography variant="body2" color="text.secondary">
              No unread notifications
            </Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`notification-bell__item ${
                !notification.read ? "notification-bell__item--unread" : ""
              } ${
                !notification.read
                  ? `notification-bell__item--${notification.priority}`
                  : ""
              } ${
                removingIds.has(notification.id)
                  ? "notification-bell__item--removing"
                  : ""
              }`}
            >
              <Box className="notification-bell__item-content">
                <Box className="notification-bell__item-header">
                  <Typography
                    variant="subtitle2"
                    className={`notification-bell__item-title ${
                      notification.read
                        ? "notification-bell__item-title--read"
                        : "notification-bell__item-title--unread"
                    }`}
                  >
                    {notification.title}
                  </Typography>
                  {!notification.read && (
                    <Box className="notification-bell__unread-dot-wrapper">
                      <Box
                        className="notification-bell__unread-dot"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        role="button"
                        aria-label="Mark as read"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }
                        }}
                      />
                    </Box>
                  )}
                </Box>
                <Typography
                  variant="body2"
                  className="notification-bell__item-message"
                >
                  {notification.message}
                </Typography>
                <Typography
                  variant="caption"
                  className="notification-bell__item-time"
                >
                  {formatTimeAgo(notification.createdAt)}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
        {notifications.length > 0 && (
          <Box>
            <Divider />
            <Box className="notification-bell__footer">
              <Button
                size="small"
                onClick={() => {
                  handleClose();
                  navigate("/notifications");
                }}
                fullWidth
              >
                View All Notifications
              </Button>
            </Box>
          </Box>
        )}
      </Menu>
    </>
  );
};
