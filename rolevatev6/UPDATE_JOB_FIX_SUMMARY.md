# UpdateJob Mutation Fix - Summary

## Problem
When clicking "Publish" on a job in the dashboard, you were getting this error:
```json
{
  "errors": [{
    "message": "Unknown argument \"id\" on field \"Mutation.updateJob\".",
    "extensions": {
      "code": "GRAPHQL_VALIDATION_FAILED"
    }
  }]
}
```

## Root Cause
The backend GraphQL schema expects the `updateJob` mutation to receive the `id` **inside** the `input` object, not as a separate argument.

### ❌ Incorrect (what your code was doing):
```graphql
mutation UpdateJob($id: ID!, $input: UpdateJobInput!) {
  updateJob(id: $id, input: $input) {
    id
    title
  }
}
```

### ✅ Correct (what the backend expects):
```graphql
mutation UpdateJob($input: UpdateJobInput!) {
  updateJob(input: $input) {
    id
    title
  }
}
```

Where the `input` object must include the `id`:
```typescript
{
  input: {
    id: "job-id-here",
    title: "New Title",
    status: "ACTIVE"
  }
}
```

## Files Fixed

### 1. `/src/services/job.service.ts` ✅
- Updated `UpdateJobInput` interface to include `id: string`
- Changed mutation from `updateJob(id: $id, input: $input)` to `updateJob(input: $input)`
- Updated `updateJob()` method to merge id into input object

### 2. `/src/services/job.ts` ✅
- Updated `UpdateJobInput` interface to include `id: string`
- Changed mutation from `updateJob(id: $id, input: $input)` to `updateJob(input: $input)`
- Updated `updateJob()` method to merge id into input object

### 3. `/src/services/jobs.service.ts` ✅
- Changed mutation from `updateJob(id: $id, input: $input)` to `updateJob(input: $input)`
- Updated `updateJob()` method to merge id into input object

## Changes Made

### UpdateJobInput Interface
```typescript
// BEFORE
export interface UpdateJobInput {
  title?: string;
  department?: string;
  // ... other fields
}

// AFTER
export interface UpdateJobInput {
  id: string;  // ID is now required
  title?: string;
  department?: string;
  // ... other fields
}
```

### GraphQL Mutation
```typescript
// BEFORE
private UPDATE_JOB_MUTATION = gql`
  mutation UpdateJob($id: ID!, $input: UpdateJobInput!) {
    updateJob(id: $id, input: $input) {
      id
      title
      description
      status
    }
  }
`;

// AFTER
private UPDATE_JOB_MUTATION = gql`
  mutation UpdateJob($input: UpdateJobInput!) {
    updateJob(input: $input) {
      id
      title
      description
      status
    }
  }
`;
```

### UpdateJob Method
```typescript
// BEFORE
async updateJob(id: string, input: UpdateJobInput): Promise<Job> {
  const { data } = await apolloClient.mutate<{ updateJob: Job }>({
    mutation: this.UPDATE_JOB_MUTATION,
    variables: { id, input }
  });
  return data.updateJob;
}

// AFTER
async updateJob(id: string, input: Omit<UpdateJobInput, 'id'>): Promise<Job> {
  const { data } = await apolloClient.mutate<{ updateJob: Job }>({
    mutation: this.UPDATE_JOB_MUTATION,
    variables: { 
      input: {
        id,
        ...input
      }
    }
  });
  return data.updateJob;
}
```

## Testing

### Test the fix with curl:
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "mutation UpdateJob($input: UpdateJobInput!) { updateJob(input: $input) { id title status } }",
    "variables": {
      "input": {
        "id": "your-job-id",
        "title": "Updated Title",
        "status": "ACTIVE"
      }
    }
  }'
```

### Or use the test script:
```bash
./test-update-job.sh
```

## Impact
- ✅ Publishing jobs from the dashboard will now work
- ✅ Activating/pausing jobs will work
- ✅ Any other job updates will work
- ✅ No changes needed to how you call the service methods (the API stays the same)

## Next Steps
1. Save all files (if not auto-saved)
2. Restart your Next.js dev server if needed:
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```
3. Test publishing a job from the dashboard
4. The error should be gone! ✅

## Why This Happened
You likely have multiple service files for historical reasons or different features. The backend GraphQL schema was designed to accept the `id` as part of the input object, which is actually a better design pattern for updates as it keeps all mutation parameters in a single input type.

## Additional Notes
- The method signature `updateJob(id: string, input: Omit<UpdateJobInput, 'id'>)` ensures TypeScript users don't pass `id` twice
- The internal implementation merges the `id` into the input object automatically
- This is backward compatible with your existing code that calls `jobService.updateJob(id, { status: 'ACTIVE' })`
