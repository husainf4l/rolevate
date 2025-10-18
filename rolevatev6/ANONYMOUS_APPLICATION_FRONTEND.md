# Anonymous Application Integration - Frontend

## Overview

The job application page now fully supports the **anonymous application system** with automatic account creation and credential display.

## What Changed

### 1. Updated Application Mutation Structure

The backend now returns an `ApplicationResponse` object instead of direct `Application` fields:

```typescript
interface ApplicationResponse {
  application: {
    id: string;
    jobId: string;
    candidateId: string;
    status: string;
    appliedAt: string;
    createdAt: string;
    resumeUrl: string;
  };
  candidateCredentials: CandidateCredentials | null;
  message: string;
}

interface CandidateCredentials {
  email: string;
  password: string;
  token: string;
}
```

### 2. GraphQL Mutation

**✅ CORRECT Structure (What We Use Now):**

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

**Key Point:** All application fields must be accessed through the `application` object, NOT directly on the root response.

### 3. Input Variables

The mutation accepts these fields:

```typescript
{
  input: {
    jobId: string;              // Required
    resumeUrl: string;          // Required (from file upload)
    email: string;              // Required
    firstName: string;          // Required (extracted from fullName)
    lastName: string;           // Required (extracted from fullName)
    phone: string;              // Required
    coverLetter?: string;       // Optional
    linkedin?: string;          // Optional (from linkedIn field)
    portfolio?: string;         // Optional
    noticePeriod?: string;      // Optional
  }
}
```

## Implementation Details

### File Upload & Application Flow

```typescript
// Step 1: Convert resume to base64
const base64File = await fileToBase64(formData.resume);

// Step 2: Upload to S3
const { data: uploadData } = await apolloClient.mutate({
  mutation: UPLOAD_FILE_MUTATION,
  variables: {
    base64File: base64File,
    filename: formData.resume.name,
    mimetype: formData.resume.type,
    folder: 'resumes',
  },
});

const resumeUrl = uploadData?.uploadFileToS3?.url;

// Step 3: Create application with resume URL
const { data: applicationData } = await apolloClient.mutate({
  mutation: CREATE_APPLICATION_MUTATION,
  variables: {
    input: {
      jobId: String(job.id),
      resumeUrl: resumeUrl,
      email: formData.email,
      firstName: formData.fullName.split(' ')[0],
      lastName: formData.fullName.split(' ').slice(1).join(' '),
      phone: formData.phone,
      coverLetter: formData.coverLetter || undefined,
      linkedin: formData.linkedIn || undefined,
      portfolio: formData.portfolio || undefined,
      noticePeriod: formData.noticePeriod || undefined,
    },
  },
});

// Step 4: Handle response
const applicationResponse = applicationData?.createApplication;

// Step 5: Store credentials if provided
if (applicationResponse.candidateCredentials) {
  setCredentials(applicationResponse.candidateCredentials);
  localStorage.setItem('access_token', applicationResponse.candidateCredentials.token);
}
```

### Name Parsing

Since the form has a single "Full Name" field but the backend expects `firstName` and `lastName`:

```typescript
// Split full name into first and last
firstName: formData.fullName.split(' ')[0],
lastName: formData.fullName.split(' ').slice(1).join(' ') || formData.fullName.split(' ')[0],
```

**Examples:**
- "John Doe" → firstName: "John", lastName: "Doe"
- "Mary Jane Smith" → firstName: "Mary", lastName: "Jane Smith"
- "Alice" → firstName: "Alice", lastName: "Alice" (fallback)

## User Experience

### Success Page - Three Scenarios

#### 1. New Anonymous User (Credentials Created)

```jsx
{credentials && (
  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <h3>Account Created!</h3>
    <p>We've created an account for you. Please save these credentials:</p>
    
    <div className="credentials-box">
      <div>
        <span>Email:</span>
        <p>{credentials.email}</p>
      </div>
      <div>
        <span>Temporary Password:</span>
        <p>{credentials.password}</p>  {/* e.g., "AbCdEf" */}
      </div>
    </div>
    
    <p>💡 We recommend changing your password after logging in.</p>
  </div>
)}
```

**Button:** "Go to My Dashboard"

#### 2. Existing Anonymous User (No Credentials)

```jsx
{!credentials && !isAuthenticated && (
  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <p>💡 Create an account to track your applications and get notified!</p>
  </div>
)}
```

**Button:** "Create Account to Track Application"

#### 3. Authenticated User

No special message shown.

**Button:** "View My Applications"

## Backend Integration

### What Happens on the Backend

1. **Resume Upload** → S3 URL returned
2. **Email Check:**
   - Email exists → Use existing candidate account
   - Email new → Create new candidate account with random password
3. **Account Creation (if new):**
   - Generate 6-letter password (e.g., "AbCdEf")
   - Hash with bcrypt
   - Create User entity (type: CANDIDATE)
   - Create CandidateProfile entity
   - Generate JWT token
4. **Application Creation** → Link to candidate
5. **Response:**
   - New user: Returns credentials + token
   - Existing user: Returns null credentials

### JWT Token Payload

```json
{
  "email": "candidate@example.com",
  "sub": "candidate-id-456",
  "userType": "CANDIDATE",
  "companyId": null,
  "iat": 1697544600
}
```

## Auto-Login Feature

When credentials are returned, the user is automatically logged in:

```typescript
if (applicationResponse.candidateCredentials) {
  // Store token for authenticated requests
  localStorage.setItem('access_token', applicationResponse.candidateCredentials.token);
  
  // Display credentials to user
  setCredentials(applicationResponse.candidateCredentials);
}
```

This allows the user to:
- Immediately access their dashboard
- Track application status
- Apply to more jobs (as authenticated user)
- Update their profile

