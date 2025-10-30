# Rolevate Backend - Logic Report & TODO List

**Generated:** October 30, 2025  
**Project:** Rolevate v7 Backend (NestJS + GraphQL + TypeORM + PostgreSQL)

---

## Executive Summary

Rolevate is a sophisticated **AI-powered recruitment platform** with real-time video interviews, CV analysis, and automated communication workflows. The system involves:
- **3 core user types**: Candidates (job seekers), Business (recruiters), Admin, System
- **Multi-stage recruitment pipeline**: Job posting → Application → Interview → Hire decision
- **AI & ML integration**: CV analysis via FastAPI, AI interviewers, automated notifications
- **Real-time communication**: LiveKit video interviews, WhatsApp/SMS/Email notifications
- **Message queuing**: BullMQ for async processing (emails, SMS, CV analysis)

---

## Architecture Overview

### Technology Stack
- **Framework**: NestJS 11 + TypeScript 5
- **API**: GraphQL (Apollo Server 5) + REST (Fastify)
- **Database**: PostgreSQL 13+ with TypeORM + Migrations
- **Real-time**: LiveKit (video conferencing), WebSockets
- **Message Queue**: BullMQ + Redis
- **External Services**: OpenAI, AWS S3/SES, Mailgun, Twilio, Google Drive, Tesseract OCR
- **Authentication**: JWT + API Keys + Role-based Guards
- **Caching**: Redis Cache Manager

### Module Structure
```
Core Modules:
├── User (authentication, profiles, API keys)
├── Auth (login, JWT, password reset, permissions)
├── Candidate (candidate profiles, education, work experience)
├── Company (organization info, team management)
├── Job (job postings, filtering, search)
├── Application (job applications, CV analysis, notes)
├── Interview (video interviews, transcripts, feedback)
├── Communication (email, SMS, WhatsApp logs)
├── Notification (system notifications, user preferences)
├── Queue (BullMQ job processing)
├── LiveKit (real-time video rooms)
├── Services (external API integration)
└── Common (shared utilities, guards, filters, decorators)
```

---

## Core Business Logic

### 1. **Recruitment Pipeline** 
**Status**: Implementation in progress

#### Job Lifecycle
```
DRAFT → ACTIVE → (PAUSED) → (CLOSED / EXPIRED) → DELETED
```

**Key Logic**:
- Jobs created by BUSINESS users for their company
- ACTIVE jobs visible to candidates for applications
- Job search with filters: title, location, job type, level, work type
- Auto-expire jobs based on deadline

**TODO**:
- [ ] Implement job auto-expiration (scheduled task)
- [ ] Add full-text search for job titles and descriptions
- [ ] Implement job recommendation engine based on candidate profiles
- [ ] Add job analytics (views, applications, conversion rates)

#### Application Workflow
```
PENDING → REVIEWED → SHORTLISTED → INTERVIEWED → OFFERED → HIRED / REJECTED / WITHDRAWN
                                  ↓
                              ANALYZED (CV Analysis Stage)
```

**Key Logic**:
1. **Create Application**
   - Candidates apply via job ID
   - Duplicate application prevention (one per candidate per job)
   - Resume URL validation
   - Auto-trigger CV analysis if resume exists
   - Send interview room link to candidate
   - Notify company users about new application

2. **Status Updates**
   - Track status transitions in audit logs
   - Update timestamps for each status change
   - Calculate scoring metrics (CV score, fit score)

3. **CV Analysis Integration**
   - Async job added to BullMQ queue
   - FastAPI service analyzes CV against job requirements
   - Returns: skillMatch, experienceMatch, qualificationMatch, overallScore

**TODO**:
- [ ] Implement CV analysis result validation and error handling
- [ ] Add application bulk status updates (for batch processing)
- [ ] Implement application filtering/search with pagination
- [ ] Add application cancellation logic (with company approval)
- [ ] Create application export functionality (CSV/PDF)
- [ ] Add application duplicate detection based on email similarity

---

### 2. **Interview Management**
**Status**: Core features implemented, edge cases need handling

