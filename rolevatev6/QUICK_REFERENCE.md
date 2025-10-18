# Quick Reference - GraphQL Services

## All Available Services

```typescript
import { 
  authService,
  jobsService, 
  applicationService,
  roomService 
} from '@/services';
```

---

## 1. Auth Service

### Login
```typescript
const { token, user } = await authService.login(email, password);
```

### Get Current User
```typescript
const user = await authService.getCurrentUser();
```

### Logout
```typescript
authService.logout();
```

---

## 2. Jobs Service

### Get Public Jobs (ACTIVE only)
```typescript
const response = await jobsService.getPublicJobs(page, limit, filters);
```

### Get All Jobs (with auth filtering)
```typescript
const response = await jobsService.getJobs(page, limit, filters);
```

### Get Company Jobs (ALL statuses)
```typescript
const jobs = await jobsService.getCompanyJobs(page, limit, filters);
```

### Get Job by Slug
```typescript
const job = await jobsService.getJobBySlug(slug);
```

### Create Job
```typescript
const job = await jobsService.createJob(input);
```

### Update Job
```typescript
const job = await jobsService.updateJob(id, { 
  title: "New Title",
  status: "ACTIVE"
});
```

### Delete Job
```typescript
const success = await jobsService.deleteJob(id);
```

---

## 3. Application Service

### Get Applications
```typescript
const applications = await applicationService.getApplications();
```

### Get Application by ID
```typescript
const application = await applicationService.getApplication(id);
```

### Create Application
```typescript
const application = await applicationService.createApplication({
  jobId,
  candidateId,
  ...data
});
```

### Update Application Status
```typescript
const application = await applicationService.updateStatus(id, 'ACCEPTED');
```

---

## 4. Room Service (NEW)

### Create Interview Room
```typescript
const response = await roomService.createInterviewRoom({
  jobId: 'job-123',
  phone: '+1234567890',
  roomName: 'interview_app123_1234567890'
});

// Response includes:
// - room (id, name, metadata)
// - token (LiveKit token)
// - liveKitUrl
// - interviewContext (candidate, job, company info)
// - interviewSummary
// - instructions
```

### Get Room Status
```typescript
const status = await roomService.getRoomStatus(roomName);

// Returns:
// - exists: boolean
// - active: boolean
// - participantCount: number
// - metadata: object
```

### Generate Room Name
```typescript
const roomName = roomService.generateRoomName('app_123');
// Returns: "interview_app_123_1234567890"
```

---

## Common Patterns

### Error Handling
```typescript
try {
  const result = await jobsService.createJob(input);
  console.log('Success:', result);
} catch (error) {
  console.error('Error:', error.message);
  // Handle error
}
```

### With Loading State
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchJobs = async () => {
  setLoading(true);
  setError(null);
  try {
    const jobs = await jobsService.getPublicJobs();
    return jobs;
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Pagination
```typescript
const page = 1;
const limit = 10;
const filters = { search: 'developer', location: 'Remote' };

const response = await jobsService.getJobs(page, limit, filters);
console.log(`Page ${response.page} of ${response.pages}`);
console.log(`Total: ${response.total} jobs`);
console.log('Jobs:', response.jobs);
```

---

## GraphQL Query Examples

### Direct Apollo Client Usage
```typescript
import { apolloClient } from '@/lib/apollo';
import { gql } from '@apollo/client';

const { data } = await apolloClient.query({
  query: gql`
    query GetJobs {
      jobs {
        id
        title
        status
      }
    }
  `
});
```

### With Variables
```typescript
const { data } = await apolloClient.mutation({
  mutation: gql`
    mutation UpdateJob($input: UpdateJobInput!) {
      updateJob(input: $input) {
        id
        title
      }
    }
  `,
  variables: {
    input: {
      id: '123',
      title: 'New Title'
    }
  }
});
```

---

## TypeScript Types

### Job Types
```typescript
import { Job, CreateJobInput, UpdateJobInput } from '@/services/job.service';
```

### Application Types
```typescript
import { Application, ApplicationStatus } from '@/services/application.service';
```

### Room Types
```typescript
import { 
  Room,
  CreateRoomInput,
  RoomStatus,
  InterviewContext 
} from '@/services/room.service';
```

---

## Environment Variables

**Note:** The application now uses the production GraphQL endpoint `https://rolevate.com/api/graphql` in both development and production environments.

---

## Testing

### Test Job Update
```bash
./test-update-job.sh
```

### Test Job Creation
```bash
./test-job-curl.sh
```

### Verify Schema
```bash
./test-graphql-job.sh
```

---

## Common Issues

### 1. "Unknown argument 'id' on field 'Mutation.updateJob'"
**Solution:** Use `UpdateJobInput` with `id` inside the input object.

```typescript
// ❌ Wrong
updateJob(id: $id, input: $input)

// ✅ Correct
updateJob(input: $input)  // id is inside input
```

### 2. "Property does not exist on type '{}'"
**Solution:** Add TypeScript generic to mutation/query.

```typescript
// ❌ Wrong
const { data } = await apolloClient.mutate({ mutation });

// ✅ Correct
const { data } = await apolloClient.mutate<{ updateJob: Job }>({ mutation });
```

### 3. "Cannot find module '@/services/room.service'"
**Solution:** Make sure the service is exported in `/src/services/index.ts`.

---

## Best Practices

### 1. Always Use Services
```typescript
// ✅ Good
import { jobsService } from '@/services';
const jobs = await jobsService.getJobs();

// ❌ Bad
const response = await fetch('/api/jobs');
```

### 2. Type Your Data
```typescript
// ✅ Good
const [jobs, setJobs] = useState<Job[]>([]);

// ❌ Bad
const [jobs, setJobs] = useState([]);
```

### 3. Handle Errors
```typescript
// ✅ Good
try {
  await jobsService.createJob(input);
} catch (error) {
  console.error('Failed:', error);
  showErrorToast(error.message);
}

// ❌ Bad
await jobsService.createJob(input);
```

### 4. Use Optimistic Updates (Advanced)
```typescript
await apolloClient.mutate({
  mutation: UPDATE_JOB,
  variables: { input },
  optimisticResponse: {
    updateJob: {
      __typename: 'Job',
      id: input.id,
      ...input
    }
  }
});
```

---

## Quick Commands

```bash
# Type check
npx tsc --noEmit

# Build
npm run build

# Run dev server
npm run dev

# Test specific page
npm run dev
# Then visit http://localhost:3000/dashboard/jobs
```

---

## Support

See detailed documentation in:
- `UPDATE_JOB_FIX_SUMMARY.md`
- `ROOM_GRAPHQL_MIGRATION.md`
- `TYPESCRIPT_FIXES_SUMMARY.md`
- `COMPLETE_MIGRATION_SUMMARY.md`

---

**Last Updated:** October 18, 2025
