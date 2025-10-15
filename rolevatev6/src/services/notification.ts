// Notification service
export interface Notification {
  id: string;
  type: 'application' | 'message' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const fetchNotifications = async (): Promise<Notification[]> => {
  // TODO: Implement
  return [];
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  // TODO: Implement
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  // TODO: Implement
};

export const deleteNotification = async (id: string): Promise<void> => {
  // TODO: Implement
};
