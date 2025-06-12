# Rolevate Backend API Documentation

**Base URL:** `http://localhost:4005/api`

This document provides a comprehensive overview of all available API endpoints and their corresponding DTOs for the Rolevate frontend application.

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Company APIs](#company-apis)
3. [Job Posts APIs](#job-posts-apis)
4. [Applications APIs](#applications-apis)
5. [Candidates APIs](#candidates-apis)
6. [CV Analysis APIs](#cv-analysis-apis)
7. [Interview APIs](#interview-apis)
8. [Notifications APIs](#notifications-apis)
9. [Common DTOs & Enums](#common-dtos--enums)
10. [Authorization & Guards](#authorization--guards)

---

## Authentication APIs

**Base Route:** `/api/auth`

### POST `/api/auth/register`

- **Purpose:** Register a new user
- **Auth Required:** No
- **Body:** `RegisterDto`
- **Response:** `AuthResult`

### POST `/api/auth/login`

- **Purpose:** User login
- **Auth Required:** No
- **Body:** `LoginDto`
- **Response:** `AuthResult`

### POST `/api/auth/create-company`

- **Purpose:** Create a new company (authenticated users only)
- **Auth Required:** Yes (JWT)
- **Body:** `CreateCompanyDto`
- **Response:** `Company`

### GET `/api/auth/profile`

- **Purpose:** Get current user profile
- **Auth Required:** Yes (JWT)
- **Response:** `User` (without password)

### POST `/api/auth/refresh`

- **Purpose:** Refresh JWT token
- **Auth Required:** Yes (JWT)
- **Response:** `{ access_token: string }`

### PATCH `/api/auth/change-password`

- **Purpose:** Change user password
- **Auth Required:** Yes (JWT)
- **Body:** `ChangePasswordDto`
- **Response:** `{ message: string }`

### GET `/api/auth/me`

- **Purpose:** Get current authenticated user
- **Auth Required:** Yes (JWT)
- **Response:** `{ user: User }`

### GET `/api/auth/company`

- **Purpose:** Get user's company with subscription
- **Auth Required:** Yes (JWT)
- **Response:** `Company` with subscription details

### GET `/api/auth/subscription/status`

- **Purpose:** Check subscription status
- **Auth Required:** Yes (JWT)
- **Response:** `{ isActive: boolean, subscription?: Subscription }`

### POST `/api/auth/subscription/upgrade`

- **Purpose:** Upgrade subscription plan
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, SUPER_ADMIN
- **Body:** `{ plan: SubscriptionPlan }`
- **Response:** Updated subscription

### GET `/api/auth/subscription/limits`

- **Purpose:** Get subscription limits and usage
- **Auth Required:** Yes (JWT)
- **Response:** Subscription limits with usage statistics

---

## Company APIs

**Base Route:** `/api/companies`

### POST `/api/companies`

- **Purpose:** Create a new company (Super Admin only)
- **Auth Required:** Yes (JWT) + Role: SUPER_ADMIN
- **Body:** `CreateCompanyDto`
- **Response:** `Company`

### GET `/api/companies`

- **Purpose:** Get all companies (Super Admin only)
- **Auth Required:** Yes (JWT) + Role: SUPER_ADMIN
- **Query:** `CompanyQueryDto`
- **Response:** `Company[]`

### GET `/api/companies/my-company`

- **Purpose:** Get current user's company
- **Auth Required:** Yes (JWT)
- **Response:** `Company`

### GET `/api/companies/my-company/stats`

- **Purpose:** Get current user's company statistics
- **Auth Required:** Yes (JWT)
- **Response:** Company statistics

### GET `/api/companies/my-company/users`

- **Purpose:** Get users in current user's company
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER
- **Response:** `User[]`

### GET `/api/companies/my-company/job-posts`

- **Purpose:** Get job posts for current user's company
- **Auth Required:** Yes (JWT)
- **Response:** `JobPost[]`

### GET `/api/companies/:id`

- **Purpose:** Get company by ID (Super Admin only)
- **Auth Required:** Yes (JWT) + Role: SUPER_ADMIN
- **Response:** `Company`

### GET `/api/companies/:id/stats`

- **Purpose:** Get company statistics by ID (Super Admin only)
- **Auth Required:** Yes (JWT) + Role: SUPER_ADMIN
- **Response:** Company statistics

### GET `/api/companies/:id/users`

- **Purpose:** Get company users by ID (Super Admin only)
- **Auth Required:** Yes (JWT) + Role: SUPER_ADMIN
- **Response:** `User[]`

### GET `/api/companies/:id/job-posts`

- **Purpose:** Get company job posts by ID (Super Admin only)
- **Auth Required:** Yes (JWT) + Role: SUPER_ADMIN
- **Response:** `JobPost[]`

### PATCH `/api/companies/my-company`

- **Purpose:** Update current user's company
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN
- **Body:** `UpdateCompanyDto`
- **Response:** `Company`

### PATCH `/api/companies/:id`

- **Purpose:** Update company by ID (Super Admin only)
- **Auth Required:** Yes (JWT) + Role: SUPER_ADMIN
- **Body:** `UpdateCompanyDto`
- **Response:** `Company`

### DELETE `/api/companies/:id`

- **Purpose:** Delete company by ID (Super Admin only)
- **Auth Required:** Yes (JWT) + Role: SUPER_ADMIN
- **Response:** Success message

---

## Job Posts APIs

**Base Route:** `/api/jobposts`

### POST `/api/jobposts`

- **Purpose:** Create a new job post
- **Auth Required:** Yes (JWT) + Subscription Guard
- **Body:** `CreateJobPostDto`
- **Response:** `JobPost`

### GET `/api/jobposts`

- **Purpose:** Get all job posts (public)
- **Auth Required:** No
- **Query:** `JobPostQueryDto`
- **Response:** `JobPost[]`

### GET `/api/jobposts/company/:companyId`

- **Purpose:** Get job posts by company ID (public)
- **Auth Required:** No
- **Query:** `JobPostQueryDto`
- **Response:** `JobPost[]`

### GET `/api/jobposts/my-company`

- **Purpose:** Get job posts for current user's company
- **Auth Required:** Yes (JWT)
- **Query:** `JobPostQueryDto`
- **Response:** `JobPost[]`

### GET `/api/jobposts/:id`

- **Purpose:** Get job post by ID (public)
- **Auth Required:** No
- **Response:** `JobPost`

### PATCH `/api/jobposts/:id`

- **Purpose:** Update job post
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Body:** `UpdateJobPostDto`
- **Response:** `JobPost`

### DELETE `/api/jobposts/:id`

- **Purpose:** Delete job post
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Response:** Success message

### GET `/api/jobposts/:id/applications`

- **Purpose:** Get applications for a job post
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Response:** `Application[]`

---

## Applications APIs

**Base Route:** `/api/applications`

### POST `/api/applications`

- **Purpose:** Create a new application (public)
- **Auth Required:** No
- **Body:** `CreateApplicationDto`
- **Response:** `Application`

### GET `/api/applications`

- **Purpose:** Get all applications
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Query:** `ApplicationQueryDto`
- **Response:** `Application[]`

### GET `/api/applications/my-company`

- **Purpose:** Get applications for current user's company
- **Auth Required:** Yes (JWT)
- **Query:** `ApplicationQueryDto`
- **Response:** `Application[]`

### GET `/api/applications/candidate/:candidateId`

- **Purpose:** Get applications by candidate ID
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Response:** `Application[]`

### GET `/api/applications/jobpost/:jobPostId`

- **Purpose:** Get applications by job post ID
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Response:** `Application[]`

### GET `/api/applications/:id`

- **Purpose:** Get application by ID
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Response:** `Application`

### PATCH `/api/applications/:id`

- **Purpose:** Update application
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Body:** `UpdateApplicationDto`
- **Response:** `Application`

### DELETE `/api/applications/:id`

- **Purpose:** Delete application
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER
- **Response:** Success message

---

## Candidates APIs

**Base Route:** `/api/candidates`

### POST `/api/candidates`

- **Purpose:** Create a new candidate
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Body:** `CreateCandidateDto`
- **Response:** `Candidate`

### GET `/api/candidates`

- **Purpose:** Get all candidates
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Query:** `CandidateQueryDto`
- **Response:** `Candidate[]`

### GET `/api/candidates/phone/:phoneNumber`

- **Purpose:** Find candidate by phone number
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Response:** `Candidate`

### GET `/api/candidates/:id`

- **Purpose:** Get candidate by ID
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Response:** `Candidate`

### PATCH `/api/candidates/:id`

- **Purpose:** Update candidate
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Body:** `UpdateCandidateDto`
- **Response:** `Candidate`

### DELETE `/api/candidates/:id`

- **Purpose:** Delete candidate
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER
- **Response:** Success message

### GET `/api/candidates/:id/applications`

- **Purpose:** Get candidate's applications
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Response:** `Application[]`

### GET `/api/candidates/:id/interviews`

- **Purpose:** Get candidate's interviews
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Response:** `Interview[]`

---

## CV Analysis APIs

**Base Route:** `/api/cv-analysis`

### POST `/api/cv-analysis`

- **Purpose:** Create CV analysis
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Body:** `CreateCvAnalysisDto`
- **Response:** `CvAnalysis`

### GET `/api/cv-analysis`

- **Purpose:** Get all CV analyses
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Query:** `CvAnalysisQueryDto`
- **Response:** `CvAnalysis[]`

### GET `/api/cv-analysis/my-company`

- **Purpose:** Get CV analyses for current user's company
- **Auth Required:** Yes (JWT)
- **Query:** `CvAnalysisQueryDto`
- **Response:** `CvAnalysis[]`

### GET `/api/cv-analysis/candidate/:candidateId`

- **Purpose:** Get CV analyses by candidate ID
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Response:** `CvAnalysis[]`

### GET `/api/cv-analysis/application/:applicationId`

- **Purpose:** Get CV analyses by application ID
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Response:** `CvAnalysis[]`

### GET `/api/cv-analysis/:id`

- **Purpose:** Get CV analysis by ID
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Response:** `CvAnalysis`

### PATCH `/api/cv-analysis/:id`

- **Purpose:** Update CV analysis
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Body:** `UpdateCvAnalysisDto`
- **Response:** `CvAnalysis`

### DELETE `/api/cv-analysis/:id`

- **Purpose:** Delete CV analysis
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER
- **Response:** Success message

---

## Interview APIs

**Base Route:** `/api/interview`

### POST `/api/interview/create`

- **Purpose:** Create interview session (authenticated)
- **Auth Required:** Yes (JWT) + Role: SUPER_ADMIN, COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Body:** `CreateInterviewDto`
- **Response:** Interview session details with LiveKit token

### POST `/api/interview/join`

- **Purpose:** Join interview session (public - for candidates)
- **Auth Required:** No
- **Body:** `CreateInterviewDto`
- **Response:** Interview session details with LiveKit token

### GET `/api/interview/my-interviews`

- **Purpose:** Get interviews for authenticated user
- **Auth Required:** Yes (JWT)
- **Response:** `Interview[]`

---

## Notifications APIs

**Base Route:** `/api/notifications`

### POST `/api/notifications`

- **Purpose:** Create notification
- **Auth Required:** Yes (JWT) + Role: COMPANY_ADMIN, HR_MANAGER, RECRUITER
- **Body:** `CreateNotificationDto`
- **Response:** `Notification`

### GET `/api/notifications`

- **Purpose:** Get all notifications (Super Admin only)
- **Auth Required:** Yes (JWT) + Role: SUPER_ADMIN
- **Query:** `NotificationQueryDto`
- **Response:** `Notification[]`

### GET `/api/notifications/my-notifications`

- **Purpose:** Get current user's notifications
- **Auth Required:** Yes (JWT)
- **Query:** `NotificationQueryDto`
- **Response:** `Notification[]`

### GET `/api/notifications/unread-count`

- **Purpose:** Get unread notifications count
- **Auth Required:** Yes (JWT)
- **Response:** `{ count: number }`

### PATCH `/api/notifications/mark-all-read`

- **Purpose:** Mark all notifications as read
- **Auth Required:** Yes (JWT)
- **Response:** Success message

### DELETE `/api/notifications/delete-all-read`

- **Purpose:** Delete all read notifications
- **Auth Required:** Yes (JWT)
- **Response:** Success message

### GET `/api/notifications/:id`

- **Purpose:** Get notification by ID
- **Auth Required:** Yes (JWT)
- **Response:** `Notification`

### PATCH `/api/notifications/:id`

- **Purpose:** Update notification
- **Auth Required:** Yes (JWT)
- **Body:** `UpdateNotificationDto`
- **Response:** `Notification`

### PATCH `/api/notifications/:id/mark-read`

- **Purpose:** Mark notification as read
- **Auth Required:** Yes (JWT)
- **Response:** `Notification`

### DELETE `/api/notifications/:id`

- **Purpose:** Delete notification
- **Auth Required:** Yes (JWT)
- **Response:** Success message

---

## Common DTOs & Enums

### User Roles (`UserRole`)

```typescript
enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  HR_MANAGER = 'HR_MANAGER',
  RECRUITER = 'RECRUITER',
}
```

### Subscription Plans (`SubscriptionPlan`)

```typescript
enum SubscriptionPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}
```

### Application Status (`ApplicationStatus`)

```typescript
enum ApplicationStatus {
  PENDING = 'PENDING',
  SCREENING = 'SCREENING',
  INTERVIEWED = 'INTERVIEWED',
  SHORTLISTED = 'SHORTLISTED',
  REJECTED = 'REJECTED',
  HIRED = 'HIRED',
}
```

### Experience Levels (`ExperienceLevel`)

```typescript
enum ExperienceLevel {
  ENTRY = 'ENTRY',
  JUNIOR = 'JUNIOR',
  MID = 'MID',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
  EXECUTIVE = 'EXECUTIVE',
}
```

### Work Types (`WorkType`)

```typescript
enum WorkType {
  REMOTE = 'REMOTE',
  ONSITE = 'ONSITE',
  HYBRID = 'HYBRID',
}
```

### Interview Languages (`InterviewLanguage`)

```typescript
enum InterviewLanguage {
  ENGLISH = 'ENGLISH',
  ARABIC = 'ARABIC',
  FRENCH = 'FRENCH',
  SPANISH = 'SPANISH',
}
```

### Key DTOs

#### `RegisterDto`

```typescript
{
  email: string;
  username: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  password: string;
  phoneNumber?: string;
  role?: UserRole;
  companyId?: string;
}
```

#### `LoginDto`

```typescript
{
  identifier: string; // email or username
  password: string;
}
```

#### `CreateCompanyDto`

```typescript
{
  name: string;
  displayName?: string;
  industry?: string;
  description?: string;
  website?: string;
  location?: string;
  country?: string;
  city?: string;
  size?: CompanySize;
  subscriptionPlan?: SubscriptionPlan;
}
```

#### `CreateJobPostDto`

```typescript
{
  title: string;
  description: string;
  requirements: string;
  responsibilities?: string;
  benefits?: string;
  skills: string[];
  experienceLevel: ExperienceLevel;
  location?: string;
  workType?: WorkType;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  enableAiInterview?: boolean;
  interviewLanguages?: InterviewLanguage[];
  interviewDuration?: number;
  aiPrompt?: string;
  aiInstructions?: string;
}
```

#### `CreateApplicationDto`

```typescript
{
  jobPostId: string;
  candidateId: string;
  cvUrl?: string;
  cvFileName?: string;
  coverLetter?: string;
}
```

#### `CreateCandidateDto`

```typescript
{
  phoneNumber: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  dateOfBirth?: Date;
  nationality?: string;
  currentLocation?: string;
  preferredLocation?: string;
  linkedinProfile?: string;
  githubProfile?: string;
  portfolioUrl?: string;
  skills?: string[];
  experience?: object;
  education?: object;
  languages?: object;
  expectedSalary?: number;
  currentSalary?: number;
  noticePeriod?: number;
  availability?: AvailabilityStatus;
}
```

---

## Authorization & Guards

### JWT Authentication

- All protected endpoints require a valid JWT token in the Authorization header: `Bearer <token>`
- Token can be obtained through login endpoint
- Token can be refreshed using the refresh endpoint

### Role-Based Access Control (RBAC)

The system uses role-based permissions:

- **SUPER_ADMIN**: Full system access
- **COMPANY_ADMIN**: Company-wide management
- **HR_MANAGER**: HR operations within company
- **RECRUITER**: Basic recruitment operations

### Subscription Guards

Some endpoints are protected by subscription limits:

- Job post creation requires active subscription
- Advanced features may require higher-tier subscriptions

### Company Context

Many endpoints automatically filter data based on the user's company association, ensuring data isolation between companies.

---

## Static Assets

### File Uploads

- **CV Files**: `/uploads/cvs/`
- **Audio Files**: `/audio-files/`
- **Public Files**: `/public/`

### File Access

Files can be accessed via:

- `GET /uploads/cvs/{filename}` - CV files
- `GET /audio-files/{filename}` - Audio interview files
- `GET /public/{filename}` - Public assets

---

## Health Check & Info

### GET `/api/health`

- **Purpose:** API health check
- **Auth Required:** No
- **Response:** `{ status: "ok", timestamp: string, service: string }`

### GET `/api/info`

- **Purpose:** API information and available endpoints
- **Auth Required:** No
- **Response:** API metadata and endpoint list

---

## Error Handling

### Standard Error Response

```typescript
{
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp: string;
  path: string;
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

---

## Query Parameters

Most list endpoints support filtering and pagination through query parameters:

```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  // Entity-specific filters...
}
```

---

## Notes for Frontend Development

1. **Authentication Flow**: Store JWT token securely and include in all authenticated requests
2. **Role Checking**: Check user role before showing/hiding UI elements
3. **Company Context**: Most data operations are scoped to the user's company
4. **File Uploads**: Handle multipart/form-data for CV and image uploads
5. **Real-time Updates**: Consider implementing WebSocket connections for notifications
6. **Error Handling**: Implement global error handling for API responses
7. **Loading States**: Handle async operations with proper loading indicators
8. **Pagination**: Implement pagination for list views to handle large datasets

---

**Last Updated:** June 12, 2025
**API Version:** 1.0.0
**Base URL:** http://localhost:4005/api
