// Notifications API Service
const API_BASE_URL = 'https://rolevate.com/api';

// Auth token helper
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Notification Types
export enum NotificationType {
  APPLICATION_RECEIVED = 'APPLICATION_RECEIVED',
  APPLICATION_STATUS_CHANGED = 'APPLICATION_STATUS_CHANGED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED',
  CV_ANALYSIS_COMPLETED = 'CV_ANALYSIS_COMPLETED',
  JOB_POST_EXPIRING = 'JOB_POST_EXPIRING',
  SUBSCRIPTION_EXPIRING = 'SUBSCRIPTION_EXPIRING',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
}

// Interfaces
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  metadata?: {
    applicationId?: string;
    candidateId?: string;
    jobPostId?: string;
    interviewId?: string;
    actionUrl?: string;
    [key: string]: any;
  };
}

export interface CreateNotificationDto {
  type: NotificationType;
  title: string;
  message: string;
  userId?: string;
  metadata?: any;
}

export interface UpdateNotificationDto {
  isRead?: boolean;
  title?: string;
  message?: string;
}

export interface NotificationQueryDto {
  isRead?: boolean;
  type?: NotificationType;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API Functions

// Create notification (authenticated)
export const createNotification = async (notificationData: CreateNotificationDto): Promise<Notification> => {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(notificationData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create notification');
  }

  return response.json();
};

// Get all notifications (Super Admin only)
export const getAllNotifications = async (query: NotificationQueryDto = {}): Promise<NotificationsResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE_URL}/notifications?${queryParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch notifications: ${response.status}`);
  }

  const data = await response.json();
  
  if (Array.isArray(data)) {
    return { notifications: data };
  }

  return data;
};

// Get current user's notifications
export const getMyNotifications = async (query: NotificationQueryDto = {}): Promise<NotificationsResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE_URL}/notifications/my-notifications?${queryParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch notifications: ${response.status}`);
  }

  const data = await response.json();
  
  if (Array.isArray(data)) {
    return { notifications: data };
  }

  return data;
};

// Get unread notifications count
export const getUnreadNotificationsCount = async (): Promise<{ count: number }> => {
  const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch unread count: ${response.status}`);
  }

  return response.json();
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to mark notifications as read');
  }
};

// Delete all read notifications
export const deleteAllReadNotifications = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/notifications/delete-all-read`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete read notifications');
  }
};

// Get notification by ID
export const getNotificationById = async (notificationId: string): Promise<Notification> => {
  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Notification not found: ${response.status}`);
  }

  return response.json();
};

// Update notification
export const updateNotification = async (
  notificationId: string, 
  updateData: UpdateNotificationDto
): Promise<Notification> => {
  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update notification');
  }

  return response.json();
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/mark-read`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to mark notification as read');
  }

  return response.json();
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete notification');
  }
};

// Real-time notifications (WebSocket would be ideal, but polling for now)
export const pollForNewNotifications = async (lastCheckTime: string): Promise<Notification[]> => {
  const response = await getMyNotifications({
    isRead: false,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 50,
  });

  const newNotifications = response.notifications.filter(
    notification => new Date(notification.createdAt) > new Date(lastCheckTime)
  );

  return newNotifications;
};

// Notification utilities
export const getNotificationIcon = (type: NotificationType): string => {
  const iconMap: { [key in NotificationType]: string } = {
    [NotificationType.APPLICATION_RECEIVED]: '📄',
    [NotificationType.APPLICATION_STATUS_CHANGED]: '🔄',
    [NotificationType.INTERVIEW_SCHEDULED]: '📅',
    [NotificationType.INTERVIEW_COMPLETED]: '✅',
    [NotificationType.CV_ANALYSIS_COMPLETED]: '🔍',
    [NotificationType.JOB_POST_EXPIRING]: '⏰',
    [NotificationType.SUBSCRIPTION_EXPIRING]: '💳',
    [NotificationType.SYSTEM_ANNOUNCEMENT]: '📢',
  };

  return iconMap[type] || '📣';
};

export const getNotificationColor = (type: NotificationType): string => {
  const colorMap: { [key in NotificationType]: string } = {
    [NotificationType.APPLICATION_RECEIVED]: 'blue',
    [NotificationType.APPLICATION_STATUS_CHANGED]: 'yellow',
    [NotificationType.INTERVIEW_SCHEDULED]: 'green',
    [NotificationType.INTERVIEW_COMPLETED]: 'green',
    [NotificationType.CV_ANALYSIS_COMPLETED]: 'purple',
    [NotificationType.JOB_POST_EXPIRING]: 'orange',
    [NotificationType.SUBSCRIPTION_EXPIRING]: 'red',
    [NotificationType.SYSTEM_ANNOUNCEMENT]: 'gray',
  };

  return colorMap[type] || 'gray';
};

// Bulk notification operations
export const bulkMarkAsRead = async (notificationIds: string[]): Promise<Notification[]> => {
  const updatePromises = notificationIds.map(id => 
    markNotificationAsRead(id)
  );

  return Promise.all(updatePromises);
};

export const bulkDeleteNotifications = async (notificationIds: string[]): Promise<void> => {
  const deletePromises = notificationIds.map(id => 
    deleteNotification(id)
  );

  await Promise.all(deletePromises);
};
