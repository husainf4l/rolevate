# Backend API Requirements for Rolevate Dashboard

Based on the frontend services and types, here are the missing backend endpoints and features needed:

## 1. Authentication & User Management

### Endpoints Required:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/refresh` - Refresh authentication token
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### Database Schema:
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER' CHECK (role IN ('USER', 'BUSINESS', 'ADMIN')),
    isEmailVerified BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);
```

## 2. Job Management System

### Endpoints Required:
- `GET /api/jobs` - List jobs with filters
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create new job (business users)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/search` - Advanced job search

### Database Schema:
```sql
-- Jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    titleAr VARCHAR(255),
    description TEXT NOT NULL,
    descriptionAr TEXT,
    company VARCHAR(255) NOT NULL,
    companyAr VARCHAR(255),
    location VARCHAR(255) NOT NULL,
    locationAr VARCHAR(255),
    jobType VARCHAR(50) NOT NULL CHECK (jobType IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE', 'INTERNSHIP')),
    experienceLevel VARCHAR(50) CHECK (experienceLevel IN ('ENTRY', 'MID', 'SENIOR', 'EXECUTIVE')),
    salaryMin INTEGER,
    salaryMax INTEGER,
    currency VARCHAR(10) DEFAULT 'USD',
    requirements TEXT[],
    benefits TEXT[],
    skills TEXT[],
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'DRAFT')),
    applicationDeadline TIMESTAMP,
    postedBy UUID REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);
```

## 3. Job Applications System

### Endpoints Required:
- `GET /api/applications` - Get user's applications
- `POST /api/applications` - Apply to a job
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Withdraw application
- `GET /api/applications/stats` - Get application statistics

### Database Schema:
```sql
-- Applications table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jobId UUID REFERENCES jobs(id),
    userId UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
    coverLetter TEXT,
    resumeUrl VARCHAR(500),
    notes TEXT,
    appliedAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    UNIQUE(jobId, userId)
);
```

## 4. Saved Jobs System

### Endpoints Required:
- `GET /api/saved-jobs` - Get saved jobs
- `POST /api/saved-jobs` - Save a job
- `DELETE /api/saved-jobs/:id` - Remove saved job

### Database Schema:
```sql
-- Saved Jobs table
CREATE TABLE saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jobId UUID REFERENCES jobs(id),
    userId UUID REFERENCES users(id),
    notes TEXT,
    savedAt TIMESTAMP DEFAULT NOW(),
    UNIQUE(jobId, userId)
);
```

## 5. Messaging System

### Endpoints Required:
- `GET /api/conversations` - Get user conversations
- `GET /api/conversations/:id/messages` - Get conversation messages
- `POST /api/conversations` - Create new conversation
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark message as read
- `GET /api/messages/unread-count` - Get unread messages count

### Database Schema:
```sql
-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jobId UUID REFERENCES jobs(id),
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- Conversation Participants table
CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversationId UUID REFERENCES conversations(id),
    userId UUID REFERENCES users(id),
    joinedAt TIMESTAMP DEFAULT NOW(),
    UNIQUE(conversationId, userId)
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversationId UUID REFERENCES conversations(id),
    senderId UUID REFERENCES users(id),
    content TEXT NOT NULL,
    messageType VARCHAR(20) DEFAULT 'TEXT' CHECK (messageType IN ('TEXT', 'IMAGE', 'FILE', 'SYSTEM')),
    fileUrl VARCHAR(500),
    fileName VARCHAR(255),
    fileSize INTEGER,
    isRead BOOLEAN DEFAULT FALSE,
    readAt TIMESTAMP,
    sentAt TIMESTAMP DEFAULT NOW(),
    editedAt TIMESTAMP
);
```

## 6. Notifications System

### Endpoints Required:
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification (system)
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count

### Database Schema:
```sql
-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    titleAr VARCHAR(255),
    message TEXT NOT NULL,
    messageAr TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('JOB_ALERT', 'APPLICATION_UPDATE', 'MESSAGE', 'SYSTEM', 'REMINDER')),
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    isRead BOOLEAN DEFAULT FALSE,
    readAt TIMESTAMP,
    actionUrl VARCHAR(500),
    relatedEntityId UUID,
    relatedEntityType VARCHAR(50),
    createdAt TIMESTAMP DEFAULT NOW()
);
```

## 7. User Profile & CV System

### Endpoints Required:
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `GET /api/cv` - Get user CV data
- `PUT /api/cv` - Update CV data
- `POST /api/cv/upload` - Upload CV file
- `GET /api/profile/completion` - Get profile completion percentage

