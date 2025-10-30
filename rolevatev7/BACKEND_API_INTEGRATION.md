# Backend API Integration Documentation

## Overview
The frontend is successfully integrated with the backend GraphQL API at `http://192.168.1.210:4005/api`.

## Authentication
- **Type**: Bearer JWT Token
- **Header**: `Authorization: Bearer {token}`
- **Token Format**: JWT with claims: email, sub (userId), userType, companyId, iat, exp, aud, iss

## Available GraphQL Queries

### 1. Me Query
**Purpose**: Get current authenticated user information

```graphql
query {
  me {
    id          # User ID
    email       # User email address
    name        # User full name
  }
}
```

**Response Example**:
```json
{
  "data": {
    "me": {
      "id": "9f257d00-0ffc-4012-878c-d18f9510aeeb",
      "email": "test@test.com",
      "name": "test test"
    }
  }
}
```

### 2. Candidate Profile Query
**Purpose**: Get candidate profile with full details

```graphql
query {
  candidateProfileByUser(userId: ID!) {
    id              # Profile ID
    name            # Candidate name (often same as user.name)
    phone           # Phone number
    location        # Current location/city
    bio             # Professional bio/summary
    skills          # Array of skill strings
    experience      # Text field with experience summary
    education       # Text field with education summary
    
    # Nested objects
    workExperiences {
      id            # Experience record ID
      position      # Job position/title
      company       # Company name
      startDate     # Start date
      endDate       # End date (nullable)
      isCurrent     # Whether currently working there
      description   # Job description
    }
    
    educations {
      id            # Education record ID
      degree        # Degree name (e.g., "Bachelor", "Master")
      institution   # University/Institution name
      fieldOfStudy  # Field of study
      startDate     # Start date
      endDate       # End date (nullable)
      grade         # Final grade/GPA
    }

    cvs {
      id            # CV record ID
      fileName      # File name
      fileUrl       # S3 URL to the file
      fileSize      # Size in bytes
      mimeType      # MIME type (e.g., "application/pdf")
      isPrimary     # Whether this is the primary CV
      uploadedAt    # Upload timestamp
      createdAt     # Creation timestamp
      updatedAt     # Last update timestamp
    }
  }
}
```

**Response Example**:
```json
{
  "data": {
    "candidateProfileByUser": {
      "id": "76bb5466-beef-411e-acb8-ca2490240717",
      "name": "test test",
      "phone": "00962796026659",
      "location": null,
      "bio": null,
      "skills": [],
      "experience": null,
      "education": null,
      "workExperiences": [],
      "educations": [],
      "cvs": []
    }
  }
}
```

**Note**: If a candidate profile doesn't exist yet, returns `null`. The frontend handles this by displaying user data from the `me` query as a fallback.

## Available GraphQL Mutations

### 1. Upload CV to S3
**Purpose**: Upload a CV file to S3 storage

```graphql
mutation {
  uploadCVToS3(
    base64File: String!        # Base64 encoded file content
    filename: String!          # Original filename
    mimetype: String!          # File MIME type (e.g., "application/pdf")
    candidateId: String        # Optional candidate profile ID
  ) {
    url                        # S3 URL to access the file
    key                        # S3 object key/path
    bucket                     # S3 bucket name
  }
}
```

**Response Example**:
```json
{
  "data": {
    "uploadCVToS3": {
      "url": "https://4wk-garage-media.s3.me-central-1.amazonaws.com/cvs/anonymous/2620119e-0dfa-415f-80e4-fdba7c653aac-test.pdf",
      "key": "cvs/anonymous/2620119e-0dfa-415f-80e4-fdba7c653aac-test.pdf",
      "bucket": "4wk-garage-media"
    }
  }
}
```

**Note**: Works even for unauthenticated users (uploads to "anonymous" folder). For authenticated users, can be uploaded to their candidate profile.

### 2. Change Password
**Purpose**: Change the authenticated user's password

```graphql
mutation {
  changePassword(input: ChangePasswordInput!) {
    # Returns boolean or updated user data
  }
}
```

**Input**:
```typescript
ChangePasswordInput {
  currentPassword: String!     # Current password
  newPassword: String!         # New password
}
```

**Response Example**:
```json
{
  "data": {
    "changePassword": true
  }
}
```

### Profile Service (`src/services/profile.ts`)

The profile service handles:

1. **Fetching Profile**: Combines `me` query and `candidateProfileByUser` query
   - If profile exists: Merges with user data
   - If profile doesn't exist: Returns user data as fallback
   - This ensures the name is always available