#### Interview Lifecycle
```
SCHEDULED → COMPLETED / CANCELLED / NO_SHOW
```

**Key Logic**:
1. **Room Creation**
   - On-demand LiveKit room creation per interview
   - Room metadata includes: applicationId, candidateId, interviewerId, jobId
   - Room auto-deletes after 10 minutes of inactivity
   - Max 2 participants per room

2. **Interview Flow**
   - Interviewer creates interview → room is generated
   - Candidate receives room link + access token
   - Video stream recorded to AWS S3
   - Real-time transcript capture (via Tesseract/Whisper-like service)
   - Post-interview: transcript processing → AI summary generation

3. **Feedback System**
   - Interviewer submits: rating (1-5), feedback notes, recommendation
   - Updates application status to INTERVIEWED
   - Triggers notification to candidate

**TODO**:
- [ ] Implement interview cancellation with candidate notification
- [ ] Add no-show detection (no connection after 5 min wait)
- [ ] Create interview reschedule logic
- [ ] Implement interview reminder notifications (24h, 1h before)
- [ ] Add interview recording storage management (auto-cleanup)
- [ ] Create interview transcript search/filtering
- [ ] Add AI-powered interview summary generation from transcripts

---

### 3. **Notification System**
**Status**: Basic structure ready, delivery mechanisms need robustness

#### Notification Types
- `NEW_APPLICATION`: New job application received
- `APPLICATION_STATUS_UPDATE`: Status change notification
- `INTERVIEW_SCHEDULED`: Interview invitation
- `INTERVIEW_REMINDER`: Countdown to interview
- `INTERVIEW_COMPLETED`: Post-interview notification
- `OFFER_EXTENDED`: Job offer sent
- `APPLICATION_REJECTED`: Rejection notification

#### Delivery Channels
- **In-app**: Real-time notifications (WebSocket)
- **Email**: Mailgun integration
- **SMS**: Twilio integration
- **WhatsApp**: WhatsApp Business API

**Key Logic**:
1. **Creation**
   - Notifications created with type/category
   - User preferences checked (do not disturb, channel preferences)
   - Metadata attached (applicationId, interviewId, etc.)

2. **Delivery**
   - Queued to BullMQ for async processing
   - Multiple retries on failure
   - Channel-specific retry strategies

3. **Read Status**
   - Track read/unread state
   - Mark individual or bulk as read
   - Audit trail for compliance

**TODO**:
- [ ] Implement notification preference templates (by role)
- [ ] Add notification delivery retry logic with exponential backoff
- [ ] Create notification analytics (delivery rate, open rate)
- [ ] Implement notification deduplication (prevent spam)
- [ ] Add notification scheduling (batch sending)
- [ ] Create notification preference UI schema optimization

---

### 4. **Authentication & Authorization**
**Status**: Core implemented, advanced scenarios need coverage

#### Authentication Methods
1. **Email + Password** → JWT token generation
2. **API Key** → For system integrations
3. **OAuth2** (planned): Google, LinkedIn integration

#### User Roles & Permissions
```
SYSTEM    → Full platform access, system operations
ADMIN     → Platform administration, user management
BUSINESS  → Company recruiter, job posting, application management
CANDIDATE → Job search, apply, interview participation
```

**Key Logic**:
1. **Login Flow**
   - Validate email + bcrypt password
   - Generate JWT token (configurable expiry)
   - Log login attempt (success/failure + IP)
   - Return user context + company info

2. **Password Reset**
   - Generate crypto token (expires in 15 mins)
   - Send via WhatsApp preferred channel
   - Token validation on reset
   - Audit log of password changes

3. **Authorization Guards**
   - `JwtAuthGuard`: Validates JWT token
   - `ApiKeyGuard`: Validates API key
   - `RolesGuard`: Validates user role permissions
   - `ResourceOwnerGuard`: Ensures user owns resource

**TODO**:
- [ ] Implement OAuth2 integration (Google, LinkedIn)
- [ ] Add 2FA (two-factor authentication) support
- [ ] Create JWT token refresh mechanism (rotate tokens)
- [ ] Implement rate limiting per endpoint
- [ ] Add IP whitelisting for API keys
- [ ] Create session management (device tracking)
- [ ] Add password policy enforcement (complexity, history)

