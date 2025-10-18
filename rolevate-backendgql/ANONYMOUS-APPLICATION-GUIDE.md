# Anonymous Application System

## Overview
This guide explains how the anonymous application system works, allowing candidates to apply for jobs without having an account. The system automatically creates a candidate account with a random 6-letter password and returns credentials including a JWT token.

## Changes Made

### 1. Made `candidateId` Optional
- **File**: `src/application/create-application.input.ts`
- Changed `candidateId` from required to optional field
- This allows applications without a pre-existing candidate account

### 2. Created Application Response DTO
- **File**: `src/application/application-response.dto.ts`
- New DTOs:
  - `CandidateCredentials`: Contains email, password, and JWT token
  - `ApplicationResponse`: Contains application, optional credentials, and message

### 3. Updated Application Resolver
- **File**: `src/application/application.resolver.ts`
- Added `@Public()` decorator to allow unauthenticated access
- Changed return type from `Application` to `ApplicationResponse`
- Logic handles three scenarios:
  1. **Anonymous application** (no candidateId, no auth): Creates new candidate account
  2. **Authenticated application** (no candidateId, has auth): Uses logged-in user's ID
  3. **Standard application** (has candidateId): Proceeds normally

### 4. Updated Application Service
- **File**: `src/application/application.service.ts`
- Added `JwtService` injection for token generation
- Updated `createAnonymousApplication` to return `ApplicationResponse`
- Modified `generateRandomPassword` to create 6-letter alphabetic password
- Generates JWT token for new candidates with payload:
  ```typescript
  {
    email: user.email,
    sub: user.id,
    userType: user.userType,
    companyId: null
  }
  ```

## How It Works

### Anonymous Application Flow

1. **User submits application** with only `jobId` and optional personal info (email, firstName, etc.)

2. **System extracts CV data** using AI-powered CV parsing

3. **Check for existing user**:
   - If email exists → Use existing candidate account
   - If email is new → Create new candidate account

4. **For new candidates**:
   - Generate random 6-letter password (e.g., "AbCdEf")
   - Hash password with bcrypt
   - Create User entity (type: CANDIDATE)
   - Create CandidateProfile entity
   - Generate JWT token

5. **Create application** linked to candidate

6. **Return response**:
   ```json
   {
     "application": { /* Application details */ },
     "candidateCredentials": {
       "email": "candidate@example.com",
       "password": "AbCdEf",
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     },
     "message": "Application submitted successfully! A new candidate account has been created. Please save your credentials."
   }
   ```

## GraphQL Mutation

### ⚠️ Important: Query Structure

The `createApplication` mutation returns an `ApplicationResponse` object with three fields:
- `application` - The created application (contains id, status, job, candidate, etc.)
- `candidateCredentials` - Optional credentials for new candidates (email, password, token)
- `message` - Success message

**❌ WRONG - Don't query fields directly:**
```graphql
createApplication(input: $input) {
  id          # ❌ Error: Cannot query field "id" on type "ApplicationResponse"
  status      # ❌ Error: Cannot query field "status" on type "ApplicationResponse"
  job { ... } # ❌ Error: Cannot query field "job" on type "ApplicationResponse"
}
```

**✅ CORRECT - Access through the `application` field:**
```graphql
createApplication(input: $input) {
  application {
    id          # ✅ Correct
    status      # ✅ Correct
    job { ... } # ✅ Correct
  }
  candidateCredentials {
    email
    password
    token
  }
  message
}
```

### Example Request (Anonymous Application)

```graphql
mutation CreateApplication($input: CreateApplicationInput!) {
  createApplication(input: $input) {
    application {
      id
      jobId
      candidateId
      status
      appliedAt
      createdAt
      job {
        id
        title
        company {
          id
          name
        }
      }
      candidate {
        id
        name
        email
      }
    }
    candidateCredentials {
      email
      password
      token
    }
    message
  }
}
```

**Variables:**
```json
{
  "input": {
    "jobId": "02a0e4f8-f1f2-47d5-a0a0-0924504af0cd",
    "resumeUrl": "https://example.com/resume.pdf",
    "email": "candidate@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }
}
```

