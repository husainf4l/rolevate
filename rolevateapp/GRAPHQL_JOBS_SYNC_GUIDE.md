# GraphQL Jobs Synchronization Guide

## Problem Summary

**Issue:** "English Teacher" job is visible in Flutter app but NOT visible on web frontend.

**Root Cause:** Flutter app is using **MOCK/LOCAL STORAGE** while web frontend queries the **REAL BACKEND**.

## Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FLUTTER APP (Mobile)                    │
├─────────────────────────────────────────────────────────────┤
│  job_service.dart                                           │
│  ├─ createJob() → Saves to GetStorage (LOCAL)              │
│  ├─ getCompanyJobs() → Reads from GetStorage (LOCAL)       │
│  └─ getJobs() → Returns MOCK data                          │
│                                                             │
│  Storage Location: GetStorage('mock_created_jobs')          │
│  Data: [{ id: 'mock-job-1761516974589',                    │
│           title: 'English teacher', ... }]                  │
└─────────────────────────────────────────────────────────────┘
                              ❌ NOT SYNCED ❌
┌─────────────────────────────────────────────────────────────┐
│                     WEB FRONTEND (Next.js)                  │
├─────────────────────────────────────────────────────────────┤
│  Apollo Client                                              │
│  └─ query jobs → GraphQL API (BACKEND)                     │
└─────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────┐
│                BACKEND (NestJS + PostgreSQL)                │
├─────────────────────────────────────────────────────────────┤
│  GraphQL API: https://rolevate.com/api/graphql             │
│  Database: PostgreSQL                                       │
│  Job Table: Contains all real jobs                         │
└─────────────────────────────────────────────────────────────┘
```

## Flutter App Debug Logs

```
I/flutter: 🔧 JobService.getCompanyJobs called
I/flutter: 🎭 Using mock implementation for company jobs fetching
I/flutter: ✅ Mock company jobs fetched successfully (3 jobs)
I/flutter: 📊 Mock jobs: 2, Created jobs: 1
I/flutter: 📋 Total jobs from persistent storage: 1
I/flutter: 🆕 Newly created jobs from storage:
I/flutter:    - English teacher (ID: mock-job-1761516974589)
```

## GraphQL Queries & Mutations

### 1. Get All Jobs (What Web Uses)

```graphql
query GetJobs($filter: JobFilterInput, $pagination: PaginationInput) {
  jobs(filter: $filter, pagination: $pagination) {
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
    shortDescription
    applicants
    views
    featured
    deadline
    createdAt
    updatedAt
    company {
      id
      name
      logo
      industry
      size
      location
    }
    postedBy {
      id
      name
      avatar
    }
  }
}
```

### 2. Create Job (What Flutter Should Use)

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
    company {
      id
      name
    }
    postedBy {
      id
      name
    }
  }
}
```

### 3. Get Company Jobs

```graphql
query GetCompanyJobs {
  companyJobs {
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
    applicants
    views
    featured
    deadline
    createdAt
    updatedAt
  }
}
```

## Testing GraphQL with cURL

### Get All Jobs
```bash
curl 'https://rolevate.com/api/graphql' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -d '{
    "query": "query GetJobs { jobs { id title department location status createdAt company { name } } }"
  }' | jq '.'
```

### Create Job
```bash
curl 'https://rolevate.com/api/graphql' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -d '{
    "query": "mutation CreateJob($input: CreateJobInput!) { createJob(input: $input) { id title status } }",
    "variables": {
      "input": {
        "title": "English Teacher",
        "department": "Education",
        "location": "Dubai, UAE",
        "salary": "AED 8,000 - 12,000",
        "type": "FULL_TIME",
        "jobLevel": "ENTRY",
        "workType": "ONSITE",
        "description": "We are looking for an experienced English teacher...",
        "shortDescription": "English teacher needed",
        "deadline": "2025-12-31T00:00:00.000Z"
      }
    }
  }' | jq '.'
```

### Get Token from Flutter Storage
```bash
# The token is stored in GetStorage with key 'access_token'
# You can view it in the Flutter app debug console or device storage
```

## Solution: Enable Backend in Flutter

### Step 1: Uncomment Real Backend Code in `job_service.dart`

Currently, the code has this structure:
```dart
Future<Job> createJob(...) async {
  // TEMPORARY: Mock implementation (lines 800-850)
  // ORIGINAL CODE: GraphQL mutation (lines 852-900) - COMMENTED OUT
}
```

**Action:** Remove the mock implementation and uncomment the GraphQL code.

