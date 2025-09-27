export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'application' | 'interview' | 'system' | 'message';
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
  actionUrl?: string;
  userId?: string;
  recipientId?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byCategory: Record<string, number>;
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'application' | 'interview' | 'system' | 'message';
  actionUrl?: string;
  recipientId?: string;
}

export interface UpdateNotificationDto {
  isRead?: boolean;
  title?: string;
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  category?: 'application' | 'interview' | 'system' | 'message';
  actionUrl?: string;
}

export interface CreateBulkNotificationDto {
  notifications: CreateNotificationDto[];
  recipientIds?: string[];
}

export interface NotificationQueryDto {
  page?: number;
  limit?: number;
  type?: 'info' | 'success' | 'warning' | 'error';
  category?: 'application' | 'interview' | 'system' | 'message';
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface NotificationResponse {
  success: boolean;
  message?: string;
  notification?: Notification;
  notifications?: Notification[];
  stats?: NotificationStats;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface BulkNotificationResponse {
  success: boolean;
  message?: string;
  created: number;
  failed: number;
  errors?: string[];
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}