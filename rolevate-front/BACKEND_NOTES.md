# Backend Integration Notes for NestJS Team

## Application Overview
**Rolevate** is an AI-powered recruitment platform with both individual and corporate features. The current frontend is a **Next.js 15** application with **React 19** using **TypeScript** and **Tailwind CSS**.

## Current Application State
⚠️ **Critical**: The frontend is currently in **prototype/mockup mode** with NO backend integration whatsoever. All functionality is simulated with hardcoded data.

## Architecture & Structure

### Frontend Framework
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Heroicons** for icons

### Application Structure
```
src/
├── app/
│   ├── (website)/           # Public website routes
│   │   ├── corporates/      # Corporate landing pages
│   │   ├── employers/       # Employer-specific pages
│   │   ├── jobs/           # Job listings and details
│   │   ├── login/          # Authentication
│   │   └── signup/         # User registration
│   └── dashboard/          # Protected dashboard area
├── components/
│   ├── common/             # Shared components
│   ├── corporate/          # Corporate-specific components
│   ├── dashboard/          # Dashboard components
│   ├── homepage/           # Homepage components
│   └── jobs/               # Job-related components
├── lib/                    # Utility functions
└── services/               # API service layer (EMPTY)
```

## Required Backend Endpoints

### 1. Authentication & Authorization
The frontend has login/signup forms for both individual and corporate users but **NO backend integration**.

#### Login Endpoint
- **Route**: `/auth/login`
- **Method**: POST
- **Frontend File**: `src/app/(website)/login/page.tsx:99-104`
- **Required Fields**:
  - Individual: `email`, `password`
  - Corporate: `username`, `password`
- **Response**: JWT token + user profile

#### Signup Endpoint
- **Route**: `/auth/register`
- **Method**: POST
- **Frontend File**: `src/app/(website)/signup/page.tsx:172-177`
- **Required Fields**:
  - Individual: `name`, `email`, `password`, `confirmPassword`
  - Corporate: `companyName`, `companyEmail`, `contactPerson`, `password`, `confirmPassword`
- **Response**: User created confirmation

### 2. Job Management System
Currently using hardcoded job data arrays.

#### Job Listings Endpoint
- **Route**: `/jobs`
- **Method**: GET
- **Frontend File**: `src/app/(website)/jobs/page.tsx:13-45`
- **Current Data Structure**:
```typescript
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  description: string;
  requirements: string[];
  benefits: string[];
  remote: boolean;
  urgent: boolean;
  featured: boolean;
}
```

#### Job Details Endpoint
- **Route**: `/jobs/:id`
- **Method**: GET
- **Frontend File**: `src/app/(website)/jobs/[id]/page.tsx`

#### Job Application Endpoint
- **Route**: `/jobs/:id/apply`
- **Method**: POST
- **Frontend File**: `src/app/(website)/jobs/[id]/apply/page.tsx:138-150`
- **Required Fields**:
  - `fullName`, `email`, `phone`, `experience`, `coverLetter`
  - CV file upload
- **Current Implementation**: Simulated with `setTimeout`

### 3. CV Analysis System
CV upload component exists but no backend processing.

#### CV Upload & Analysis Endpoint
- **Route**: `/cv/analyze`
- **Method**: POST
- **Frontend File**: `src/components/homepage/CVUploadSection.tsx`
- **Required**: File upload handling with AI analysis
- **Response**: Analysis results, job matching, scores

### 4. Dashboard System
Basic dashboard layout exists but no data integration.

#### Dashboard Data Endpoint
- **Route**: `/dashboard`
- **Method**: GET
- **Frontend File**: `src/app/dashboard/page.tsx`
- **Required**: User-specific dashboard data

### 5. Corporate Features
Corporate-specific components exist but no backend integration.

#### Corporate-specific Endpoints Needed
- Company profile management
- Bulk job posting
- Candidate management
- Analytics and reporting

## Missing API Infrastructure

### 1. Service Layer
- **No API service files exist** in `src/services/`
- Need to create:
  - `auth.service.ts`
  - `jobs.service.ts`
  - `cv.service.ts`
  - `dashboard.service.ts`

### 2. Environment Configuration
- **No `.env` files** found
- Need API base URLs, authentication keys

### 3. HTTP Client Setup
- **No axios or fetch wrappers** configured
- Need centralized HTTP client with interceptors

### 4. Error Handling
- **No error boundary components** implemented
- Need global error handling system

### 5. State Management
- **No global state management** (Redux, Zustand, etc.)
- Currently using local component state only

## Authentication Flow Requirements

### Current Implementation
- Forms exist but **no submit handlers**
- No JWT token management
- No protected route guards
- No session management

### Required Backend Features
1. **JWT-based authentication**
2. **Role-based access control** (Individual vs Corporate)
3. **Session management**
4. **Password reset functionality**
5. **Email verification**

## File Upload Requirements

### CV Upload System
- **Frontend**: File upload components exist
- **Backend Needed**: 
  - File storage (AWS S3, local storage)
  - File validation
  - CV parsing and analysis
  - AI integration for scoring

## Data Models Required

### User Model
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  type: 'individual' | 'corporate';
  // Corporate users
  companyName?: string;
  contactPerson?: string;
  // Individual users
  fullName?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Job Model
```typescript
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  remote: boolean;
  urgent: boolean;
  featured: boolean;
  postedBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}
```

### Application Model
```typescript
interface Application {
  id: string;
  jobId: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  experience: string;
  coverLetter: string;
  cvFile: string; // File path
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}
```

## Security Considerations

### Current Security Gaps
- **No authentication guards**
- **No input validation**
- **No CSRF protection**
- **No rate limiting**

### Required Security Features
1. **JWT token validation middleware**
2. **Input validation with DTOs**
3. **File upload security**
4. **Rate limiting**
5. **CORS configuration**

## Next Steps for Backend Team

### Priority 1: Core Authentication
1. Implement JWT authentication system
2. Create user registration/login endpoints
3. Set up role-based access control

### Priority 2: Job Management
1. Create job CRUD endpoints
2. Implement job search and filtering
3. Set up job application system

### Priority 3: File Upload System
1. Configure file storage
2. Implement CV upload endpoint
3. Create CV analysis pipeline

### Priority 4: Integration
1. Set up environment variables
2. Configure CORS for frontend
3. Create API documentation

## Frontend Integration Points

### Required Frontend Updates
Once backend is ready, frontend will need:
1. **API service layer** creation
2. **Environment configuration**
3. **Error handling** implementation
4. **Loading states** for all operations
5. **Authentication state management**

### Existing Frontend Assets
- ✅ Complete UI/UX components
- ✅ Responsive design
- ✅ Form validations (frontend only)
- ✅ Navigation structure
- ✅ Corporate/individual user flows

## Technology Stack Recommendations

### Backend (NestJS)
- **Authentication**: JWT with Passport
- **Database**: PostgreSQL with Prisma/TypeORM
- **File Storage**: AWS S3 or local storage
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI

### Integration
- **CORS**: Enable for frontend domain
- **Rate Limiting**: Implement for all endpoints
- **Error Handling**: Global exception filters
- **Logging**: Winston or similar

---

**Note**: This frontend is production-ready from a UI/UX perspective but requires complete backend integration to become functional. All current functionality is simulated and needs real API connections.