**Note:** All application fields must be accessed through the `application` object, not directly on the root response.

### Response for New Candidate

```json
{
  "data": {
    "createApplication": {
      "application": {
        "id": "app-id-123",
        "jobId": "02a0e4f8-f1f2-47d5-a0a0-0924504af0cd",
        "candidateId": "candidate-id-456",
        "status": "PENDING",
        "appliedAt": "2025-10-17T10:30:00Z"
      },
      "candidateCredentials": {
        "email": "candidate@example.com",
        "password": "AbCdEf",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNhbmRpZGF0ZUBleGFtcGxlLmNvbSIsInN1YiI6ImNhbmRpZGF0ZS1pZC00NTYiLCJ1c2VyVHlwZSI6IkNBTkRJREFURSIsImNvbXBhbnlJZCI6bnVsbCwiaWF0IjoxNjk3NTQ0NjAwfQ..."
      },
      "message": "Application submitted successfully! A new candidate account has been created. Please save your credentials."
    }
  }
}
```

### Response for Existing Candidate

```json
{
  "data": {
    "createApplication": {
      "application": {
        "id": "app-id-789",
        "jobId": "02a0e4f8-f1f2-47d5-a0a0-0924504af0cd",
        "candidateId": "existing-candidate-id",
        "status": "PENDING",
        "appliedAt": "2025-10-17T10:35:00Z"
      },
      "candidateCredentials": null,
      "message": "Application submitted successfully!"
    }
  }
}
```

## Frontend Integration Tips

1. **Check for credentials** in response:
   ```javascript
   if (response.candidateCredentials) {
     // New account created - show credentials to user
     displayCredentials(response.candidateCredentials);
     // Optionally auto-login using the token
     setAuthToken(response.candidateCredentials.token);
   }
   ```

2. **Store token** for authenticated requests:
   ```javascript
   localStorage.setItem('authToken', response.candidateCredentials.token);
   ```

3. **Prompt user** to save or change password:
   - Show temporary password prominently
   - Encourage user to change password immediately
   - Provide "Change Password" link/button

## Security Considerations

1. **Password Generation**: 6-letter alphabetic password (case-sensitive)
   - Example: "AbCdEf", "XyZaBc"
   - Total combinations: 52^6 = ~19 billion possibilities

2. **JWT Token**: Valid token generated immediately upon account creation
   - User can start making authenticated requests right away
   - Token contains user ID, email, and userType

3. **Email Verification**: Consider adding email verification step in production

4. **Password Change**: Encourage users to change their password after first login

## Common Errors & Solutions

### 1. Cannot query field "X" on type "ApplicationResponse"

**Error:**
```json
{
  "message": "Cannot query field \"id\" on type \"ApplicationResponse\"."
}
```

**Cause:** Trying to access application fields directly instead of through the `application` object.

**Solution:** Wrap all application fields in the `application` { } block:
```graphql
# ❌ Wrong
createApplication(input: $input) {
  id
  status
}

# ✅ Correct
createApplication(input: $input) {
  application {
    id
    status
  }
}
```

### 2. candidateId is required but not provided

**Error:**
```json
{
  "message": "Variable \"$input\" got invalid value { jobId: \"...\" }; Field \"candidateId\" of required type \"String!\" was not provided."
}
```

**Cause:** Old schema cached or server not restarted after changes.

**Solution:** 
1. Restart the server: `pm2 restart all`
2. Clear Apollo Studio cache
3. Verify `candidateId` is optional in schema

### 3. Resume URL is required

**Error:**
```json
{
  "message": "Resume URL is required for anonymous applications"
}
```

**Solution:** Always provide `resumeUrl` for anonymous applications. Upload the CV first:
```graphql
# Step 1: Upload CV
mutation UploadCV {
  uploadCVToS3(
    base64File: "..."
    filename: "resume.pdf"
    mimetype: "application/pdf"
  ) {
    url
  }
}

# Step 2: Use the URL in application
mutation CreateApplication {
  createApplication(input: {
    jobId: "..."
    resumeUrl: "https://s3.amazonaws.com/..."  # From step 1
  }) { ... }
}
```

## Error Handling

The system handles various error scenarios:

