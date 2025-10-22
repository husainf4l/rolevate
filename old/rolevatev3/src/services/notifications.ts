import {
  // Notification,
  CreateNotificationDto,
  UpdateNotificationDto,
  CreateBulkNotificationDto,
  NotificationQueryDto,
  NotificationResponse,
  BulkNotificationResponse,
  UnreadCountResponse,
} from '@/types/notifications';

class NotificationsService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005';

  async create(
    data: CreateNotificationDto
  ): Promise<NotificationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          notification: result,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to create notification',
        };
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      return {
        success: false,
        message: 'Network error while creating notification',
      };
    }
  }

  async createBulk(
    data: CreateBulkNotificationDto
  ): Promise<BulkNotificationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return result;
      } else {
        return {
          success: false,
          message: result.message || 'Failed to create bulk notifications',
          created: 0,
          failed: data.notifications.length,
          errors: [result.message],
        };
      }
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      return {
        success: false,
        message: 'Network error while creating bulk notifications',
        created: 0,
        failed: data.notifications.length,
        errors: ['Network error'],
      };
    }
  }

  async findAll(
    query?: NotificationQueryDto
  ): Promise<NotificationResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `${this.baseUrl}/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          notifications: Array.isArray(result) ? result : result.notifications || [],
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to fetch notifications',
        };
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        success: false,
        message: 'Network error while fetching notifications',
      };
    }
  }

  async getUnreadCount(): Promise<UnreadCountResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/unread-count`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          count: result.count || 0,
        };
      } else {
        return {
          success: false,
          count: 0,
        };
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return {
        success: false,
        count: 0,
      };
    }
  }

  async markAllAsRead(): Promise<NotificationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/mark-all-read`, {
        method: 'POST',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'All notifications marked as read',
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to mark notifications as read',
        };
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      return {
        success: false,
        message: 'Network error while marking notifications as read',
      };
    }
  }

  async findOne(id: string): Promise<NotificationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/${id}`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          notification: result,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to fetch notification',
        };
      }
    } catch (error) {
      console.error('Error fetching notification:', error);
      return {
        success: false,
        message: 'Network error while fetching notification',
      };
    }
  }

  async update(
    id: string,
    data: UpdateNotificationDto
  ): Promise<NotificationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          notification: result,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to update notification',
        };
      }
    } catch (error) {
      console.error('Error updating notification:', error);
      return {
        success: false,
        message: 'Network error while updating notification',
      };
    }
  }

  async markAsRead(id: string): Promise<NotificationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/${id}/mark-read`, {
        method: 'POST',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          notification: result,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to mark notification as read',
        };
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        message: 'Network error while marking notification as read',
      };
    }
  }

  async remove(id: string): Promise<NotificationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Notification deleted successfully',
        };
      } else {
        const result = await response.json();
        return {
          success: false,
          message: result.message || 'Failed to delete notification',
        };
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      return {
        success: false,
        message: 'Network error while deleting notification',
      };
    }
  }
}

export const notificationsService = new NotificationsService();