## Security Considerations

### Password Generation

- **Format:** 6 letters (uppercase and lowercase)
- **Examples:** "AbCdEf", "XyZaBc", "QwErTy"
- **Strength:** 52^6 = ~19 billion combinations
- **Recommendation:** User should change password immediately

### Token Storage

```typescript
// Store in localStorage for persistence
localStorage.setItem('access_token', credentials.token);

// Token is automatically included in future GraphQL requests
// via Apollo Client configuration
```

### Email Verification (Future)

Currently, accounts are created without email verification. Consider adding:
- Email verification link
- Temporary account restrictions
- Verification reminder

## Error Handling

### Common Errors

1. **Missing Resume URL**
   ```
   Error: "Resume URL is required for anonymous applications"
   Solution: Ensure file upload completes before creating application
   ```

2. **Missing Required Fields**
   ```
   Error: "Email is required" or "First name is required"
   Solution: All required fields must be provided
   ```

3. **Duplicate Application**
   ```
   Error: "This candidate has already applied for this job"
   Solution: Show user they've already applied
   ```

4. **Job Not Active**
   ```
   Error: "Job is not accepting applications"
   Solution: Display appropriate message
   ```

## Testing Scenarios

### Test Case 1: New Anonymous User

**Input:**
- New email address
- All required fields filled
- Resume uploaded

**Expected:**
- Account created
- Credentials displayed
- Token stored
- "Go to My Dashboard" button shown

### Test Case 2: Existing Anonymous User

**Input:**
- Email that already exists in system
- Resume uploaded

**Expected:**
- Use existing account
- No credentials displayed
- No token (user should login normally)
- "Create Account" prompt shown

### Test Case 3: Authenticated User

**Input:**
- User already logged in
- Resume uploaded

**Expected:**
- Application linked to logged-in user
- No credentials displayed
- "View My Applications" button shown

## UI Components

### Credentials Display Box

```jsx
<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
  <div className="flex items-start gap-2">
    <InfoIcon />
    <div>
      <h3 className="font-semibold text-blue-900">Account Created!</h3>
      <p className="text-sm text-blue-800">
        We've created an account for you. Please save these credentials:
      </p>
    </div>
  </div>
  
  <div className="bg-white p-3 rounded border">
    <div>
      <span className="text-xs text-gray-500">Email:</span>
      <p className="font-mono text-sm">{email}</p>
    </div>
    <div>
      <span className="text-xs text-gray-500">Temporary Password:</span>
      <p className="font-mono text-sm font-semibold">{password}</p>
    </div>
  </div>
  
  <p className="text-xs text-blue-700 mt-3">
    💡 We recommend changing your password after logging in.
  </p>
</div>
```

## Future Enhancements

### 1. Copy Credentials Button

```jsx
<button onClick={() => {
  navigator.clipboard.writeText(
    `Email: ${credentials.email}\nPassword: ${credentials.password}`
  );
  toast.success('Credentials copied!');
}}>
  Copy Credentials
</button>
```

### 2. Email Credentials

```jsx
<button onClick={async () => {
  await fetch('/api/email-credentials', {
    method: 'POST',
    body: JSON.stringify({ email: credentials.email })
  });
  toast.success('Credentials sent to your email!');
}}>
  Email Me Credentials
</button>
```

### 3. Password Strength Indicator

Show password strength and encourage immediate change:

```jsx
<div className="password-strength">
  <div className="strength-bar weak"></div>
  <p>Weak - Please change after logging in</p>
</div>
```

### 4. Immediate Password Change

```jsx
<Link href="/userdashboard/profile?changePassword=true">
  <Button>Change Password Now</Button>
</Link>
```

## Troubleshooting

### Issue: Credentials not displayed

**Cause:** Response structure incorrect or credentials null

**Solution:**
```typescript
console.log('Application Response:', applicationResponse);
console.log('Credentials:', applicationResponse?.candidateCredentials);
```

### Issue: Token not working

**Cause:** Token not stored correctly

**Solution:**
```typescript
// Verify token is stored
const token = localStorage.getItem('access_token');
console.log('Stored Token:', token);

// Verify token in Apollo Client headers
console.log('Apollo Headers:', apolloClient.link.options.headers);
```

### Issue: "Cannot query field" error

**Cause:** Trying to access application fields directly

**Solution:** Always access through `application` object:
```graphql
# ❌ Wrong
createApplication { id status }

# ✅ Correct
createApplication { application { id status } }
```

## Complete Example Request

```typescript
const { data } = await apolloClient.mutate({
  mutation: gql`
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
  `,
  variables: {
    input: {
      jobId: "job-123",
      resumeUrl: "https://s3.amazonaws.com/bucket/resume.pdf",
      email: "newuser@example.com",
      firstName: "John",
      lastName: "Doe",
      phone: "+1234567890",
      coverLetter: "I'm interested in this position...",
      linkedin: "https://linkedin.com/in/johndoe",
      portfolio: "https://johndoe.com",
      noticePeriod: "2 weeks"
    }
  }
});

// Handle response
if (data.createApplication.candidateCredentials) {
  // New account created
  console.log('Credentials:', data.createApplication.candidateCredentials);
  localStorage.setItem('access_token', data.createApplication.candidateCredentials.token);
} else {
  // Existing user
  console.log('Application created for existing user');
}
```

## Summary

✅ **Anonymous applications fully supported**  
✅ **Automatic account creation with random password**  
✅ **Credentials displayed to user**  
✅ **Auto-login with JWT token**  
✅ **Proper error handling**  
✅ **Clean UX for all scenarios**  

The system now handles all three application scenarios seamlessly:
1. New anonymous users (with credential creation)
2. Existing anonymous users (no credentials)
3. Authenticated users (standard flow)
