# Quick Start: Create Application (Anonymous & Authenticated)

## 🚀 TL;DR - Correct GraphQL Query

```graphql
mutation CreateApplication($input: CreateApplicationInput!) {
  createApplication(input: $input) {
    application {
      id
      jobId
      candidateId
      status
      appliedAt
      job {
        id
        title
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
    "jobId": "your-job-id-here",
    "resumeUrl": "https://s3.amazonaws.com/.../resume.pdf"
  }
}
```

---

## ⚠️ Common Mistake

### ❌ WRONG - Don't do this:
```graphql
mutation CreateApplication($input: CreateApplicationInput!) {
  createApplication(input: $input) {
    id          # ❌ Error: Cannot query field "id"
    status      # ❌ Error: Cannot query field "status"
    job { }     # ❌ Error: Cannot query field "job"
  }
}
```

### ✅ CORRECT - Do this instead:
```graphql
mutation CreateApplication($input: CreateApplicationInput!) {
  createApplication(input: $input) {
    application {    # ← Note: wrapped in "application"
      id            # ✅ Works
      status        # ✅ Works
      job { }       # ✅ Works
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

---

## 📋 Response Structure

The mutation returns an `ApplicationResponse` object:

```typescript
type ApplicationResponse {
  application: Application           // The created application
  candidateCredentials: {            // Only for NEW candidates
    email: string
    password: string                 // 6-letter random password
    token: string                    // JWT token for immediate auth
  } | null
  message: string                    // Success message
}
```

---

## 🔄 Complete Workflow

### Step 1: Upload CV to S3 (Base64)

```graphql
mutation UploadCV($base64File: String!, $filename: String!, $mimetype: String!) {
  uploadCVToS3(
    base64File: $base64File
    filename: $filename
    mimetype: $mimetype
  ) {
    url
    key
    bucket
  }
}
```

**JavaScript Example:**
```javascript
// Convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]; // Remove data:...;base64, prefix
      resolve(base64);
    };
    reader.onerror = reject;
  });
};

// Upload CV
const file = document.querySelector('input[type="file"]').files[0];
const base64 = await fileToBase64(file);

const { data } = await client.mutate({
  mutation: UPLOAD_CV,
  variables: {
    base64File: base64,
    filename: file.name,
    mimetype: file.type
  }
});

