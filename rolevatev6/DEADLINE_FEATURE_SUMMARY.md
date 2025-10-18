# Job Deadline Feature - Implementation Summary

## Overview
Added job application deadline display throughout the Rolevate platform to help candidates see when they need to apply before opportunities close.

## Changes Made

### 1. Type Definitions
**File:** `src/types/jobs.ts`
- Added `deadline?: string` field to Job interface

### 2. GraphQL Queries Updated
**File:** `src/services/jobs.service.ts`
- `GET_JOB_BY_ID_QUERY` - Added deadline field
- `GET_COMPANY_JOBS_QUERY` - Added deadline field  
- `GET_FEATURED_JOBS_QUERY` - Added deadline field

### 3. Service Mapping Updated
**File:** `src/services/jobs.service.ts`
Updated all job mapping functions to include deadline:
- `getJobs()` - Maps deadline field
- `getPublicJobs()` - Maps deadline field
- `getFeaturedJobs()` - Maps deadline field
- `getJobBySlug()` - Maps deadline field

### 4. UI Components

#### JobCard Component
**File:** `src/components/common/JobCard.tsx`
- Added `formatDeadlineDate()` helper function
- Displays deadline with color-coded urgency:
  - 🔴 **Red**: Deadline has passed
  - 🟠 **Orange**: Deadline within 7 days (urgent)
  - ⚫ **Gray**: Deadline more than 7 days away
- Format examples:
  - "Due in 3 days"
  - "Due tomorrow"
  - "Due today"
  - "Deadline passed"

#### Job Details Page
**File:** `src/app/(website)/jobs/[slug]/page.tsx`
- Added `formatDeadlineDate()` helper function
- Displays deadline in two locations:
  - Header section (next to posted date)
  - Sidebar job details section
- Color-coded with orange/red icons based on urgency

### 5. Display Locations
Deadline now appears on:
- ✅ Homepage featured job cards
- ✅ Jobs listing page (all job cards)
- ✅ Job details page (header + sidebar)
- ✅ All job card components throughout the site

## Color Coding Logic

```typescript
if (new Date(deadline) < new Date()) {
  // Red - Deadline passed
  color = 'text-red-600'
} else if (deadline - now < 7 days) {
  // Orange - Urgent (less than 7 days)
  color = 'text-orange-600'
} else {
  // Gray - Normal (more than 7 days)
  color = 'text-slate-600'
}
```

## Backend Requirements

The backend GraphQL API must return the `deadline` field in the following queries:
- `jobBySlug(slug: String!)`
- `jobs(filter: JobFilterInput, pagination: PaginationInput)`

Deadline should be in ISO date format (e.g., "2025-10-25T00:00:00Z")

## Testing Checklist

- [ ] Verify deadline displays on homepage featured jobs
- [ ] Verify deadline displays on jobs listing page
- [ ] Verify deadline displays on job details page
- [ ] Verify color coding works correctly:
  - [ ] Red for passed deadlines
  - [ ] Orange for deadlines within 7 days
  - [ ] Gray for normal deadlines
- [ ] Verify date formatting is user-friendly
- [ ] Verify deadline only shows when available (graceful handling when null)

## Future Enhancements

1. Add deadline sorting option on jobs listing page
2. Add filter to show only jobs with active deadlines
3. Add deadline countdown timer for urgent jobs
4. Send notifications when deadline is approaching
5. Hide or mark jobs where deadline has passed