### Database Schema:
```sql
-- User Profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID REFERENCES users(id) UNIQUE,
    bio TEXT,
    bioAr TEXT,
    phone VARCHAR(50),
    location VARCHAR(255),
    locationAr VARCHAR(255),
    linkedinUrl VARCHAR(500),
    githubUrl VARCHAR(500),
    portfolioUrl VARCHAR(500),
    skills TEXT[],
    languages TEXT[],
    availabilityStatus VARCHAR(30) DEFAULT 'AVAILABLE' CHECK (availabilityStatus IN ('AVAILABLE', 'NOT_AVAILABLE', 'OPEN_TO_OFFERS')),
    preferredJobTypes TEXT[],
    preferredLocations TEXT[],
    salaryMin INTEGER,
    salaryMax INTEGER,
    salaryCurrency VARCHAR(10),
    profileCompletion INTEGER DEFAULT 0,
    lastActive TIMESTAMP DEFAULT NOW(),
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- Work Experience table
CREATE TABLE work_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID REFERENCES users(id),
    company VARCHAR(255) NOT NULL,
    companyAr VARCHAR(255),
    position VARCHAR(255) NOT NULL,
    positionAr VARCHAR(255),
    startDate DATE NOT NULL,
    endDate DATE,
    current BOOLEAN DEFAULT FALSE,
    description TEXT,
    descriptionAr TEXT,
    location VARCHAR(255),
    locationAr VARCHAR(255),
    createdAt TIMESTAMP DEFAULT NOW()
);

-- Education table
CREATE TABLE education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID REFERENCES users(id),
    institution VARCHAR(255) NOT NULL,
    institutionAr VARCHAR(255),
    degree VARCHAR(255) NOT NULL,
    degreeAr VARCHAR(255),
    field VARCHAR(255),
    fieldAr VARCHAR(255),
    startDate DATE NOT NULL,
    endDate DATE,
    gpa VARCHAR(10),
    description TEXT,
    descriptionAr TEXT,
    location VARCHAR(255),
    locationAr VARCHAR(255),
    createdAt TIMESTAMP DEFAULT NOW()
);

-- Certifications table
CREATE TABLE certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    nameAr VARCHAR(255),
    issuer VARCHAR(255) NOT NULL,
    issuerAr VARCHAR(255),
    issueDate DATE NOT NULL,
    expiryDate DATE,
    credentialId VARCHAR(255),
    credentialUrl VARCHAR(500),
    description TEXT,
    descriptionAr TEXT,
    createdAt TIMESTAMP DEFAULT NOW()
);
```

## 8. Business Dashboard Endpoints

### Endpoints Required:
- `GET /api/business/jobs` - Get business posted jobs
- `GET /api/business/applications` - Get applications for business jobs
- `PUT /api/business/applications/:id` - Update application status
- `GET /api/business/stats` - Get business dashboard statistics
- `GET /api/business/candidates` - Search candidates
- `POST /api/business/invitations` - Send candidate invitations

## 9. File Upload & Storage

### Endpoints Required:
- `POST /api/upload/resume` - Upload resume file
- `POST /api/upload/profile-image` - Upload profile image
- `POST /api/upload/company-logo` - Upload company logo
- `DELETE /api/upload/:fileId` - Delete uploaded file

## 10. API Features to Implement

### Authentication Middleware:
- JWT token validation
- Role-based access control
- Rate limiting
- CORS configuration

### Search & Filtering:
- Full-text search for jobs
- Location-based filtering
- Salary range filtering
- Experience level filtering
- Skills-based matching

### Email Services:
- Welcome emails
- Application confirmations
- Password reset emails
- Job alerts
- Interview invitations

### Analytics & Reporting:
- User activity tracking
- Job posting analytics
- Application success rates
- Popular skills tracking

## 11. Environment Variables Required:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/rolevate
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=rolevate-uploads
AWS_REGION=us-east-1

# External APIs
OPENAI_API_KEY=your-openai-key (for AI features)
```

## 12. Priority Implementation Order:

1. **High Priority** (Core functionality):
   - Authentication system
   - User profiles
   - Job management
   - Job applications

2. **Medium Priority** (Enhanced features):
   - Messaging system
   - Notifications
   - Saved jobs

3. **Low Priority** (Nice to have):
   - Advanced analytics
   - AI-powered matching
   - Email campaigns
   - Advanced search filters

This backend will provide all the APIs needed to fully support the dashboard functionality and remove all demo data dependencies.