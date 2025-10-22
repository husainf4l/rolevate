# Notification API Documentation

## Overview
The notification system provides comprehensive notification management for users and companies. All endpoints require JWT authentication.

## Base URL
```
/api/notifications
```

## Authentication
All endpoints require authentication via HTTP-only cookies. The `access_token` cookie is automatically sent with requests when logged in. No manual Authorization headers needed.

---

## Endpoints

### 1. Create Notification
**POST** `/api/notifications`

Creates a new notification for a user or company.

**Request Body:**
```typescript
{
  type: "SUCCESS" | "WARNING" | "INFO" | "ERROR",
  category: "APPLICATION" | "INTERVIEW" | "SYSTEM" | "CANDIDATE" | "OFFER",
  title: string,
  message: string,
  actionUrl?: string, // Optional URL for action button
  metadata?: {
    candidateName?: string,
    jobTitle?: string,
    interviewDate?: string,
    applicationId?: string,
    [key: string]: any
  },
  userId?: string, // Optional, auto-set from authenticated user
  companyId?: string // Optional, auto-detected from user
}
```

**Response:**
```typescript
{
  id: string,
  type: string,
  category: string,
  title: string,
  message: string,
  actionUrl?: string,
  metadata?: object,
  userId?: string,
  companyId?: string,
  read: boolean,
  createdAt: string,
  updatedAt: string
}
```

---

### 2. Get User Notifications
**GET** `/api/notifications`

Retrieves notifications for the authenticated user.

**Query Parameters:**
- `type` - Filter by notification type
- `category` - Filter by category
- `read` - Filter by read status (true/false)
- `userId` - Filter by specific user ID
- `companyId` - Filter by company ID

**Response:**
```typescript
{
  notifications: [
    {
      id: string,
      type: string,
      category: string,
      title: string,
      message: string,
      timestamp: string,
      read: boolean,
      actionUrl?: string,
      metadata?: object,
      createdAt: string,
      updatedAt: string
    }
  ],
  total: number,
  unreadCount: number
}
```

---

### 3. Get My Notifications (Alias)
**GET** `/api/notifications/my`

Same as above - retrieves notifications for authenticated user.

**Query Parameters:** Same as above

---

### 4. Get Company Notifications
**GET** `/api/notifications/company/:companyId`

Retrieves notifications for a specific company.

**Path Parameters:**
- `companyId` - Company ID

**Query Parameters:** Same as user notifications

**Response:** Same as user notifications

---

### 5. Get Unread Count
**GET** `/api/notifications/unread-count`

Gets the count of unread notifications.

**Query Parameters:**
- `companyId` - Optional company ID filter

**Response:**
```typescript
{
  count: number
}
```

---

### 6. Get Single Notification
**GET** `/api/notifications/:id`

Retrieves a specific notification by ID.

**Path Parameters:**
- `id` - Notification ID

**Response:**
```typescript
{
  id: string,
  type: string,
  category: string,
  title: string,
  message: string,
  timestamp: string,
  read: boolean,
  actionUrl?: string,
  metadata?: object,
  userId?: string,
  companyId?: string,
  createdAt: string,
  updatedAt: string
}
```

---

### 7. Mark All Notifications as Read
**PATCH** `/api/notifications/mark-all-read`

Marks all notifications as read for the authenticated user.

**Query Parameters:**
- `companyId` - Optional company ID filter

**Response:**
```typescript
{
  message: string,
  updatedCount: number
}
```

---

### 8. Update Notification
**PATCH** `/api/notifications/:id`

Updates a notification's properties.

**Path Parameters:**
- `id` - Notification ID

**Request Body:**
```typescript
{
  type?: string,
  category?: string,
  title?: string,
  message?: string,
  actionUrl?: string,
  metadata?: object,
  read?: boolean
}
```

**Response:** Updated notification object

---

### 9. Mark Notification as Read
**PATCH** `/api/notifications/:id/read`

Marks a specific notification as read.

**Path Parameters:**
- `id` - Notification ID

**Response:**
```typescript
{
  id: string,
  read: true,
  updatedAt: string
}
```

---

### 10. Mark Notification as Unread
**PATCH** `/api/notifications/:id/unread`

Marks a specific notification as unread.

**Path Parameters:**
- `id` - Notification ID

**Response:**
```typescript
{
  id: string,
  read: false,
  updatedAt: string
}
```

---

### 11. Delete Notification
**DELETE** `/api/notifications/:id`

Deletes a specific notification.

**Path Parameters:**
- `id` - Notification ID

**Response:**
```typescript
{
  message: "Notification deleted successfully"
}
```

---

### 12. Cleanup Old Notifications
**DELETE** `/api/notifications/cleanup/:days`

Deletes notifications older than specified days.

**Path Parameters:**
- `days` - Number of days (must be positive integer)

**Response:**
```typescript
{
  message: string,
  deletedCount: number
}
```

---

## Data Types

### Notification Types
- `SUCCESS` - Green success notifications
- `WARNING` - Yellow warning notifications
- `INFO` - Blue informational notifications
- `ERROR` - Red error notifications

### Notification Categories
- `APPLICATION` - Job application related
- `INTERVIEW` - Interview related
- `SYSTEM` - System announcements
- `CANDIDATE` - Candidate profile related
- `OFFER` - Job offer related

### Common Metadata Fields
```typescript
{
  candidateName?: string,    // Name of candidate
  jobTitle?: string,         // Job position title
  interviewDate?: string,    // Interview scheduled date
  applicationId?: string,    // Application ID reference
  // ... other custom fields
}
```

---

## Frontend Integration Examples

### Fetch User Notifications
```javascript
const fetchNotifications = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const response = await fetch(`/api/notifications?${queryParams}`, {
    method: 'GET',
    credentials: 'include', // Include cookies for authentication
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

### Mark as Read
```javascript
const markAsRead = async (notificationId) => {
  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
    credentials: 'include', // Include cookies for authentication
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

### Get Unread Count
```javascript
const getUnreadCount = async () => {
  const response = await fetch('/api/notifications/unread-count', {
    method: 'GET',
    credentials: 'include', // Include cookies for authentication
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  return data.count;
};
```

---

## Error Responses

All endpoints may return these error responses:

- `401 Unauthorized` - Missing or invalid access_token cookie (user not logged in)
- `404 Not Found` - Notification not found
- `400 Bad Request` - Invalid request data
- `500 Internal Server Error` - Server error

---

## Real-time Updates

For real-time notification updates, consider implementing:
- WebSocket connections
- Server-Sent Events (SSE)
- Periodic polling of `/api/notifications/unread-count`

---

## Best Practices

1. **Credentials**: Always include `credentials: 'include'` in fetch requests to send cookies
2. **Pagination**: Use query parameters for large notification lists
3. **Caching**: Cache notification data on frontend for better UX
4. **Polling**: Poll unread count every 30-60 seconds for real-time feel
5. **Cleanup**: Periodically mark old notifications as read
6. **Error Handling**: Handle network errors gracefully
7. **Offline Support**: Cache notifications for offline viewing
8. **Cookie Management**: Ensure cookies are properly set after login and cleared after logout

This documentation covers all notification endpoints available in the RoleVate backend system. All endpoints require authentication and follow RESTful conventions.