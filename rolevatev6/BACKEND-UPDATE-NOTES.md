# Backend Update Notes - Applications API

## Issue
The `/userdashboard/applications` page is getting a **"Forbidden resource"** error when trying to fetch candidate applications.

## Current Problem
The frontend is calling the `applications` query, but this query appears to be restricted to **company users only**. When a candidate user tries to access it, they get a forbidden error.

```graphql
query GetCandidateApplications {
  applications {
    id
    appliedAt
    job {
      id
      title
      company {
        name
      }
    }
    status
    cvAnalysisScore
    cvAnalysisResults
    coverLetter
    expectedSalary
    resumeUrl
    createdAt
    updatedAt
  }
}
```

## Available Queries in Schema
I found these application-related queries:
- `applications` - Currently forbidden for candidates
- `application(id: ID!)` - Get single application by ID
- `applicationsByCandidate(candidateId: ID!)` - Requires candidateId parameter
- `applicationsByJob(jobId: ID!)` - For company users

## Recommended Solutions

### Option 1: Make `applications` Query User-Context Aware (RECOMMENDED)
Modify the `applications` query resolver to automatically filter based on the authenticated user's role:

**For CANDIDATE users:**
- Return only applications where `application.candidate.id` matches the authenticated user's candidate profile ID
- No need to pass candidateId as parameter

**For BUSINESS users:**
- Return applications for jobs belonging to their company
- Current behavior (company-scoped)

**Benefits:**
- Single query works for both user types
- Simpler frontend code
- Better security (automatic filtering based on auth context)

### Option 2: Create a New Query `myApplications`
Add a new query specifically for candidates:

```graphql
type Query {
  myApplications(
    filter: ApplicationFilterInput
    pagination: ApplicationPaginationInput
  ): [Application!]!
}
```

**Resolver logic:**
- Verify user is authenticated
- Get candidateId from authenticated user's profile
- Return applications filtered by candidateId
- Apply additional filters if provided

### Option 3: Make `applicationsByCandidate` Work Without Parameter
Modify `applicationsByCandidate` to:
- Accept candidateId as **optional** parameter
- If no candidateId provided, use authenticated user's candidate profile ID
- If candidateId provided, verify user has permission to view those applications

## Required Fields in Response
The frontend expects these fields in the Application type:

```graphql
type Application {
  id: ID!
  appliedAt: DateTime!
  job: Job!              # Must include id, title, company.name
  status: ApplicationStatus!
  cvAnalysisScore: Float
  cvAnalysisResults: JSON
  coverLetter: String
  expectedSalary: String
  resumeUrl: String
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

## Status Enum
Frontend is mapping these backend statuses:
- `PENDING` → "submitted"
- `ANALYZED` → "reviewing"
- `REVIEWED` → "reviewing"
- `SHORTLISTED` → "interview"
- `INTERVIEWED` → "interview"
- `OFFERED` → "offered"
- `HIRED` → "accepted"
- `REJECTED` → "rejected"
- `WITHDRAWN` → "withdrawn"

Ensure all these status values are supported in the backend.

## Authentication Context
The frontend sends authentication via:
- **Bearer Token** in `Authorization` header
- **Cookies** with `credentials: 'include'`

Make sure the resolver can extract:
1. User ID from the authenticated token
2. User type (CANDIDATE vs BUSINESS)
3. Associated candidateProfile.id for candidate users
4. Associated company.id for business users

## Testing Checklist
After implementing the fix:

✅ **Candidate User:**
- [ ] Can fetch their own applications
- [ ] Cannot see applications from other candidates
- [ ] Receives all required fields in response
- [ ] Can filter by status
- [ ] Can paginate results

✅ **Business User:**
- [ ] Can fetch applications for their company's jobs
- [ ] Cannot see applications for other companies
- [ ] Existing functionality still works

✅ **Unauthenticated User:**
- [ ] Gets proper authentication error (not forbidden)

## Frontend Impact
Once backend is updated, no frontend changes needed if you choose **Option 1**.

For Options 2 or 3, I'll need to update the query in:
- `/src/services/application.ts` - `getCandidateApplications()` function

## Priority
**HIGH** - This blocks candidates from viewing their application history, which is a core user feature.

## Additional Context
- Frontend file: `/src/app/userdashboard/applications/page.tsx`
- Service file: `/src/services/application.ts`
- GraphQL endpoint: `http://localhost:4005/api/graphql`
- The query works fine from company dashboard, only fails for candidates

---

**Question for Backend Team:**
Which option do you prefer? Option 1 (modify existing query) is recommended as it provides the best user experience and security model.
