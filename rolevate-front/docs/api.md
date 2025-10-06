# API Documentation

## Overview

The Rolevate API provides comprehensive endpoints for managing recruitment workflows, user authentication, job postings, applications, and real-time communication.

**Base URL:** `http://localhost:4005/api` (Development)  
**Production URL:** `https://api.rolevate.com` (Production)

## Authentication

### JWT Token Authentication

All authenticated endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "employer|jobseeker",
    "profile": { ... }
  }
}
```

### Registration
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "employer",
  "firstName": "John",
  "lastName": "Doe"
}
```

## User Management

### Get Current User
```http
GET /users/me
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Software engineer with 5 years experience",
  "skills": ["JavaScript", "React", "Node.js"]
}
```

### Upload Profile Picture
```http
POST /users/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "avatar": <file>
}
```

## Job Management

### Create Job Posting
```http
POST /jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Senior React Developer",
  "department": "Engineering",
  "location": "Amman, Jordan",
  "type": "FULL_TIME",
  "salary": "5000-7000",
  "description": "We are looking for...",
  "requirements": "5+ years experience...",
  "skills": ["React", "TypeScript", "Node.js"],
  "deadline": "2024-12-31T23:59:59.000Z"
}
```

### Get Job Listings
```http
GET /jobs?page=1&limit=10&location=Amman&type=FULL_TIME
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `location` (string): Filter by location
- `type` (string): Job type (FULL_TIME, PART_TIME, CONTRACT)
- `skills` (string): Comma-separated skills
- `search` (string): Search in title and description

### Get Job Details
```http
GET /jobs/:jobId
```

### Update Job Posting
```http
PUT /jobs/:jobId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Job Title",
  "description": "Updated description..."
}
```

### Delete Job Posting
```http
DELETE /jobs/:jobId
Authorization: Bearer <token>
```

## Application Management

### Apply for Job
```http
POST /applications
Authorization: Bearer <token>
Content-Type: application/json

{
  "jobId": "job_id",
  "coverLetter": "I am interested in this position...",
  "cvId": "cv_id"
}
```

### Get Applications (Employer)
```http
GET /applications/employer?jobId=job_id&status=pending
Authorization: Bearer <token>
```

### Get Applications (Job Seeker)
```http
GET /applications/candidate
Authorization: Bearer <token>
```

### Update Application Status
```http
PUT /applications/:applicationId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "accepted|rejected|interview_scheduled",
  "feedback": "Great candidate, moving to next round"
}
```

## CV Management

### Upload CV
```http
POST /cv/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "cv": <file>,
  "title": "My Resume 2024"
}
```

### Get CVs
```http
GET /cv
Authorization: Bearer <token>
```

### Delete CV
```http
DELETE /cv/:cvId
Authorization: Bearer <token>
```

### Generate CV with AI
```http
POST /cv/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "jobTitle": "Software Engineer",
  "experience": "5 years",
  "skills": ["JavaScript", "React", "Node.js"],
  "template": "modern"
}
```

## Company Management

### Get Company Profile
```http
GET /company/profile
Authorization: Bearer <token>
```

### Update Company Profile
```http
PUT /company/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tech Company Inc",
  "description": "Leading technology company",
  "industry": "TECHNOLOGY",
  "size": "51-200",
  "website": "https://techcompany.com",
  "address": {
    "city": "Amman",
    "country": "JO"
  }
}
```

### Upload Company Logo
```http
POST /company/logo
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "logo": <file>
}
```

### Invite Team Member
```http
POST /company/invite
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "colleague@company.com",
  "role": "hr_manager|recruiter|admin"
}
```

## Interview Management

### Schedule Interview
```http
POST /interviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "applicationId": "application_id",
  "type": "video|phone|in_person",
  "scheduledAt": "2024-01-15T10:00:00.000Z",
  "duration": 60,
  "notes": "Technical interview with team lead"
}
```

### Get Interviews
```http
GET /interviews?date=2024-01-15&status=scheduled
Authorization: Bearer <token>
```

### Update Interview
```http
PUT /interviews/:interviewId
Authorization: Bearer <token>
Content-Type: application/json

