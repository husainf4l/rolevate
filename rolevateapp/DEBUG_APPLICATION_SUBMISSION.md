# Debug Application Submission - Real-Time Testing

## Current Status
🔧 **DEBUGGING MODE ENABLED** - Resume upload temporarily disabled to isolate the application submission issue

## Changes Made for Debugging

### 1. Disabled Resume Upload (Temporary)
**File:** `lib/screens/job_application_screen.dart`
**Line:** ~151

Resume upload is commented out to test if the application submission works without it.

### 2. Enhanced Logging
**File:** `lib/services/application_service.dart`

Added extensive debug logging to track:
- ✅ Authentication token presence and format
- ✅ Request payload being sent
- ✅ Response from backend
- ✅ Detailed error information

## How to Test RIGHT NOW

### Step 1: Hot Restart the App
```bash
# In the terminal where Flutter is running, press:
r  # for hot reload
# OR
R  # for hot restart (recommended)
```

### Step 2: Watch the Logs
Open a new terminal and run:
```bash
cd /Users/husain/Desktop/rolevate/rolevateapp
flutter logs | grep -E "📤|📝|📄|🔑|🌐|📥|📊|❌|✅|⚠️"
```

### Step 3: Submit an Application
1. Open the app
2. Browse jobs
3. Select a job
4. Click "Apply Now"
5. Fill in the form (NO resume needed now)
6. Click "Submit Application"

### Step 4: Read the Logs

#### Expected Success Flow:
```
⚠️ SKIPPING RESUME UPLOAD FOR TESTING
📝 No resume selected - proceeding without resume
📤 Submitting application for job: xxx
📝 Cover letter length: 0
📄 Resume URL: none
📝 Application variables: {"jobId":"xxx","source":"mobile_app",...}
🔐 Checking authentication token...
🔑 Token present: YES (length: xxx)
🔑 Token starts with: eyJhbGciOiJIUzI1NiIs...
🌐 Sending GraphQL mutation to backend...
📥 Received response from backend
📊 Has exception: false
📊 Has data: true
✅ Application created successfully: yyy
```

#### If Authentication Fails:
```
🔑 Token present: NO - THIS WILL FAIL!
OR
🔑 Token present: YES (length: xxx)
🌐 Sending GraphQL mutation to backend...
📥 Received response from backend
📊 Has exception: true
❌ GraphQL Exception: ...
❌ Error message: Forbidden resource
```

**Fix:** You need to log in first!

#### If Network Error:
```
🌐 Sending GraphQL mutation to backend...
❌ Link exception: SocketException: ...
```

**Fix:** Check internet connection or backend URL

#### If GraphQL Error:
```
📥 Received response from backend
📊 Has exception: true
❌ GraphQL Exception: ...
❌ Error message: [specific error]
❌ Error extensions: {code: "XXX", ...}
```

**Fix:** Read the error message - it tells you exactly what's wrong!

## Common Issues and Fixes

### Issue 1: "Token present: NO"
**Problem:** User is not logged in
**Fix:** 
```dart
// In the app, navigate to login and log in
// OR check GetStorage:
final storage = GetStorage();
print(storage.read('access_token'));
```

### Issue 2: "Authentication required"
**Problem:** Token is invalid or expired
**Fix:** Log out and log back in

### Issue 3: "Already applied"
**Problem:** You already applied to this job
**Fix:** Test with a different job

### Issue 4: "Job not found"
**Problem:** Invalid job ID
**Fix:** Make sure the job exists and the ID is correct

### Issue 5: Network Error
**Problem:** Can't reach backend
**Fix:** 
1. Check backend is running at https://rolevate.com/api/graphql
2. Test with curl:
```bash
curl -X POST https://rolevate.com/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}' | jq '.'
```

## What to Do After Testing

### If Application Submission Works:
✅ The problem was the resume upload mutation name or logic
- Re-enable resume upload with the fixed mutation name
- Test resume upload separately

### If Application Submission STILL Fails:
❌ The problem is deeper - look at the error message:

1. **Copy the exact error message from logs**
2. **Check if token is present**
3. **Verify you're logged in**
4. **Check network connectivity**
5. **Share the logs with me**

## Restore Resume Upload

Once we confirm application submission works, uncomment this code:

**File:** `lib/screens/job_application_screen.dart` ~Line 151

```dart
// Change from:
String? resumeUrl;
debugPrint('⚠️ SKIPPING RESUME UPLOAD FOR TESTING');

// Back to:
String? resumeUrl;
if (_selectedResume != null) {
  debugPrint('📤 Uploading resume to S3...');
  try {
    final filename = _selectedResume!.path.split('/').last;
    resumeUrl = await _applicationService.uploadCVToS3(
      filePath: _selectedResume!.path,
      filename: filename,
      candidateId: null,
    );
    debugPrint('✅ Resume uploaded: $resumeUrl');
  } catch (uploadError) {
    // ... error handling
  }
}
```

## Quick Test Commands

```bash
# Check if backend is up
curl -I https://rolevate.com/api/graphql

# Test GraphQL endpoint
curl -X POST https://rolevate.com/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}' | jq '.'

# Check available mutations
curl -X POST https://rolevate.com/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { mutationType { fields { name } } } }"}' | \
  jq '.data.__schema.mutationType.fields[].name' | grep -i upload

# Result should show:
# "uploadFileToS3"
# "uploadCVToS3"
```

## Next Steps Based on Results

### Scenario A: Works without resume ✅
→ Problem was resume upload
→ Keep the uploadFileToS3 mutation fix
→ Test resume upload separately

### Scenario B: Fails with "Authentication required" ❌
→ Problem is authentication
→ Check token storage
→ Verify user is logged in
→ Check GraphQLService.updateClient() is called after login

### Scenario C: Fails with other GraphQL error ❌
→ Problem is in the mutation or input
→ Check the exact error message
→ Verify CreateApplicationInput matches backend schema
→ Test the mutation directly with curl

### Scenario D: Network error ❌
→ Problem is connectivity or CORS
→ Test backend with curl
→ Check if app can reach the server
→ Try on different network

---

**Created:** October 27, 2025
**Status:** 🔧 ACTIVE DEBUGGING
**Action Required:** TEST NOW and report results!