---

### 5. **Communication Management**
**Status**: Schema ready, delivery logic needs enhancement

#### Communication Types Tracked
- `EMAIL`: Email communication
- `SMS`: SMS/Text messaging
- `WHATSAPP`: WhatsApp messaging
- `CALL`: Voice/call records
- `IN_APP`: In-app messages

#### Direction
- `INBOUND`: Incoming communication
- `OUTBOUND`: Outgoing communication

**Key Logic**:
1. **Log Creation**
   - Record all communication with timestamps
   - Track sender/recipient
   - Store communication content (encrypted for sensitive data)
   - Link to application/interview/user context

2. **Audit Trail**
   - Full compliance logging
   - Integration with audit service
   - Export capabilities

**TODO**:
- [ ] Implement message content encryption for PII
- [ ] Add communication search/filtering by type, date, party
- [ ] Create communication templates (reusable messages)
- [ ] Implement communication escalation workflow
- [ ] Add communication sentiment analysis (for feedback)
- [ ] Create communication compliance reports (GDPR)

---

### 6. **Candidate Profile Management**
**Status**: Schema complete, matching algorithms pending

#### Profile Components
- **Basic**: Name, email, phone, avatar
- **Education**: Degree, institution, graduation date
- **Work Experience**: Company, role, duration, responsibilities
- **Skills**: Technology skills, certifications
- **Preferences**: Salary expectations, job preferences

**Key Logic**:
1. **Profile Creation/Update**
   - Linked 1-to-1 with User entity
   - Cascading updates when user info changes
   - Audit trail for changes

2. **Profile Completeness**
   - Percentage calculation
   - Flag incomplete profiles for candidates

**TODO**:
- [ ] Implement candidate skill endorsement system
- [ ] Add profile matching score algorithm (candidate vs job)
- [ ] Create profile strength recommendations
- [ ] Implement skill-based candidate search/filtering
- [ ] Add resume parsing to auto-populate profile fields
- [ ] Create duplicate candidate detection

---

### 7. **Queue & Async Processing**
**Status**: Infrastructure ready, processor implementations needed

#### Queue Types (BullMQ)
1. **Email Queue**: Send emails via Mailgun
2. **SMS Queue**: Send SMS via Twilio
3. **WhatsApp Queue**: Send WhatsApp via WhatsApp Business API
4. **CV Analysis Queue**: Analyze CVs via FastAPI service

**Key Logic**:
1. **Job Addition**
   - Data validation before queuing
   - Priority-based processing
   - Job ID tracking for reference

2. **Processing**
   - Queue listeners process jobs in order
   - Failed jobs retry with exponential backoff
   - Dead letter queue for persistent failures

3. **Failure Handling**
   - Retry logic with configurable attempts
   - Error logging for debugging
   - Notification to admins on critical failures

**TODO**:
- [ ] Implement queue health monitoring
- [ ] Add job priority dynamic adjustment
- [ ] Create dead letter queue inspection tools
- [ ] Implement batch job processing
- [ ] Add queue performance metrics (throughput, latency)
- [ ] Create queue job cancellation mechanism
- [ ] Implement conditional retries (only for transient errors)

---

### 8. **LiveKit Integration** (Real-Time Video)
**Status**: Core working, room cleanup needs improvement

#### Room Management
- **Creation**: On-demand per interview
- **Deletion**: Auto after inactivity timeout
- **Metadata**: applicationId, participantInfo, recordingUrl

**Key Logic**:
1. **Token Generation**
   - Create AccessToken with participant permissions
   - Set TTL (1 hour default)
   - Include participant metadata

2. **Room Operations**
   - Check existing rooms before creation
   - Delete stale rooms completely
   - Refresh metadata on new interviews

3. **Recording**
   - Auto-record all interview sessions
   - Store to AWS S3
   - Generate presigned URLs for playback