{
  "scheduledAt": "2024-01-15T14:00:00.000Z",
  "status": "completed|cancelled|rescheduled"
}
```

### Join Interview Room
```http
GET /interviews/:interviewId/room
Authorization: Bearer <token>
```

## Real-time Communication

### WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:4005');

// Authentication
ws.send(JSON.stringify({
  type: 'auth',
  token: 'jwt_token'
}));

// Subscribe to notifications
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'notifications'
}));
```

### Send Message
```http
POST /messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "user_id",
  "content": "Hello, regarding the job application...",
  "type": "text|file|interview_invite"
}
```

### Get Messages
```http
GET /messages?conversationId=conversation_id&page=1&limit=50
Authorization: Bearer <token>
```

## Notifications

### Get Notifications
```http
GET /notifications?read=false&type=application
Authorization: Bearer <token>
```

### Mark as Read
```http
PUT /notifications/:notificationId/read
Authorization: Bearer <token>
```

### Mark All as Read
```http
PUT /notifications/read-all
Authorization: Bearer <token>
```

## Search & Filtering

### Search Jobs
```http
GET /search/jobs?q=react developer&location=amman&salary_min=3000&salary_max=8000
```

### Search Candidates (Employer only)
```http
GET /search/candidates?skills=react,typescript&experience_min=3&location=jordan
Authorization: Bearer <token>
```

### Advanced Search
```http
POST /search/advanced
Content-Type: application/json

{
  "type": "jobs|candidates",
  "filters": {
    "skills": ["React", "TypeScript"],
    "location": ["Amman", "Dubai"],
    "experience": {
      "min": 2,
      "max": 8
    },
    "salary": {
      "min": 3000,
      "max": 10000
    },
    "jobType": ["FULL_TIME", "REMOTE"]
  },
  "sort": {
    "field": "created_at|salary|relevance",
    "order": "asc|desc"
  },
  "page": 1,
  "limit": 20
}
```

## Analytics

### Get Dashboard Analytics
```http
GET /analytics/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalJobs": 25,
  "activeJobs": 18,
  "totalApplications": 247,
  "pendingApplications": 42,
  "interviewsThisWeek": 8,
  "topSkills": ["React", "JavaScript", "TypeScript"],
  "applicationTrends": [
    { "date": "2024-01-01", "count": 12 },
    { "date": "2024-01-02", "count": 15 }
  ]
}
```

### Get Job Analytics
```http
GET /analytics/jobs/:jobId
Authorization: Bearer <token>
```

## File Upload

### Upload File
```http
POST /upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <file>,
  "type": "cv|avatar|logo|document"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://cdn.rolevate.com/files/abc123.pdf",
  "fileId": "file_id",
  "originalName": "resume.pdf",
  "size": 1024000,
  "mimeType": "application/pdf"
}
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["Email is required"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid input data
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting

Most endpoints are rate-limited:
- **Authentication:** 5 requests per minute
- **File Upload:** 10 requests per hour
- **Search:** 100 requests per hour
- **General API:** 1000 requests per hour

Rate limit headers:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Webhooks

Configure webhooks to receive real-time notifications:

```http
POST /webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://yourapp.com/webhook",
  "events": ["application.created", "interview.scheduled"],
  "secret": "webhook_secret"
}
```

### Webhook Events
- `application.created`
- `application.status_changed`
- `interview.scheduled`
- `interview.completed`
- `job.created`
- `job.expired`
- `message.received`

## SDKs and Libraries

### JavaScript/TypeScript SDK
```bash
npm install @rolevate/sdk
```

```typescript
import { RolevateAPI } from '@rolevate/sdk';

const api = new RolevateAPI({
  baseURL: 'https://api.rolevate.com',
  apiKey: 'your_api_key'
});

// Get jobs
const jobs = await api.jobs.list({
  location: 'Amman',
  type: 'FULL_TIME'
});
```

## Postman Collection

Import our Postman collection for easy API testing:
[Download Collection](https://api.rolevate.com/postman/collection.json)

## Support

For API support and questions:
- 📧 Email: api-support@rolevate.com
- 📖 Documentation: https://docs.rolevate.com
- 🐛 Issues: https://github.com/rolevate/issues

---

*Last updated: January 2024*