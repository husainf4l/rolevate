# GraphQL Schema Analysis - Job Management

## Key Findings

### ❌ **NO UPDATE MUTATION EXISTS**
The GraphQL backend **does not have** an `updateJob` mutation or `UpdateJobInput` type.

### ✅ Available Job Mutations
Only **ONE** job mutation is available:
- `createJob` - Creates a new job

### Available Job Queries
- `job(id: ID!)` - Get a single job by ID
- `jobBySlug(slug: String!)` - Get a job by slug
- `jobs(filter: JobFilterInput, pagination: PaginationInput)` - Get all jobs with filtering
- `companyJobs` - Get jobs for the current company
- `applicationsByJob(jobId: ID!)` - Get applications for a specific job

## Solution Options

### Option 1: Delete and Recreate (Recommended for now)
Since there's no update mutation, you need to:
1. Delete the existing job
2. Create a new job with the updated data

### Option 2: Request Backend Team to Add Update Mutation
Ask the backend team to implement:
```graphql
mutation updateJob($id: ID!, $input: UpdateJobInput!) {
  updateJob(id: $id, input: $input) {
    id
    title
    # ... other fields
  }
}
```

---

## Curl Commands for Testing

### 1. Get Full Schema Introspection
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query IntrospectSchema { __schema { mutationType { name fields { name description args { name type { name kind ofType { name kind } } } type { name kind ofType { name kind } } } } } }"
  }' | jq '.'
```

### 2. Get Job-Related Mutations
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __schema { mutationType { fields { name } } } }"
  }' | jq '.data.__schema.mutationType.fields[] | select(.name | test("[Jj]ob"))'
```

### 3. Get CreateJobInput Structure
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __type(name: \"CreateJobInput\") { name kind inputFields { name description type { name kind ofType { name kind ofType { name kind } } } } } }"
  }' | jq '.'
```

### 4. Get Job Queries
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __schema { queryType { fields { name args { name type { name kind ofType { name } } } type { name kind } } } } }"
  }' | jq '.data.__schema.queryType.fields[] | select(.name | test("[Jj]ob"))'
```

### 5. Test createJob Mutation (with auth token)
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "mutation CreateJob($input: CreateJobInput!) { createJob(input: $input) { id title department location } }",
    "variables": {
      "input": {
        "title": "Senior Software Engineer",
        "department": "Engineering",
        "location": "Remote",
        "salary": "$100k - $150k",
        "type": "FULL_TIME",
        "deadline": "2025-12-31",
        "description": "We are looking for a senior engineer...",
        "shortDescription": "Senior position available",
        "responsibilities": "- Lead projects\n- Mentor juniors",
        "requirements": "- 5+ years experience\n- React expertise",
        "benefits": "- Health insurance\n- Remote work",
        "skills": ["React", "TypeScript", "Node.js"],
        "experience": "5+ years",
        "education": "Bachelor'\''s degree",
        "jobLevel": "SENIOR",
        "workType": "REMOTE",
        "industry": "Technology",
        "companyDescription": "Innovative tech company"
      }
    }
  }' | jq '.'
```

### 6. Get Job by ID
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetJob($id: ID!) { job(id: $id) { id title department location salary type deadline description } }",
    "variables": {
      "id": "YOUR_JOB_ID_HERE"
    }
  }' | jq '.'
```

### 7. Check for Delete/Remove Mutations
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __schema { mutationType { fields { name } } } }"
  }' | jq '.data.__schema.mutationType.fields[] | select(.name | test("[Dd]elete|[Rr]emove")) | select(.name | test("[Jj]ob"))'
```

**Result: ❌ No delete/remove job mutation exists**

---

## CreateJobInput Type Definition

```typescript
interface CreateJobInput {
  // Required fields
  title: string;
  department: string;
  location: string;
  salary: string;
  type: JobType; // ENUM
  deadline: string;
  description: string;
  shortDescription: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  skills: string[];
  experience: string;
  education: string;
  jobLevel: JobLevel; // ENUM
  workType: WorkType; // ENUM
  industry: string;
  companyDescription: string;
  
  // Optional fields
  status?: JobStatus; // ENUM
  cvAnalysisPrompt?: string;
  interviewPrompt?: string;
  aiSecondInterviewPrompt?: string;
  interviewLanguage?: string;
  featured?: boolean;
  postedById?: string;
}
```

### Enums (Actual Values from Schema)
```typescript
enum JobType {
  FULL_TIME
  PART_TIME
  CONTRACT
  REMOTE
}

enum JobLevel {
  ENTRY
  MID
  SENIOR
  EXECUTIVE
}

enum WorkType {
  ONSITE
  REMOTE
  HYBRID
}

enum JobStatus {
  DRAFT
  ACTIVE
  PAUSED
  CLOSED
  EXPIRED
  DELETED
}
```

### JobDto Response Fields
When you query or create a job, you can request these fields:
```
id, title, slug, department, location, salary, type, deadline,
description, shortDescription, responsibilities, requirements,
benefits, skills, experience, education, jobLevel, workType,
industry, companyDescription, status, company, cvAnalysisPrompt,
interviewPrompt, aiSecondInterviewPrompt, interviewLanguage,
featured, applicants, views, featuredJobs, postedBy,
createdAt, updatedAt
```

---

## Frontend Implementation Approach

Since `updateJob` doesn't exist, you have two options:

### Temporary Solution (Delete + Recreate)
```typescript
// 1. Fetch current job data
const { data } = await apolloClient.query({
  query: GET_JOB,
  variables: { id: jobId }
});

// 2. Delete the old job (if delete mutation exists)
await apolloClient.mutate({
  mutation: DELETE_JOB,
  variables: { id: jobId }
});

// 3. Create new job with updated data
await apolloClient.mutate({
  mutation: CREATE_JOB,
  variables: {
    input: {
      ...data.job,
      title: newTitle, // updated fields
      // ... other updated fields
    }
  }
});
```

### Better Solution (Request Backend Update)
Contact the backend team to add the `updateJob` mutation to the GraphQL schema.

---

## Next Steps

1. ✅ **Confirmed: NO DELETE mutation exists** - Cannot delete jobs via GraphQL

2. **Immediate Action Required:**
   - Disable the "Edit Job" functionality in the frontend
   - OR implement a workaround (see below)

3. **Contact Backend Team** to implement:
   - `updateJob` mutation
   - `deleteJob` or `removeJob` mutation

4. **Workaround Options:**
   
   **Option A: Use Status Field**
   ```typescript
   // Instead of deleting/updating, create a new job with DRAFT status
   // and mark old one as DELETED
   await apolloClient.mutate({
     mutation: CREATE_JOB,
     variables: {
       input: {
         ...existingJobData,
         title: "Updated Title",
         status: "ACTIVE"
       }
     }
   });
   ```
   
   **Option B: Frontend-Only Edit**
   - Show a warning: "Edit functionality coming soon"
   - Store drafts in localStorage
   - Submit as new jobs

---

## Summary

| Feature | Status | Available |
|---------|--------|-----------|
| Create Job | ✅ | `createJob` mutation |
| Update Job | ❌ | Not available |
| Delete Job | ❌ | Not available |
| Get Job by ID | ✅ | `job(id)` query |
| Get Job by Slug | ✅ | `jobBySlug(slug)` query |
| List Jobs | ✅ | `jobs(filter, pagination)` query |
| Company Jobs | ✅ | `companyJobs` query |

**Action Required:** Backend needs to implement `updateJob` and `deleteJob` mutations.

---

## Date: October 17, 2025
Backend URL: `http://localhost:4005/graphql`