2. **Data Fallback Strategy**:
   ```typescript
   // If candidate profile exists, use its data
   if (candidateProfile) {
     return {
       ...candidateProfile,
       user: userData.me,
       name: candidateProfile.name || userData.me.name,
     };
   }
   
   // If candidate profile doesn't exist yet, return user data
   return {
     id: userData.me.id,
     user: userData.me,
     name: userData.me.name,
   };
   ```

### Profile Page (`src/app/userdashboard/profile/page.tsx`)

The profile page displays profile data in 5 tabs:

1. **Personal Tab**: Name, Email, Phone, Location, Bio
2. **Professional Tab**: Experience, Skills, Work Experiences list
3. **Education Tab**: Education text, Education Details list
4. **Documents Tab**: CV upload and management
5. **Security Tab**: Password change form

#### Field Mapping
| Backend Field | Frontend Display | Notes |
|---|---|---|
| `name` | Personal Tab > Full Name | Always available (from me query) |
| `email` | Personal Tab > Email | From me query |
| `phone` | Personal Tab > Phone | From profile |
| `location` | Personal Tab > Location | From profile |
| `bio` | Personal Tab > Bio | From profile |
| `experience` | Professional Tab > Experience | Text field |
| `skills` | Professional Tab > Skills | Array of strings displayed as badges |
| `workExperiences[]` | Professional Tab > Work Experience list | Array of objects with position, company, dates |
| `education` | Education Tab > Education | Text field |
| `educations[]` | Education Tab > Education Details | Array of objects with degree, institution, etc. |
| `cvs[]` | Documents Tab > Your CVs | Array of CV objects with fileName, fileUrl, etc. |

#### Documents Tab (CV Upload)
- **Drag & Drop**: Users can drag files onto the upload area
- **Click to Upload**: Click "Choose File" button to select from disk
- **Accepted Formats**: PDF, DOC, DOCX
- **Upload Process**: File is converted to base64, sent to backend, stored on S3
- **CV Display**: Lists all uploaded CVs with filename and upload date
- **Primary CV**: Shows "Primary" badge if CV is marked as primary
- **Real-time Feedback**: 
  - Loading toast while uploading
  - Success toast on completion
  - Error toast if upload fails
  - Automatically reloads CV list after successful upload

## Testing with Bearer Tokens

### Test Token 1: test@test.com
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJzdWIiOiI5ZjI1N2QwMC0wZmZjLTQwMTItODc4Yy1kMThmOTUxMGFlZWIiLCJ1c2VyVHlwZSI6IkNBTkRJREFURSIsImNvbXBhbnlJZCI6bnVsbCwiaWF0IjoxNzYxODE3MzM0LCJleHAiOjE3NjE5MDM3MzQsImF1ZCI6InJvbGV2YXRlLWNsaWVudCIsImlzcyI6InJvbGV2YXRlLWFwaSJ9.HJE25n3eRdl2eSS_qLmEWzHlIh_lO_5BvzrPshUWbtc
```
- **User ID**: 9f257d00-0ffc-4012-878c-d18f9510aeeb
- **Has Profile**: ✅ Yes (with phone: 00962796026659)
- **Status**: Active for testing

## API Proxy Architecture

The frontend routes all GraphQL requests through the Next.js API proxy at `/api/graphql` to avoid CORS issues:

1. **Browser Request** → `http://localhost:3005/api/graphql`
2. **Next.js Proxy** → Forwards to `http://192.168.1.210:4005/api/graphql`
3. **Backend Response** → Returns to browser

**Proxy Location**: `src/app/api/graphql/route.ts`

## Important Notes

✅ **Name is Always Available**
- From `me` query if profile doesn't exist yet
- From `candidateProfileByUser` if profile exists
- Fallback strategy ensures no empty name display

✅ **Profile Service Handles Null Cases**
- Gracefully handles when candidate profile hasn't been created yet
- Merges user and profile data correctly

✅ **Field Names Match Backend Schema**
- Use `position` (not `title`) for job position
- Use `location` (not `currentLocation`)
- Use `bio` (not `profileSummary`)

❌ **Non-Existent Fields Removed**
- currentJobTitle, experienceLevel, totalExperience, noticePeriod (from Professional tab)
- university, highestEducation, graduationYear (from Education tab)
- These fields are not in the backend schema

## Development Testing

To test the integration:

```bash
# Start dev server
npm run dev -- -p 3005

# Visit profile page
# http://localhost:3005/userdashboard/profile

# The page will fetch profile using authenticated user's token
# Name and basic info will be displayed immediately
```

## Future Backend Requirements

If you need to add more fields to the profile, ensure they're added to:
1. Backend GraphQL schema
2. Profile service query in `src/services/profile.ts`
3. Profile page display component in `src/app/userdashboard/profile/page.tsx`
