import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Button,
  Divider,
  Tab,
  Tabs,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import { useNotificationContext } from "@/contexts/NotificationContext";
import {
  Notification,
  NotificationType,
  NotificationPriority,
} from "@/interfaces/interfaceStore";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
};

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead } = useNotificationContext();

  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    markAsRead(notification.id);

    // Navigate to action URL if available
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleMarkAsRead = (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    markAsRead(notificationId);
  };

  const getPriorityColor = (
    priority: NotificationPriority
  ): "error" | "warning" | "info" | "default" => {
    switch (priority) {
      case "urgent":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
      default:
        return "default";
    }
  };

  const getTypeLabel = (type: NotificationType): string => {
    switch (type) {
      case "request_submitted":
        return "Request Submitted";
      case "request_approved":
        return "Request Approved";
      case "request_rejected":
        return "Request Rejected";
      case "request_updated":
        return "Request Updated";
      case "system_alert":
        return "System Alert";
      case "general":
        return "General";
      default:
        return type;
    }
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

  // Filter notifications based on active tab
  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  const displayedNotifications =
    tabValue === 0
      ? notifications
      : tabValue === 1
      ? unreadNotifications
      : readNotifications;

  const unreadCount = unreadNotifications.length;

  return (
    <div className="notifications-page marketplace-content">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* Page Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <NotificationsActiveIcon
                sx={{ fontSize: 40, color: "primary.main" }}
              />
              <Typography variant="h4" component="h1">
                Notifications
              </Typography>
            </Box>
            {unreadCount > 0 && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<CheckCircleIcon />}
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </Box>

          {/* Tabs */}
          <Paper sx={{ mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="notification tabs"
              sx={{ borderBottom: 1, borderColor: "divider" }}
            >
              <Tab
                label={`All (${notifications.length})`}
                id="tab-0"
                aria-controls="tabpanel-0"
              />
              <Tab
                label={`Unread (${unreadCount})`}
                id="tab-1"
                aria-controls="tabpanel-1"
              />
              <Tab
                label={`Read (${readNotifications.length})`}
                id="tab-2"
                aria-controls="tabpanel-2"
              />
            </Tabs>
          </Paper>

          {/* Notification List */}
          <TabPanel value={tabValue} index={tabValue}>
            {displayedNotifications.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <NotificationsIcon
                  sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary">
                  No{" "}
                  {tabValue === 1 ? "unread " : tabValue === 2 ? "read " : ""}
                  notifications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You're all caught up!
                </Typography>
              </Paper>
            ) : (
              <Paper>
                <List>
                  {displayedNotifications.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      <ListItem
                        disablePadding
                        sx={{
                          backgroundColor: notification.read
                            ? "inherit"
                            : "action.hover",
                        }}
                      >
                        <ListItemButton
                          onClick={() => handleNotificationClick(notification)}
                          sx={{
                            py: 2,
                            borderLeft: 4,
                            borderColor: notification.read
                              ? "transparent"
                              : getPriorityColor(notification.priority) +
                                ".main",
                          }}
                        >
                          <ListItemText
                            primaryTypographyProps={{ component: "div" }}
                            secondaryTypographyProps={{ component: "div" }}
                            primary={
                              <Box
                                component="span"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 1,
                                }}
                              >
                                <Typography
                                  component="span"
                                  variant="subtitle1"
                                  sx={{
                                    fontWeight: notification.read ? 400 : 600,
                                    flexGrow: 1,
                                  }}
                                >
                                  {notification.title}
                                </Typography>
                                {!notification.read && (
                                  <Box
                                    sx={{
                                      width: 10,
                                      height: 10,
                                      borderRadius: "50%",
                                      backgroundColor: "primary.main",
                                      flexShrink: 0,
                                    }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box component="span">
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 1, display: "block" }}
                                >
                                  {notification.message}
                                </Typography>
                                <Box
                                  component="span"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <Chip
                                    label={getTypeLabel(notification.type)}
                                    size="small"
                                    variant="outlined"
                                  />
                                  <Chip
                                    label={notification.priority}
                                    size="small"
                                    color={getPriorityColor(
                                      notification.priority
                                    )}
                                  />
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    color="text.disabled"
                                  >
                                    {formatTimeAgo(notification.createdAt)}
                                  </Typography>
                                  {!notification.read && (
                                    <Button
                                      size="small"
                                      onClick={(e) =>
                                        handleMarkAsRead(notification.id, e)
                                      }
                                      sx={{ ml: "auto" }}
                                    >
                                      Mark as read
                                    </Button>
                                  )}
                                </Box>
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                      {index < displayedNotifications.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            )}
          </TabPanel>

          {/* Summary Stats */}
          {notifications.length > 0 && (
            <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Notifications
                </Typography>
                <Typography variant="h4">{notifications.length}</Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
                <Typography variant="body2" color="text.secondary">
                  Unread
                </Typography>
                <Typography variant="h4" color="primary">
                  {unreadCount}
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
                <Typography variant="body2" color="text.secondary">
                  Read
                </Typography>
                <Typography variant="h4" color="success.main">
                  {readNotifications.length}
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </Container>
    </div>
  );
};