### Step 2: File Location
```
/Users/husain/Desktop/rolevate/rolevateapp/lib/services/job_service.dart
```

### Step 3: Functions to Update

1. **`createJob()`** (Line ~755)
   - Remove mock implementation
   - Uncomment GraphQL mutation
   
2. **`getJobs()`** (Line ~50)
   - Remove mock implementation
   - Uncomment GraphQL query

3. **`getCompanyJobs()`** (Line ~365)
   - Remove mock implementation  
   - Uncomment GraphQL query

4. **`getJob()`** / **`getJobById()`** (Line ~225)
   - Remove mock implementation
   - Uncomment GraphQL query

### Step 4: Verify GraphQL Client Configuration

Check `lib/services/graphql_service.dart`:
```dart
class GraphQLService {
  static void initialize(String endpoint) {
    _endpoint = endpoint;
    // Should be: https://rolevate.com/api/graphql
  }
}
```

### Step 5: Verify Authentication

Check token in `lib/controllers/auth_controller.dart`:
```dart
final storage = GetStorage();
final token = storage.read('access_token');
// This token must be valid and sent with GraphQL requests
```

## Quick Fix Commands

### 1. Find All Mock Implementations
```bash
cd /Users/husain/Desktop/rolevate/rolevateapp
grep -n "TEMPORARY: Mock implementation" lib/services/job_service.dart
```

### 2. Check Current Endpoint
```bash
grep -n "GraphQLService.initialize" lib/main.dart
```

### 3. Test Backend Connectivity
```bash
# Get token from Flutter debug console
# Then run:
curl -X POST https://rolevate.com/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query":"{ __typename }"}' | jq '.'
```

## Expected Behavior After Fix

### Before (Current)
```
Flutter App → GetStorage (Local) → Shows "English Teacher" ✅
Web Frontend → GraphQL API → Shows NO "English Teacher" ❌
```

### After (Fixed)
```
Flutter App → GraphQL API → PostgreSQL → Shows "English Teacher" ✅
Web Frontend → GraphQL API → PostgreSQL → Shows "English Teacher" ✅
```

## Implementation Steps

1. **Backup Current Code**
   ```bash
   cp lib/services/job_service.dart lib/services/job_service.dart.backup
   ```

2. **Edit job_service.dart**
   - Comment out lines 50-90 (mock getJobs)
   - Uncomment lines 92-140 (real getJobs)
   - Repeat for other functions

3. **Clear Local Storage**
   ```dart
   // Add this to test with clean state
   final storage = GetStorage();
   storage.remove('mock_created_jobs');
   ```

4. **Test Create Job**
   - Open Flutter app
   - Post a new job
   - Check Flutter logs for GraphQL mutation
   - Verify job appears on web frontend

5. **Verify Synchronization**
   - Create job on Flutter → Should appear on Web ✅
   - Create job on Web → Should appear on Flutter ✅

## Debugging Checklist

- [ ] GraphQL endpoint is `https://rolevate.com/api/graphql`
- [ ] Access token is present and valid
- [ ] Authorization header format: `Bearer <token>`
- [ ] Mock implementations are commented out
- [ ] Real GraphQL code is uncommented
- [ ] Network requests are successful (check logs)
- [ ] Jobs appear in both Flutter and Web
- [ ] Database contains the jobs

## Common Errors

### 1. "Forbidden resource" (403)
**Cause:** Invalid or expired token  
**Fix:** Re-login in Flutter app to get new token

### 2. "Network Error"
**Cause:** Backend not running or wrong URL  
**Fix:** Check backend is running at https://rolevate.com

### 3. "Null response"
**Cause:** Query syntax error  
**Fix:** Compare with working web frontend queries

### 4. Jobs still showing from local storage
**Cause:** Didn't clear GetStorage  
**Fix:** Add `storage.remove('mock_created_jobs')` and restart app

## Verification Steps

```bash
# 1. Check backend is running
curl https://rolevate.com/api/graphql -I

# 2. Test GraphQL endpoint
curl -X POST https://rolevate.com/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}' | jq '.'

# 3. Get jobs count
curl -X POST https://rolevate.com/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query":"query { jobs { id title } }"}' | jq '.data.jobs | length'
```

## Next Actions

1. ✅ **Immediate:** Switch Flutter from mock to real backend
2. ✅ **Testing:** Verify jobs sync between Flutter and Web
3. ✅ **Cleanup:** Remove mock data storage code
4. ✅ **Documentation:** Update README with backend requirements

---

**Created:** October 27, 2025  
**Last Updated:** October 27, 2025  
**Status:** Ready for Implementation
