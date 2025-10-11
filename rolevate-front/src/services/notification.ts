import { API_CONFIG } from "@/lib/config";

export interface Notification {
  id: string;
  type: "SUCCESS" | "WARNING" | "INFO" | "ERROR";
  category: "APPLICATION" | "INTERVIEW" | "SYSTEM" | "CANDIDATE" | "OFFER";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    candidateName?: string;
    jobTitle?: string;
    interviewDate?: string;
    applicationId?: string;
    [key: string]: any;
  };
  userId?: string;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

export interface CreateNotificationPayload {
  type: "SUCCESS" | "WARNING" | "INFO" | "ERROR";
  category: "APPLICATION" | "INTERVIEW" | "SYSTEM" | "CANDIDATE" | "OFFER";
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: {
    candidateName?: string;
    jobTitle?: string;
    interviewDate?: string;
    applicationId?: string;
    [key: string]: any;
  };
  userId?: string;
  companyId?: string;
}

export interface NotificationFilters {
  type?: "SUCCESS" | "WARNING" | "INFO" | "ERROR";
  category?: "APPLICATION" | "INTERVIEW" | "SYSTEM" | "CANDIDATE" | "OFFER";
  read?: boolean;
  userId?: string;
  companyId?: string;
}

/**
 * Fetch all notifications for the authenticated user
 */
export const fetchNotifications = async (
  filters?: NotificationFilters
): Promise<NotificationsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `${API_CONFIG.API_BASE_URL}/notifications${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle both array and object responses
    if (Array.isArray(data)) {
      return {
        notifications: data,
        total: data.length,
        unreadCount: data.filter((n: Notification) => !n.read).length,
      };
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Get notifications for the authenticated user (alias endpoint)
 */
export const fetchMyNotifications = async (
  filters?: NotificationFilters
): Promise<NotificationsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `${API_CONFIG.API_BASE_URL}/notifications/my${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (Array.isArray(data)) {
      return {
        notifications: data,
        total: data.length,
        unreadCount: data.filter((n: Notification) => !n.read).length,
      };
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching my notifications:", error);
    throw error;
  }
};

/**
 * Get a single notification by ID
 */
export const fetchNotificationById = async (
  id: string
): Promise<Notification> => {
  try {
    const response = await fetch(
      `${API_CONFIG.API_BASE_URL}/notifications/${id}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch notification: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching notification:", error);
    throw error;
  }
};

/**
 * Get unread notifications count
 */
export const fetchUnreadCount = async (
  companyId?: string
): Promise<number> => {
  try {
    const url = `${API_CONFIG.API_BASE_URL}/notifications/unread-count${
      companyId ? `?companyId=${companyId}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch unread count: ${response.statusText}`);
    }

    const data = await response.json();
    return data.count;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

/**
 * Create a new notification
 */
export const createNotification = async (
  payload: CreateNotificationPayload
): Promise<Notification> => {
  try {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/notifications`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to create notification: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (
  id: string
): Promise<Notification> => {
  try {
    const response = await fetch(
      `${API_CONFIG.API_BASE_URL}/notifications/${id}/read`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to mark notification as read: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Mark a notification as unread
 */
export const markNotificationAsUnread = async (
  id: string
): Promise<Notification> => {
  try {
    const response = await fetch(
      `${API_CONFIG.API_BASE_URL}/notifications/${id}/unread`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to mark notification as unread: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error marking notification as unread:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (
  companyId?: string
): Promise<{ message: string; updatedCount: number }> => {
  try {
    const url = `${API_CONFIG.API_BASE_URL}/notifications/mark-all-read${
      companyId ? `?companyId=${companyId}` : ""
    }`;

    const response = await fetch(url, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to mark all notifications as read: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * Update a notification
 */
export const updateNotification = async (
  id: string,
  updates: Partial<CreateNotificationPayload>
): Promise<Notification> => {
  try {
    const response = await fetch(
      `${API_CONFIG.API_BASE_URL}/notifications/${id}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update notification: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating notification:", error);
    throw error;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const response = await fetch(
      `${API_CONFIG.API_BASE_URL}/notifications/${id}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete notification: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

/**
 * Cleanup old notifications
 */
export const cleanupOldNotifications = async (
  days: number
): Promise<{ message: string; deletedCount: number }> => {
  try {
    const response = await fetch(
      `${API_CONFIG.API_BASE_URL}/notifications/cleanup/${days}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to cleanup old notifications: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error cleaning up old notifications:", error);
    throw error;
  }
};

/**
 * Get company notifications
 */
export const fetchCompanyNotifications = async (
  companyId: string,
  filters?: NotificationFilters
): Promise<NotificationsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `${API_CONFIG.API_BASE_URL}/notifications/company/${companyId}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch company notifications: ${response.statusText}`
      );
    }

    const data = await response.json();
    
    if (Array.isArray(data)) {
      return {
        notifications: data,
        total: data.length,
        unreadCount: data.filter((n: Notification) => !n.read).length,
      };
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching company notifications:", error);
    throw error;
  }
};