**TODO**:
- [ ] Implement room participant tracking (join/leave events)
- [ ] Add room statistics collection (duration, participants)
- [ ] Create recording auto-upload to S3 with cleanup
- [ ] Implement room inactivity timeout enforcement
- [ ] Add recording encryption at rest
- [ ] Create room access revocation mechanism
- [ ] Implement live participant list broadcasting

---

### 9. **Audit & Compliance**
**Status**: Basic audit logging in place

#### Audit Events Logged
- User login/logout
- Application status changes
- Interview creation/completion
- Password resets
- Permission changes
- Data exports
- System errors

**Key Logic**:
1. **Audit Log Creation**
   - Timestamp all events
   - Record user context
   - Store action details
   - Include IP address

2. **Retention**
   - Configurable retention policy
   - Auto-cleanup of old logs (scheduled task)

**TODO**:
- [ ] Implement audit log compression/archival
- [ ] Add audit log search with filters
- [ ] Create audit report generation
- [ ] Implement compliance audit trail exports
- [ ] Add sensitive data masking in logs (passwords, tokens)
- [ ] Create audit anomaly detection (unusual patterns)

---

### 10. **Caching Strategy**
**Status**: Redis configured, strategic caching planned

#### Cache Layers
- **Application-level**: User sessions, authentication tokens
- **Database-level**: Query result caching
- **API-level**: GraphQL query caching

**Key Logic**:
1. **Cache Management**
   - TTL-based expiration
   - Invalidation on data changes
   - Cache warming on startup

**TODO**:
- [ ] Implement cache warming for frequently accessed data
- [ ] Add cache hit/miss metrics
- [ ] Create cache invalidation strategies (event-driven)
- [ ] Implement distributed cache for multi-instance setups
- [ ] Add cache compression for large objects
- [ ] Create cache debugging tools

---

## Critical Business Logic Gaps

### High Priority Issues

1. **CV Analysis Integration** ⚠️
   - Integration with FastAPI service exists but needs error handling
   - No validation of analysis results format
   - No fallback if analysis fails
   - Missing: timeout handling, retry logic, result validation

