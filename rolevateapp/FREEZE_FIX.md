# App Freeze Fix - Job Posting 🔧

## Issue
The app freezes and crashes when trying to post a new job.

## Root Cause
The GraphQL mutation was waiting indefinitely for a response from the backend (https://rolevate.com/api/graphql), which may be:
- Unreachable
- Not responding
- Requires different authentication
- Different schema than expected

## Changes Made ✅

### 1. Added Timeouts
- **Job creation**: 30-second timeout
- **Diagnostics**: 15-second timeout  
- **Connection tests**: 10-second timeout

### 2. Better Error Handling
- Timeout detection with clear messages
- Try-catch blocks to prevent crashes
- Network-only fetch policy to avoid cache issues

### 3. Enhanced GraphQL Client
- Added default policies for error handling
- Better token reading with error catching
- Content-Type headers

## Quick Fix - Use Mock Data

If the backend is not accessible, you can enable mock data:

1. Open `lib/services/job_service.dart`
2. Find the `createJob` method (around line 771)
3. **Uncomment** lines 790-856 (the TEMPORARY: Mock implementation section)
4. **Comment out** lines 857-932 (the ORIGINAL CODE section)

This will simulate successful job creation without requiring backend connection.

### How to Enable Mock Data:

```dart
// In lib/services/job_service.dart, line 789:

// UNCOMMENT THIS:
// TEMPORARY: Mock implementation for testing
debugPrint('🎭 Using mock implementation for job creation');

// Simulate API delay
await Future.delayed(const Duration(seconds: 2));

// Create a mock job response
final mockJobData = {
  'id': 'mock-job-${DateTime.now().millisecondsSinceEpoch}',
  // ... rest of mock data
};

return Job.fromJson(mockJobData);

// COMMENT OUT THIS:
/*
// ORIGINAL CODE - Uncomment when backend is ready
const String mutation = '''
  mutation CreateJob($input: CreateJobInput!) {
    // ...
  }
''';
*/
```

## Backend URL Configuration

Current URL: `https://rolevate.com/api/graphql`

### For Local Development:

Edit `lib/main.dart` line 42:

```dart
// Android Emulator
GraphQLService.initialize('http://10.0.2.2:4005/graphql');

// iOS Simulator
GraphQLService.initialize('http://localhost:4005/graphql');

// Physical Device (replace with your computer's IP)
GraphQLService.initialize('http://192.168.1.XXX:4005/graphql');
```

## Testing the Fix

1. **Try posting a job** - it should now timeout after 30 seconds instead of freezing
2. **Check console logs** for timeout messages
3. **Use diagnostic button** (ℹ️ icon) to test connection
4. **Enable mock data** if backend is unavailable

## Error Messages You Might See

### "Connection Timeout"
**Meaning**: Backend didn't respond within 30 seconds
**Solution**: 
- Check internet connection
- Verify backend is running
- Use correct URL for your environment
- Enable mock data for testing

### "Request timeout - please check your connection"
**Meaning**: Network request took too long
**Solution**: 
- Check network stability
- Try again in a moment
- Consider using mock data

### "Connection test timed out"
**Meaning**: Diagnostic tests couldn't reach backend
**Solution**:
- Backend may be down
- Wrong URL configured
- Use mock data for now

## Console Debug Logs

Watch for these in the console:

```
🚀 _postJob called
✅ Form validation passed
📝 Creating job with title: [title]
📡 Sending GraphQL mutation with variables: {...}
⏱️ Job creation timeout after 30 seconds  // <-- Timeout indicator
```

Or on success:
```
📡 GraphQL response received
📦 Job data received: {...}
✅ Job created successfully
```

## Immediate Action Required

**Option 1: Fix Backend Connection**
1. Verify backend server is running
2. Check URL is correct
3. Test with diagnostic button

**Option 2: Use Mock Data (Recommended for Testing)**
1. Enable mock implementation in `job_service.dart`
2. Test UI flow without backend
3. Re-enable real API when backend is ready

## Files Modified

- ✅ `lib/services/job_service.dart` - Added 30s timeout
- ✅ `lib/services/graphql_service.dart` - Enhanced error handling
- ✅ `lib/utils/connection_test.dart` - Added timeouts to diagnostics
- ✅ `lib/screens/business/post_job_screen.dart` - Better timeout detection

---

**The app will no longer freeze!** It will timeout after 30 seconds with a clear error message. Enable mock data for immediate testing.