const cvUrl = data.uploadCVToS3.url;
```

### Step 2: Create Application with CV URL

```graphql
mutation CreateApplication($input: CreateApplicationInput!) {
  createApplication(input: $input) {
    application {
      id
      jobId
      candidateId
      status
      appliedAt
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
    "resumeUrl": "https://s3.amazonaws.com/.../resume.pdf",
    "email": "candidate@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "coverLetter": "I'm interested in this position..."
  }
}
```

### Step 3: Handle Response

```javascript
const { data } = await client.mutate({
  mutation: CREATE_APPLICATION,
  variables: { input }
});

const { application, candidateCredentials, message } = data.createApplication;

if (candidateCredentials) {
  // New candidate account created
  console.log('🎉 Account created!');
  console.log('Email:', candidateCredentials.email);
  console.log('Password:', candidateCredentials.password);
  console.log('Token:', candidateCredentials.token);
  
  // Save token for authenticated requests
  localStorage.setItem('authToken', candidateCredentials.token);
  
  // Show credentials to user (they should save or change password)
  alert(`Welcome! Your temporary password is: ${candidateCredentials.password}`);
  
} else {
  // Existing candidate
  console.log('✅ Application submitted!');
}

console.log('Application ID:', application.id);
console.log('Status:', application.status);
```

---

## 🎯 Three Scenarios

### 1. Anonymous Application (New Candidate)

**Input:**
- No `candidateId` provided
- Email doesn't exist in system
- User is NOT authenticated

**Response:**
- ✅ Creates new candidate account
- ✅ Returns `candidateCredentials` with password and token
- ✅ Application is created and linked

**Example Response:**
```json
{
  "application": { "id": "app-123", "candidateId": "new-candidate-456" },
  "candidateCredentials": {
    "email": "newuser@example.com",
    "password": "AbCdEf",
    "token": "eyJhbGc..."
  },
  "message": "Application submitted successfully! A new candidate account has been created."
}
```

### 2. Anonymous Application (Existing Candidate)

**Input:**
- No `candidateId` provided
- Email EXISTS in system
- User is NOT authenticated

**Response:**
- ✅ Uses existing candidate account
- ❌ NO `candidateCredentials` returned (null)
- ✅ Application is created and linked

**Example Response:**
```json
{
  "application": { "id": "app-789", "candidateId": "existing-candidate-123" },
  "candidateCredentials": null,
  "message": "Application submitted successfully!"
}
```

### 3. Authenticated Application

**Input:**
- Authorization header with JWT token
- `candidateId` is optional (auto-filled from token)
- User IS authenticated

**Response:**
- ✅ Uses authenticated user's ID
- ❌ NO `candidateCredentials` returned (null)
- ✅ Application is created

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🔧 Troubleshooting

### Error: "Cannot query field 'X' on type 'ApplicationResponse'"

**Solution:** Access fields through the `application` object:
```graphql
# ❌ Wrong
createApplication(input: $input) { id }

# ✅ Correct
createApplication(input: $input) { 
  application { id } 
}
```

### Error: "Field candidateId of required type String! was not provided"

**Solution:** Restart server (candidateId should be optional):
```bash
pm2 restart all
```

### Error: "Resume URL is required for anonymous applications"

**Solution:** Upload CV first, then use the URL:
```javascript
// 1. Upload CV
const cvUrl = await uploadCV(file);

// 2. Create application with CV URL
await createApplication({ 
  jobId: "...", 
  resumeUrl: cvUrl  // ← Use the uploaded URL
});
```

---

## 📚 Related Documentation

- **Full Guide:** [ANONYMOUS-APPLICATION-GUIDE.md](./ANONYMOUS-APPLICATION-GUIDE.md)
- **File Upload:** [GRAPHQL-FILE-UPLOAD-GUIDE.md](./GRAPHQL-FILE-UPLOAD-GUIDE.md)
- **Upload Summary:** [UPLOAD-SOLUTION-SUMMARY.md](./UPLOAD-SOLUTION-SUMMARY.md)

---

## ✅ Checklist

Before submitting an application:

- [ ] CV uploaded to S3 (using `uploadCVToS3` mutation)
- [ ] Have the S3 URL for the CV
- [ ] Have the `jobId` for the job
- [ ] Query structure uses `application { }` wrapper
- [ ] Variables are properly formatted as JSON
- [ ] Server is running (`pm2 status`)

---

## 🎉 Success Response Example

```json
{
  "data": {
    "createApplication": {
      "application": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "jobId": "02a0e4f8-f1f2-47d5-a0a0-0924504af0cd",
        "candidateId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "status": "PENDING",
        "appliedAt": "2025-10-17T10:30:00.000Z",
        "job": {
          "id": "02a0e4f8-f1f2-47d5-a0a0-0924504af0cd",
          "title": "Senior Software Engineer"
        }
      },
      "candidateCredentials": {
        "email": "john.doe@example.com",
        "password": "AbCdEf",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwic3ViIjoiN2M5ZTY2NzktNzQyNS00MGRlLTk0NGItZTA3ZmMxZjkwYWU3IiwidXNlclR5cGUiOiJDQU5ESURBVEUiLCJjb21wYW55SWQiOm51bGwsImlhdCI6MTY5NzU0NDYwMH0.xyz123"
      },
      "message": "Application submitted successfully! A new candidate account has been created. Please save your credentials."
    }
  }
}
```

---

**Need help?** Check the full documentation in [ANONYMOUS-APPLICATION-GUIDE.md](./ANONYMOUS-APPLICATION-GUIDE.md)