2. **Application Status Transitions** ⚠️
   - No validation of invalid state transitions (e.g., HIRED → PENDING)
   - No business rule enforcement (e.g., can't shortlist without review)
   - Missing: transition audit trail, reason tracking

3. **Interview No-Show Handling** ⚠️
   - No detection logic for candidates who don't join
   - No automatic status update for interviews
   - Missing: auto-notification of no-show, rescheduling workflow

4. **Notification Delivery Reliability** ⚠️
   - Queue failures not properly handled
   - No delivery confirmation tracking
   - Missing: failed delivery alerts, retry strategies

5. **Room Access Control** ⚠️
   - Room access not validated (any authenticated user could access any room)
   - No permission checks on candidate vs interviewer
   - Missing: access logging, unauthorized access detection

6. **Data Validation** ⚠️
   - File upload validation incomplete (size, type, scanning)
   - Resume file format validation missing
   - Missing: malware scanning, content validation

---

## TODO List - Organized by Priority

### CRITICAL (P0) - Do First
- [ ] **CV Analysis Error Handling**: Add timeout, retry logic, validation for FastAPI service responses
- [ ] **Interview Access Control**: Validate room access permissions (candidate vs interviewer only)
- [ ] **Application Status Validation**: Enforce valid state transitions with business rules
- [ ] **File Upload Security**: Add file type validation, size limits, malware scanning
- [ ] **Queue Failure Handling**: Implement dead-letter queue, admin notifications, monitoring

### HIGH (P1) - Do Soon
- [ ] **Notification Delivery Confirmation**: Track delivery status per channel
- [ ] **Interview No-Show Detection**: Auto-update status after 5-min timeout
- [ ] **Password Reset Security**: Implement rate limiting on reset attempts
- [ ] **API Key Management**: Add key rotation, usage tracking, IP whitelisting
- [ ] **CV Parsing**: Auto-populate candidate profile from resume
- [ ] **Application Filtering**: Implement advanced search with pagination
- [ ] **Candidate Matching Algorithm**: Score candidates against job requirements
- [ ] **Interview Reminders**: Send notifications 24h and 1h before scheduled interview
- [ ] **Communication Encryption**: Encrypt sensitive data in communication logs

### MEDIUM (P2) - Do Later
- [ ] **Job Auto-Expiration**: Implement scheduled task for expired jobs
- [ ] **Full-Text Search**: PostgreSQL full-text search for jobs, candidates
- [ ] **Analytics Dashboard**: Job views, applications, conversion metrics
- [ ] **Bulk Operations**: Bulk status updates, bulk notifications
- [ ] **Profile Strength Score**: Calculate completeness and recommendations
- [ ] **Skill Endorsement**: Peer verification of candidate skills
- [ ] **Communication Templates**: Reusable messages with variables
- [ ] **OAuth2 Integration**: Google, LinkedIn login
- [ ] **2FA Implementation**: Two-factor authentication
- [ ] **Job Recommendations**: Personalized job suggestions for candidates

### LOW (P3) - Nice to Have
- [ ] **Resume Parsing Enhancement**: Advanced parsing with ML
- [ ] **Interview Analytics**: Duration, participant stats, sentiment
- [ ] **Compliance Reports**: GDPR, audit trails
- [ ] **Advanced Caching**: Cache warming, distributed caching
- [ ] **Performance Optimization**: Query optimization, N+1 prevention
- [ ] **Localization**: Multi-language support
- [ ] **Mobile App APIs**: Dedicated mobile endpoints

---

## Monitoring & Observability Gaps

### Currently Missing
- [ ] Application-level metrics (Prometheus)
- [ ] Distributed tracing (Jaeger)
- [ ] Structured logging (ELK stack)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (DataDog)
- [ ] API analytics (request counts, latency)

---

## Testing & Quality Gaps

### Test Coverage Needed
- [ ] Unit tests for all services (target: 80%+ coverage)
- [ ] Integration tests for GraphQL resolvers
- [ ] E2E tests for critical workflows
- [ ] Load testing for queue processing
- [ ] Security testing (OWASP Top 10)

### Code Quality
- [ ] ESLint enforcement (currently setup but may need tweaking)
- [ ] Pre-commit hooks for linting
- [ ] Type safety improvements (reduce `any` types)
- [ ] Error handling standardization

---

## Environment & Configuration

### Current Setup
- Node.js 18+ (recommended)
- PostgreSQL 13+
- Redis (for caching & queues)
- LiveKit server (self-hosted or cloud)

### Environment Variables Required
```
DATABASE_HOST, DATABASE_PORT, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME
LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET
OPENAI_API_KEY
MAILGUN_DOMAIN, MAILGUN_API_KEY
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
RESET_TOKEN_EXPIRY_MINUTES, BCRYPT_ROUNDS
ALLOWED_ORIGINS, NODE_ENV, PORT
```

---

## Deployment Considerations

### Current Setup
- Docker + docker-compose available
- Fastify adapter (scalable, low memory)
- 50MB file upload limit
- Rate limiting enabled (configurable per endpoint)

### Recommended Improvements
- [ ] Implement graceful shutdown handling
- [ ] Add health checks (database, Redis, external services)
- [ ] Implement request timeouts
- [ ] Add request ID tracking for debugging
- [ ] Implement circuit breakers for external APIs

---

## Next Steps (Quick Win)

1. **This Week**:
   - Fix CV Analysis error handling
   - Implement interview room access control
   - Add application status transition validation

2. **Next Week**:
   - Implement interview no-show detection
   - Add notification delivery confirmation
   - Enhance file upload validation

3. **This Sprint**:
   - Complete all P0 items
   - Add monitoring/observability
   - Increase test coverage

---

## Contact & Documentation

- **Main Module**: `src/app.module.ts`
- **Entry Point**: `src/main.ts`
- **Configuration**: `.env` file (see example in docker-compose.yml)
- **Database**: TypeORM migrations in `src/migrations/`
- **GraphQL Schema**: Auto-generated at runtime (available at `/api/graphql`)

---

**Last Updated**: October 30, 2025  
**Maintainer**: Husain F.  
**Status**: Active Development
