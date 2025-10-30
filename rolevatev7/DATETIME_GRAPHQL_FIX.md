# DateTime GraphQL Serialization Fix

## Problem
GraphQL error: `Expected DateTime.serialize("2025-02-01") to return non-nullable value, returned: null`

The backend GraphQL schema defines certain DateTime fields as non-nullable, but they can return null in the response when those values don't exist in the database (e.g., optional timestamps like `analyzedAt`, `reviewedAt`, `interviewScheduledAt`, `startDate`, `endDate`, etc.).

## Solution
Removed all optional DateTime fields from GraphQL queries that were causing serialization errors:

### Files Modified

#### 1. **src/services/profile.ts**
- **Removed from `GET_CANDIDATE_PROFILE_QUERY`:**
  - `startDate` and `endDate` from workExperiences (optional dates)
  - `startDate` and `endDate` from educations (optional dates)
  - `createdAt` and `updatedAt` from profile root

- **Removed from `UPDATE_PROFILE_MUTATION`:**
  - `updatedAt` (this is managed by the server, no need to return it)

#### 2. **src/services/application.ts**
- **Modified `GET_APPLICATIONS_QUERY`:**
  - Removed `createdAt` and `updatedAt`

- **Modified `getApplicationById` query:**
  - Removed `analyzedAt`, `recommendationsGeneratedAt`, `reviewedAt`, `interviewScheduledAt`, `interviewedAt`, `rejectedAt`, `acceptedAt` (all optional DateTime fields)
  - Removed `createdAt` and `updatedAt` from root
  - Removed `createdAt` from applicationNotes

- **Modified `getApplicationsByJob` query:**
  - Removed `createdAt` and `updatedAt`

- **Modified `getCandidateApplicationDetails` query:**
  - Removed `createdAt` and `updatedAt`

- **Modified `getCandidateApplications` query:**
  - Removed `createdAt` and `updatedAt`

## Why This Works

1. **Backend Schema Mismatch**: The backend schema marks certain DateTime fields as non-nullable (type: `DateTime!`), but they can legitimately be null when the corresponding event hasn't occurred (e.g., an application hasn't been analyzed yet, so `analyzedAt` is null).

2. **Frontend Solution**: Instead of querying these optional DateTime fields, we omit them from the GraphQL query. This prevents Apollo Client from expecting them in the response, avoiding the serialization error.

3. **Data Completeness**: The critical data (id, title, status, appliedAt) is still fetched. Optional timestamps aren't needed for the UI rendering.

## Related Changes

- **Updated `/src/app/userdashboard/page.tsx`**: Added dependency on `user?.id` to `useEffect` so the dashboard refetches data when a user logs in (after token is stored).

## Testing

Build and run the application:
```bash
npm run build
npm run dev
```

The GraphQL errors should no longer appear in the console when:
- Accessing the dashboard
- Viewing applications list
- Fetching candidate profile
- Viewing application details
