# Communication System Implementation Summary

## ✅ What's Been Implemented

### 1. Database Schema

- **Communication model** added to Prisma schema
- **Relations** to CandidateProfile, Company, and Job models
- **Enums** for CommunicationType, CommunicationDirection, CommunicationStatus
- **Migration** successfully applied to database

### 2. Backend API (NestJS)

- **CommunicationService** with all CRUD operations
- **CommunicationController** with JWT authentication
- **DTOs** with proper validation
- **WhatsApp integration** using existing WhatsAppService
- **Error handling** and proper HTTP responses

### 3. API Endpoints Available

| Method | Endpoint                                   | Description                               |
| ------ | ------------------------------------------ | ----------------------------------------- |
| GET    | `/api/communications`                      | Get paginated communications with filters |
| GET    | `/api/communications/stats`                | Get communication statistics              |
| GET    | `/api/communications/history/:candidateId` | Get communication history for a candidate |
| GET    | `/api/communications/:id`                  | Get single communication                  |
| POST   | `/api/communications`                      | Create communication record               |
| POST   | `/api/communications/send-whatsapp`        | Send WhatsApp message                     |

### 4. Key Features

- ✅ **WhatsApp History**: Track all WhatsApp communications
- ✅ **Send WhatsApp**: Send new messages and auto-create records
- ✅ **Filtering**: By candidate, job, type, status, date range
- ✅ **Pagination**: Handle large datasets efficiently
- ✅ **Authentication**: JWT-based with company context
- ✅ **Error Handling**: Proper error responses and validation

## 🚀 How to Use

### For Frontend Integration

```javascript
// 1. Get WhatsApp history for a candidate
const getWhatsAppHistory = async (candidateId, jobId = null) => {
  const url = jobId
    ? `/api/communications/history/${candidateId}?jobId=${jobId}`
    : `/api/communications/history/${candidateId}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

// 2. Send WhatsApp message
const sendWhatsAppMessage = async (candidateId, message, jobId = null) => {
  const response = await fetch('/api/communications/send-whatsapp', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      candidateId,
      content: message,
      jobId,
    }),
  });
  return response.json();
};

// 3. Get all communications with pagination
const getCommunications = async (page = 1, filters = {}) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: '20',
    ...filters,
  });

  const response = await fetch(`/api/communications?${queryParams}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};
```

### Example React Component

```jsx
import React, { useState, useEffect } from 'react';

const CommunicationHistory = ({ candidateId, jobId }) => {
  const [communications, setCommunications] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCommunications();
  }, [candidateId, jobId]);

  const loadCommunications = async () => {
    try {
      const data = await getWhatsAppHistory(candidateId, jobId);
      setCommunications(data);
    } catch (error) {
      console.error('Error loading communications:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      await sendWhatsAppMessage(candidateId, newMessage, jobId);
      setNewMessage('');
      loadCommunications(); // Refresh the history
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="communication-history">
      <h3>WhatsApp Communication History</h3>

      {/* Message History */}
      <div className="messages">
        {communications.map((comm) => (
          <div
            key={comm.id}
            className={`message ${comm.direction.toLowerCase()}`}
          >
            <div className="message-content">{comm.content}</div>
            <div className="message-time">
              {new Date(comm.sentAt).toLocaleString()}
            </div>
            <div className="message-status">{comm.status}</div>
          </div>
        ))}
      </div>

      {/* Send New Message */}
      <div className="send-message">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your WhatsApp message..."
          rows={3}
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !newMessage.trim()}
        >
          {loading ? 'Sending...' : 'Send WhatsApp'}
        </button>
      </div>
    </div>
  );
};
```

## 📊 Database Structure

```sql
-- Communication table structure
CREATE TABLE "communications" (
  "id" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "jobId" TEXT,
  "type" "CommunicationType" NOT NULL,
  "direction" "CommunicationDirection" NOT NULL,
  "status" "CommunicationStatus" NOT NULL DEFAULT 'SENT',
  "content" TEXT NOT NULL,
  "subject" TEXT,
  "whatsappId" TEXT,
  "emailId" TEXT,
  "phoneNumber" TEXT,
  "metadata" JSONB,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deliveredAt" TIMESTAMP(3),
  "readAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "communications_pkey" PRIMARY KEY ("id")
);
```

## 🧪 Testing

1. **Start the server**: `npm run start:dev`
2. **Login to get token**: Use `/api/auth/login`
3. **Test endpoints**: Use the provided test script or curl commands
4. **Check database**: Verify communication records are created

## 🔐 Security

- ✅ JWT authentication required for all endpoints
- ✅ Company context validation (users can only access their company's data)
- ✅ Proper error handling without data leakage
- ✅ Input validation using class-validator

## 📈 Performance

- ✅ Database indexes on frequently queried fields
- ✅ Pagination for large datasets
- ✅ Efficient queries with proper relations
- ✅ Background WhatsApp sending (non-blocking)

## 🔄 Integration with Existing WhatsApp

The system seamlessly integrates with your existing WhatsApp service:

- Uses the same `WhatsAppService` and `TokenManagerService`
- Automatically creates communication records when messages are sent
- Tracks WhatsApp message IDs for delivery status
- Preserves existing WhatsApp functionality

This implementation provides a solid foundation for tracking and managing communications while maintaining simplicity and performance.
