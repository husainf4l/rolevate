# Application Status Enum Fix

## Issue
The frontend was using incorrect status enum values that didn't match the GraphQL backend schema, causing validation errors.

## Backend Status Enum Values
According to the GraphQL schema (`ApplicationStatus` enum):
- `PENDING` - Initial submission state
- `REVIEWED` - Application has been reviewed
- `SHORTLISTED` - Candidate shortlisted for interview
- `INTERVIEWED` - Interview completed
- `OFFERED` - Job offer extended
- `HIRED` - Candidate hired
- `ANALYZED` - CV analysis completed
- `REJECTED` - Application rejected
- `WITHDRAWN` - Application withdrawn

## Frontend Changes Made

### 1. Updated Type Definitions (`src/services/application.ts`)
**Before:**
```typescript
status: 'SUBMITTED' | 'REVIEWING' | 'INTERVIEW_SCHEDULED' | 'INTERVIEWED' | 'OFFERED' | 'REJECTED' | 'WITHDRAWN' | 'PENDING' | 'ANALYZED';
```

**After:**
```typescript
status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'INTERVIEWED' | 'OFFERED' | 'HIRED' | 'ANALYZED' | 'REJECTED' | 'WITHDRAWN';
```

### 2. Fixed GraphQL Mutation (`src/services/application.ts`)
**Before:**
```typescript
mutation UpdateApplicationStatus($id: String!, $status: String!) {
  updateApplicationStatus(id: $id, status: $status) { ... }
}
```

**After:**
```typescript
mutation UpdateApplicationStatus($id: ID!, $input: UpdateApplicationInput!) {
  updateApplication(id: $id, input: $input) { ... }
}
```

Changes:
- Mutation name: `updateApplicationStatus` → `updateApplication`
- Variable type: `$id: String!` → `$id: ID!`
- Parameters: Changed from individual `status` parameter to `input` object containing status
- Variables: `{ id, status }` → `{ id, input: { status } }`

### 3. Updated UI Components (`src/app/dashboard/candidates/[id]/page.tsx`)
- Updated `getStatusColor()` function with all 9 status values
- Updated `getStatusIcon()` function with all 9 status values
- Changed button actions from old statuses to new ones:
  - `REVIEWING` → `REVIEWED`
  - `INTERVIEW_SCHEDULED` → `SHORTLISTED`

## Status Mapping Guide
| Old Status (Frontend) | New Status (Backend) | Description |
|-----------------------|---------------------|-------------|
| SUBMITTED | PENDING | Initial application state |
| REVIEWING | REVIEWED | Under review |
| INTERVIEW_SCHEDULED | SHORTLISTED | Shortlisted for interview |
| INTERVIEWED | INTERVIEWED | Interview completed |
| OFFERED | OFFERED | Offer extended |
| N/A | HIRED | Candidate hired |
| ANALYZED | ANALYZED | CV analyzed |
| REJECTED | REJECTED | Application rejected |
| WITHDRAWN | WITHDRAWN | Application withdrawn |

## Files Modified
1. `/src/services/application.ts` - Type definitions and GraphQL mutation
2. `/src/app/dashboard/candidates/[id]/page.tsx` - UI components and status handling

## Testing
Test the status update functionality by:
1. Opening a candidate detail page
2. Clicking "Move to Review" button
3. Verify status updates to "REVIEWED" without errors
4. Test other status transitions (Shortlist, Interview, Offer, Reject)

## Next Steps
You may need to update similar status references in:
- `/src/app/dashboard/candidates/page.tsx`
- `/src/app/dashboard/jobs/[id]/applications/page.tsx`
- `/src/components/dashboard/RecentCVs.tsx`
- Other files using the old status enum values

Search for: `REVIEWING`, `INTERVIEW_SCHEDULED`, `SUBMITTED` to find remaining references.
