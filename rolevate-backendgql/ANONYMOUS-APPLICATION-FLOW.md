# Anonymous Application Complete Flow

## Overview
When an anonymous candidate submits an application with their CV, we need to process everything automatically and send them login credentials.

## Current Flow (What We Have)

### 1. ✅ Application Submission
**Status:** Working
- Anonymous candidate fills form with minimal info (may include name, email, phone)
- Uploads CV file
- Submits application
- **NestJS creates:**
  - Placeholder User: `anonymous-{timestamp}@placeholder.temp`
  - Placeholder CandidateProfile (empty)
  - Application record with CV S3 link
  - Status: Pending

### 2. ✅ CV Analysis Request
**Status:** Working
- NestJS sends CV to FastAPI for analysis
- **Payload includes:**
  - `application_id`
  - `candidate_id`
  - `job_id`
  - `cv_link` (S3 URL)
  - `callbackUrl`
  - `systemApiKey`

### 3. ✅ FastAPI CV Processing
**Status:** Working
- Downloads CV from S3
- Extracts text from PDF
- Uses OpenAI GPT-4 to extract:
  - firstName, lastName, name
  - email, phone
  - location
  - bio
  - skills (array)
  - experience (summary)
  - education (summary)
  - linkedinUrl, portfolioUrl

### 4. ❌ FastAPI Callback to NestJS
**Status:** **BLOCKED - Authentication Failing**
- FastAPI tries to call `updateApplicationAnalysis` mutation
- **Problem:** Still getting "Forbidden resource" errors
- **Root Cause:** ApiKeyService changes not being picked up by running server

**What FastAPI sends:**
```json
{
  "applicationId": "uuid",
  "cvAnalysisScore": 85,
  "cvAnalysisResults": "{...}",
  "aiCvRecommendations": "...",
  "aiInterviewRecommendations": "...",
  "candidateInfo": {
    "firstName": "...",
    "lastName": "...",
    "email": "...",
    "phone": "...",
    ...
  }
}
```

### 5. ✅ Update Candidate Profile (After Fix)
**Status:** Code Ready, Not Running Yet
- Updates User email from placeholder to real email
- Creates or updates CandidateProfile with CV data
- Saves CV analysis score and results

## Missing Steps (What We Need)

### 6. ❌ Create LiveKit Room
**Status:** Not Implemented
**What we need:**
- Create LiveKit room for interview
- Set room metadata with:
  - `applicationId`
  - `candidateId`
  - `jobId`
  - `companyId`
  - Job title
  - Candidate name
- Generate room token
- Store room info in Application or Interview entity

### 7. ❌ Generate Login Credentials
**Status:** Not Implemented
**What we need:**
- Generate secure random password
- Hash password and store in User entity
- Store credentials temporarily for SMS (or use JWT reset token)
- **Options:**
  1. Set password directly
  2. Generate password reset token and send link
  3. Use magic link (passwordless)

### 8. ❌ Send SMS with Login Info
**Status:** Partially Implemented (SMS service exists)
**What we need:**
- Get candidate phone from CandidateProfile
- Format SMS message with:
  - Login URL
  - Email/phone (username)
  - Password or magic link
  - Interview room link
- Send via Twilio/SMS service
- Log SMS sent status

### 9. ❌ Send Interview Link
**Status:** Not Implemented
**What we need:**
- Compose message with:
  - Welcome message
  - Interview date/time (if scheduled)
  - LiveKit room link
  - Login credentials
  - Company info
- Send via SMS and/or Email

### 10. ❌ Notification to Company
**Status:** Unknown
**What we need:**
- Notify company that new application received
- Include CV analysis score
- Include candidate profile snapshot
- Link to view full application

## Complete Ideal Flow

```
1. Anonymous Candidate Submits Application
   └─> NestJS: Create placeholder user + application
   
2. NestJS: Send CV to FastAPI for analysis
   └─> FastAPI: Download CV, extract data with OpenAI
   
3. FastAPI: Post results back to NestJS ❌ BLOCKED HERE
   └─> NestJS: Update user email + candidate profile
   
4. NestJS: Generate login credentials
   └─> Hash password, store in database
   
5. NestJS: Create LiveKit interview room
   └─> Generate room token
   └─> Store room metadata
   
6. NestJS: Send SMS to candidate
   └─> "Welcome! Your application received."
   └─> "Login: https://app.rolevate.com"
   └─> "Email: john@example.com"
   └─> "Password: SecurePass123"
   └─> "Interview link: https://app.rolevate.com/interview/xyz"
   
7. NestJS: Notify company
   └─> "New application from John Doe"
   └─> "CV Match Score: 85%"
   └─> "View: https://dashboard.rolevate.com/applications/xyz"
   
8. Candidate logs in
   └─> Can view application status
   └─> Can join interview when scheduled
```

## Priority Actions

### IMMEDIATE (Blocking)
1. **Fix Authentication** - Restart NestJS server to pick up ApiKeyService changes
   - Verify SYSTEM_API_KEY environment variable loaded
   - Test FastAPI callback works
   
### HIGH PRIORITY (Core Flow)
2. **Create LiveKit Room after CV Analysis**
   - Add room creation to `updateApplicationAnalysis` flow
   - Store room name/token in Application
   
3. **Generate & Send Login Credentials**
   - Generate secure password after profile created
   - Send SMS with credentials
   
### MEDIUM PRIORITY (Nice to Have)
4. **Email Notifications**
   - Send email in addition to SMS
   - Formatted HTML email with branding
   
5. **Company Dashboard Notifications**
   - Real-time notification when application received
   - Badge count for new applications

## Questions to Answer

1. **Password Strategy:** Direct password, reset token, or magic link?
2. **Interview Timing:** Create room immediately or when interview scheduled?
3. **SMS Template:** What exact message format for login credentials?
4. **Email vs SMS:** Send both or SMS only?
5. **Retry Logic:** What if SMS fails? Retry? Email fallback?

## Files to Modify

### For Login Credentials
- `src/application/application.service.ts` - Add credential generation
- `src/user/user.service.ts` - Password hashing/storage
- `src/services/sms.service.ts` - SMS sending

### For LiveKit Room
- `src/application/application.service.ts` - Room creation
- `src/livekit/livekit.service.ts` - Room API calls
- `src/interview/interview.entity.ts` - Store room info

### For Notifications
- `src/notification/notification.service.ts` - Company notifications
- `src/communication/email.service.ts` - Email notifications

## Next Steps

1. ✅ Restart NestJS to fix authentication
2. Test complete flow end-to-end
3. Implement LiveKit room creation
4. Implement credential generation
5. Implement SMS sending
6. Test with real anonymous application

## Date
October 18, 2025
