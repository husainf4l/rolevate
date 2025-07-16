# Communication System API

## Overview

Simple communication system for tracking WhatsApp messages and other communications between companies and candidates.

## Database Schema

The system adds a `Communications` table with the following structure:

- **id**: Unique identifier
- **candidateId**: Reference to candidate
- **companyId**: Reference to company
- **jobId**: Optional reference to specific job
- **type**: WHATSAPP, EMAIL, PHONE, SMS
- **direction**: INBOUND, OUTBOUND
- **status**: SENT, DELIVERED, READ, FAILED
- **content**: Message content
- **subject**: Optional subject (for emails)
- **whatsappId**: External WhatsApp message ID
- **phoneNumber**: Phone number used
- **sentAt, deliveredAt, readAt**: Timestamps

## API Endpoints

### 1. Get Communication History

```
GET /api/communications/history/:candidateId?jobId=jobId
```

Returns all communications between company and specific candidate.

**Example Response:**

```json
[
  {
    "id": "comm123",
    "type": "WHATSAPP",
    "direction": "OUTBOUND",
    "content": "Hello! We received your application...",
    "status": "DELIVERED",
    "sentAt": "2025-01-15T10:30:00Z",
    "candidate": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
]
```

### 2. Send WhatsApp Message

```
POST /api/communications/send-whatsapp
```

**Request Body:**

```json
{
  "candidateId": "candidate-123",
  "content": "Thank you for your application! We will review it shortly.",
  "jobId": "job-456" // optional
}
```

**Response:**

```json
{
  "communication": {
    "id": "comm-789",
    "type": "WHATSAPP",
    "status": "SENT",
    "content": "Thank you for your application!",
    "sentAt": "2025-01-15T14:20:00Z"
  },
  "whatsappResult": {
    "messages": [{ "id": "wamid.xxx" }]
  }
}
```

### 3. Get All Communications (Paginated)

```
GET /api/communications?page=1&limit=20&candidateId=123&type=WHATSAPP
```

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `candidateId`: Filter by candidate
- `jobId`: Filter by job
- `type`: Filter by communication type
- `status`: Filter by status
- `dateFrom`, `dateTo`: Date range filter

### 4. Get Communication Stats

```
GET /api/communications/stats?dateFrom=2025-01-01&dateTo=2025-01-31
```

**Response:**

```json
{
  "total": 150,
  "byType": {
    "WHATSAPP": 120,
    "EMAIL": 30
  },
  "byStatus": {
    "SENT": 140,
    "DELIVERED": 130,
    "READ": 80,
    "FAILED": 10
  }
}
```

### 5. Get Single Communication

```
GET /api/communications/:id
```

### 6. Create Communication Record

```
POST /api/communications
```

**Request Body:**

```json
{
  "candidateId": "candidate-123",
  "type": "WHATSAPP",
  "direction": "OUTBOUND",
  "content": "Message content here",
  "jobId": "job-456" // optional
}
```

## Authentication

All endpoints require JWT authentication with a company context. The user must be associated with a company.

## Example Usage in Frontend

### Fetch WhatsApp History

```javascript
// Get communication history for a candidate
const response = await fetch('/api/communications/history/candidate-123', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
const history = await response.json();
```

### Send WhatsApp Message

```javascript
// Send a new WhatsApp message
const response = await fetch('/api/communications/send-whatsapp', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    candidateId: 'candidate-123',
    content: 'Thank you for your interest! We will be in touch soon.',
    jobId: 'job-456',
  }),
});
const result = await response.json();
```

## Integration with Existing WhatsApp Service

The system integrates with your existing WhatsApp service:

- Uses existing `WhatsAppService` for sending messages
- Automatically creates communication records when messages are sent
- Tracks delivery status and message IDs

## Error Handling

- Returns 404 if candidate/company/job not found
- Returns 400 if candidate has no phone number for WhatsApp
- Creates failed communication record if WhatsApp send fails
- Proper error messages for debugging

## Database Migration

Run the migration to create the communications table:

```bash
npx prisma migrate dev --name add-communication-system
```
