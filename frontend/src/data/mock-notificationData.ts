import { Notification } from "../interfaces/interfaceStore";

/**
 * Mock Notification Data
 *
 * This file contains sample notifications for development and testing purposes.
 * Notifications are associated with specific users from MockKeycloakProvider.
 *
 * MOCK USERS:
 * - Approvers: joanna.c.ramsey.civ@mail.mil, jennifer.a.cowley.civ@mail.mil, jane.f.roberts.civ@mail.mil
 * - Requestors: vinoth.jagannathan.civ@mail.mil, elizabeth.y.ahn.civ@mail.mil, daniel.e.allen.civ@mail.mil
 */

export const mockNotifications: Notification[] = [
  // Notification for Vinoth (requestor) - his request was approved by Joanna
  {
    id: "notif-001",
    type: "request_approved",
    priority: "high",
    title: "Request Approved",
    message:
      "Your request for Tableau Desktop (req-001) has been approved by Joanna Ramsey.",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    actionUrl: "/request-detail?requestId=req-001",
    requestId: "req-001",
    requestorEmail: "vinoth.jagannathan.civ@mail.mil",
    approverEmail: "joanna.c.ramsey.civ@mail.mil",
    recipientEmails: [
      "vinoth.jagannathan.civ@mail.mil",
      "joanna.c.ramsey.civ@mail.mil",
    ],
    metadata: {
      requestStatus: "Approved",
      approverName: "Joanna Ramsey",
      requestorName: "Vinoth Jagannathan",
    },
  },

  // Notification for Elizabeth (requestor) - her request was rejected by Jennifer
  {
    id: "notif-002",
    type: "request_rejected",
    priority: "medium",
    title: "Request Rejected",
    message:
      "Your request for Power BI License (req-005) has been rejected by Jennifer Cowley.",
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    actionUrl: "/request-detail?requestId=req-005",
    requestId: "req-005",
    requestorEmail: "elizabeth.y.ahn.civ@mail.mil",
    approverEmail: "jennifer.a.cowley.civ@mail.mil",
    recipientEmails: [
      "elizabeth.y.ahn.civ@mail.mil",
      "jennifer.a.cowley.civ@mail.mil",
    ],
    metadata: {
      requestStatus: "Rejected",
      approverName: "Jennifer Cowley",
      requestorName: "Elizabeth Ahn",
      rejectionReason: "Insufficient justification for license requirement.",
    },
  },

  // Notification for Daniel (requestor) - he submitted a request
  {
    id: "notif-003",
    type: "request_submitted",
    priority: "low",
    title: "Request Submitted Successfully",
    message:
      "Your request (req-010) has been submitted and is pending approval.",
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    actionUrl: "/request-detail?requestId=req-010",
    requestId: "req-010",
    requestorEmail: "daniel.e.allen.civ@mail.mil",
    recipientEmails: ["daniel.e.allen.civ@mail.mil"],
    metadata: {
      requestStatus: "Pending",
      requestorName: "Daniel Allen",
    },
  },

  // System alert - visible to all users
  {
    id: "notif-004",
    type: "system_alert",
    priority: "urgent",
    title: "System Maintenance Scheduled",
    message:
      "The Advana Marketplace will be undergoing maintenance on Nov 15, 2025 from 2:00 AM - 6:00 AM EST.",
    read: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    recipientEmails: [], // Empty means all users can see it
    metadata: {
      maintenanceStart: "2025-11-15T02:00:00Z",
      maintenanceEnd: "2025-11-15T06:00:00Z",
    },
  },

  // Notification for Vinoth (requestor) - request updated
  {
    id: "notif-005",
    type: "request_updated",
    priority: "medium",
    title: "Request Updated",
    message:
      "Additional information has been requested for your application request (req-007) by Jane Roberts.",
    read: false,
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
    actionUrl: "/request-detail?requestId=req-007",
    requestId: "req-007",
    requestorEmail: "vinoth.jagannathan.civ@mail.mil",
    approverEmail: "jane.f.roberts.civ@mail.mil",
    recipientEmails: [
      "vinoth.jagannathan.civ@mail.mil",
      "jane.f.roberts.civ@mail.mil",
    ],
    metadata: {
      requestStatus: "Pending",
      updateType: "information_requested",
      approverName: "Jane Roberts",
      requestorName: "Vinoth Jagannathan",
    },
  },

  // Notification for Elizabeth (requestor) - approved by Joanna
  {
    id: "notif-006",
    type: "request_approved",
    priority: "high",
    title: "Request Approved",
    message:
      "Your request for AWS Cloud Services (req-003) has been approved by Joanna Ramsey.",
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    actionUrl: "/request-detail?requestId=req-003",
    requestId: "req-003",
    requestorEmail: "elizabeth.y.ahn.civ@mail.mil",
    approverEmail: "joanna.c.ramsey.civ@mail.mil",
    recipientEmails: [
      "elizabeth.y.ahn.civ@mail.mil",
      "joanna.c.ramsey.civ@mail.mil",
    ],
    metadata: {
      requestStatus: "Approved",
      approverName: "Joanna Ramsey",
      requestorName: "Elizabeth Ahn",
    },
  },

  // General notification - visible to all users
  {
    id: "notif-007",
    type: "general",
    priority: "low",
    title: "New Features Available",
    message:
      "Check out the new request tracking dashboard and enhanced reporting features!",
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    actionUrl: "/metrics",
    recipientEmails: [], // Empty means all users can see it
    metadata: {
      featureList: [
        "Request Dashboard",
        "Enhanced Reporting",
        "Notification System",
      ],
    },
  },

  // Notification for Daniel (requestor) - he submitted another request
  {
    id: "notif-008",
    type: "request_submitted",
    priority: "low",
    title: "Request Submitted Successfully",
    message:
      "Your request for Data Analytics Tools (req-012) has been submitted.",
    read: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    actionUrl: "/request-detail?requestId=req-012",
    requestId: "req-012",
    requestorEmail: "daniel.e.allen.civ@mail.mil",
    recipientEmails: ["daniel.e.allen.civ@mail.mil"],
    metadata: {
      requestStatus: "Pending",
      requestorName: "Daniel Allen",
    },
  },

  // System alert - visible to all users
  {
    id: "notif-009",
    type: "system_alert",
    priority: "medium",
    title: "Policy Update",
    message:
      "Application request policy has been updated. Please review the new guidelines.",
    read: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    recipientEmails: [], // Empty means all users can see it
    metadata: {
      policyVersion: "2.1",
      effectiveDate: "2025-11-15",
    },
  },

  // Notification for Vinoth (requestor) - approved by Jennifer
  {
    id: "notif-010",
    type: "request_approved",
    priority: "high",
    title: "Request Approved",
    message:
      "Your request for Microsoft Office 365 (req-008) has been approved by Jennifer Cowley.",
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    actionUrl: "/request-detail?requestId=req-008",
    requestId: "req-008",
    requestorEmail: "vinoth.jagannathan.civ@mail.mil",
    approverEmail: "jennifer.a.cowley.civ@mail.mil",
    recipientEmails: [
      "vinoth.jagannathan.civ@mail.mil",
      "jennifer.a.cowley.civ@mail.mil",
    ],
    metadata: {
      requestStatus: "Approved",
      approverName: "Jennifer Cowley",
      requestorName: "Vinoth Jagannathan",
    },
  },

  // Notification for Joanna (approver) - new request to review from Elizabeth
  {
    id: "notif-011",
    type: "request_submitted",
    priority: "medium",
    title: "New Request Pending Review",
    message:
      "Elizabeth Ahn has submitted a new request (req-015) for your approval.",
    read: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    actionUrl: "/request-detail?requestId=req-015",
    requestId: "req-015",
    requestorEmail: "elizabeth.y.ahn.civ@mail.mil",
    recipientEmails: [
      "joanna.c.ramsey.civ@mail.mil",
      "jennifer.a.cowley.civ@mail.mil",
      "jane.f.roberts.civ@mail.mil",
    ],
    metadata: {
      requestStatus: "Pending",
      requestorName: "Elizabeth Ahn",
    },
  },

  // Notification for Jennifer (approver) - new request to review from Daniel
  {
    id: "notif-012",
    type: "request_submitted",
    priority: "medium",
    title: "New Request Pending Review",
    message:
      "Daniel Allen has submitted a new request (req-016) for your approval.",
    read: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    actionUrl: "/request-detail?requestId=req-016",
    requestId: "req-016",
    requestorEmail: "daniel.e.allen.civ@mail.mil",
    recipientEmails: [
      "joanna.c.ramsey.civ@mail.mil",
      "jennifer.a.cowley.civ@mail.mil",
      "jane.f.roberts.civ@mail.mil",
    ],
    metadata: {
      requestStatus: "Pending",
      requestorName: "Daniel Allen",
    },
  },
];

