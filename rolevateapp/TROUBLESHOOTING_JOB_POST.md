# Troubleshooting Job Post Failure

## Diagnostic Checklist

### 1. Check Backend Connection
```bash
# Test if the GraphQL endpoint is accessible
curl -X POST https://rolevate.com/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
```

### 2. Check Authentication
- Verify that you're logged in as a BUSINESS user
- Check if the token is being stored correctly in GetStorage
- Verify token is being sent in GraphQL requests

### 3. Check GraphQL Mutation Schema
The app sends this mutation:
```graphql
mutation CreateJob($input: CreateJobInput!) {
  createJob(input: $input) {
    id
    slug
    title
    department
    location
    salary
    type
    jobLevel
    workType
    status
    description
    shortDescription
    responsibilities
    requirements
    benefits
    skills
    deadline
    createdAt
    updatedAt
  }
}
```

### 4. Common Issues

#### Issue 1: Not Logged In
**Symptom:** Unauthorized error
**Solution:** Log in as a BUSINESS user first

#### Issue 2: Backend Not Accessible
**Symptom:** Network error, connection timeout
**Solution:** 
- Check if backend is running
- Verify URL in `lib/main.dart`: `GraphQLService.initialize('https://rolevate.com/api/graphql')`
- For local development, use: `http://localhost:4005/graphql`

#### Issue 3: Schema Mismatch
**Symptom:** GraphQL validation errors
**Solution:** Check backend schema matches the mutation in `job_service.dart`

#### Issue 4: Missing Company Association
**Symptom:** "User must be associated with a company" error
**Solution:** Ensure the logged-in user has a company profile set up

## Debug Steps

### Step 1: Enable Debug Logging
The code already has debug prints. Check the console for:
- `🔧 JobService.createJob called with title:`
- `📡 Sending GraphQL mutation with variables:`
- `❌ GraphQL exception:` (if error occurs)

### Step 2: Test with Mock Data
Uncomment the mock implementation in `job_service.dart` (lines 790-856) to test the UI without backend:

```dart
// Uncomment the TEMPORARY: Mock implementation section
// Comment out the ORIGINAL CODE section
```

### Step 3: Check Network Traffic
Use Flutter DevTools or a proxy tool to inspect the actual HTTP requests being made.

## Quick Fixes

### Fix 1: Update Backend URL for Local Development
```dart
// In lib/main.dart, line 42
GraphQLService.initialize('http://YOUR_LOCAL_IP:4005/graphql');
// For Android emulator: http://10.0.2.2:4005/graphql
// For iOS simulator: http://localhost:4005/graphql
```

### Fix 2: Add Better Error Handling
The error message shown to users should be more specific. Check the console logs for the actual GraphQL error.

### Fix 3: Verify Token Storage
Add this debug check in your login flow:
```dart
final storage = GetStorage();
print('Stored token: ${storage.read('token')}');
print('Stored user type: ${storage.read('userType')}');
```

## Testing Checklist

- [ ] Backend is running and accessible
- [ ] Logged in as BUSINESS user
- [ ] User has company profile
- [ ] Network connection is stable
- [ ] GraphQL schema matches mutation
- [ ] Token is stored and sent correctly
- [ ] Console shows debug logs
- [ ] Error messages are descriptive

## Next Steps

1. Check the console output when clicking "Post Job"
2. Look for the debug prints starting with emoji symbols (🔧, 📡, ❌, ✅)
3. Share the error message if any
4. Verify backend logs if accessible