- **Missing Resume**: "Resume URL is required for anonymous applications"
- **Missing Email**: "Email is required (either provide manually or include in CV)"
- **Missing First Name**: "First name is required (either provide manually or include in CV)"
- **Job Not Found**: "Job not found"
- **Job Inactive**: "Job is not accepting applications"
- **Deadline Passed**: "Job application deadline has passed"
- **Duplicate Application**: "This candidate has already applied for this job"
- **Invalid User Type**: "User exists but is not a candidate"

## Complete Working Examples

### Example 1: Anonymous Application (New Candidate)

**GraphQL Mutation:**
```graphql
mutation CreateApplication($input: CreateApplicationInput!) {
  createApplication(input: $input) {
    application {
      id
      jobId
      candidateId
      status
      appliedAt
      createdAt
      resumeUrl
    }
    candidateCredentials {
      email
      password
      token
    }
    message
  }
}
```

**Variables:**
```json
{
  "input": {
    "jobId": "02a0e4f8-f1f2-47d5-a0a0-0924504af0cd",
    "resumeUrl": "https://s3.amazonaws.com/bucket/cvs/resume.pdf",
    "email": "newcandidate@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+1234567890",
    "coverLetter": "I'm very interested in this position..."
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "createApplication": {
      "application": {
        "id": "app-123",
        "jobId": "02a0e4f8-f1f2-47d5-a0a0-0924504af0cd",
        "candidateId": "candidate-456",
        "status": "PENDING",
        "appliedAt": "2025-10-17T10:30:00Z",
        "createdAt": "2025-10-17T10:30:00Z",
        "resumeUrl": "https://s3.amazonaws.com/bucket/cvs/resume.pdf"
      },
      "candidateCredentials": {
        "email": "newcandidate@example.com",
        "password": "AbCdEf",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      },
      "message": "Application submitted successfully! A new candidate account has been created. Please save your credentials."
    }
  }
}
```

### Example 2: Anonymous Application (Existing Candidate)

**Same mutation, different variables:**
```json
{
  "input": {
    "jobId": "job-789",
    "resumeUrl": "https://s3.amazonaws.com/bucket/cvs/resume.pdf",
    "email": "existing@example.com"
  }
}
```

**Expected Response (No Credentials):**
```json
{
  "data": {
    "createApplication": {
      "application": {
        "id": "app-789",
        "jobId": "job-789",
        "candidateId": "existing-candidate-id",
        "status": "PENDING",
        "appliedAt": "2025-10-17T10:35:00Z",
        "createdAt": "2025-10-17T10:35:00Z",
        "resumeUrl": "https://s3.amazonaws.com/bucket/cvs/resume.pdf"
      },
      "candidateCredentials": null,
      "message": "Application submitted successfully!"
    }
  }
}
```

### Example 3: Authenticated Application

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Variables (candidateId is optional when authenticated):**
```json
{
  "input": {
    "jobId": "job-456",
    "resumeUrl": "https://s3.amazonaws.com/bucket/cvs/my-resume.pdf",
    "coverLetter": "I have 5 years of experience..."
  }
}
```

**Response:**
```json
{
  "data": {
    "createApplication": {
      "application": {
        "id": "app-321",
        "jobId": "job-456",
        "candidateId": "authenticated-user-id",
        "status": "PENDING",
        "appliedAt": "2025-10-17T10:40:00Z",
        "createdAt": "2025-10-17T10:40:00Z",
        "resumeUrl": "https://s3.amazonaws.com/bucket/cvs/my-resume.pdf"
      },
      "candidateCredentials": null,
      "message": "Application submitted successfully"
    }
  }
}
```

## Testing

Test with different scenarios:

1. **New candidate with CV only**:
   ```graphql
   { jobId: "...", resumeUrl: "..." }
   ```

2. **New candidate with manual info**:
   ```graphql
   { 
     jobId: "...", 
     resumeUrl: "...",
     email: "...",
     firstName: "...",
     lastName: "..."
   }
   ```

3. **Existing candidate**:
   - Should not return credentials
   - Should not create duplicate account

4. **Authenticated user**:
   - Include auth token in headers
   - candidateId should be auto-filled from token