/**
 * Helper function to get notifications for a specific user
 * Users can only see notifications where:
 * 1. They are the requestor (requestorEmail matches)
 * 2. They are the approver (approverEmail matches)
 * 3. They are in the recipientEmails list
 * 4. The notification is a system_alert or general type with empty recipientEmails (visible to all)
 */
export const getNotificationsForUser = (userEmail: string): Notification[] => {
  return mockNotifications.filter((notification) => {
    // System alerts and general notifications with empty recipients are visible to all
    if (
      (notification.type === "system_alert" ||
        notification.type === "general") &&
      (!notification.recipientEmails ||
        notification.recipientEmails.length === 0)
    ) {
      return true;
    }

    // Check if user is the requestor
    if (notification.requestorEmail === userEmail) {
      return true;
    }

    // Check if user is the approver
    if (notification.approverEmail === userEmail) {
      return true;
    }

    // Check if user is in the recipient list
    if (
      notification.recipientEmails &&
      notification.recipientEmails.includes(userEmail)
    ) {
      return true;
    }

    return false;
  });
};

/**
 * Helper function to get unread notifications for a specific user
 */
export const getUnreadNotificationsForUser = (
  userEmail: string
): Notification[] => {
  return getNotificationsForUser(userEmail).filter(
    (notification) => !notification.read
  );
};

/**
 * Helper function to get unread notifications
 */
export const getUnreadNotifications = (): Notification[] => {
  return mockNotifications.filter((notification) => !notification.read);
};

/**
 * Helper function to get notifications by type
 */
export const getNotificationsByType = (
  type: Notification["type"]
): Notification[] => {
  return mockNotifications.filter((notification) => notification.type === type);
};

/**
 * Helper function to get notifications by priority
 */
export const getNotificationsByPriority = (
  priority: Notification["priority"]
): Notification[] => {
  return mockNotifications.filter(
    (notification) => notification.priority === priority
  );
};

/**
 * Helper function to get recent notifications (last 24 hours)
 */
export const getRecentNotifications = (): Notification[] => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return mockNotifications.filter(
    (notification) => new Date(notification.createdAt) > yesterday
  );
};

/**
 * Mock function to simulate marking a notification as read
 */
export const markNotificationAsRead = (notificationId: string): void => {
  const notification = mockNotifications.find((n) => n.id === notificationId);
  if (notification) {
    notification.read = true;
  }
};

/**
 * Mock function to simulate marking all notifications as read
 */
export const markAllNotificationsAsRead = (): void => {
  mockNotifications.forEach((notification) => {
    notification.read = true;
  });
};
