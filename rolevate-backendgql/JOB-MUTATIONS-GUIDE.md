# Job Mutations Guide

## Overview
This guide explains how to use the job mutations (create, update, delete) in the GraphQL API.

## Authentication
All job mutations require authentication using JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Create Job

### GraphQL Mutation
```graphql
mutation CreateJob($input: CreateJobInput!) {
  createJob(input: $input) {
    id
    title
    department
    location
    salary
    type
    deadline
    description
    shortDescription
    responsibilities
    requirements
    benefits
    skills
    experience
    education
    jobLevel
    workType
    industry
    companyDescription
    status
    featured
    createdAt
    updatedAt
    postedBy {
      id
      name
      email
    }
  }
}
```

### Variables
```json
{
  "input": {
    "title": "Senior Software Engineer",
    "department": "Engineering",
    "location": "San Francisco, CA",
    "salary": "$120,000 - $180,000",
    "type": "FULL_TIME",
    "deadline": "2025-12-31",
    "description": "Full job description here...",
    "shortDescription": "Brief summary...",
    "responsibilities": "List of responsibilities...",
    "requirements": "List of requirements...",
    "benefits": "List of benefits...",
    "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
    "experience": "5+ years",
    "education": "Bachelor's degree in Computer Science",
    "jobLevel": "SENIOR",
    "workType": "REMOTE",
    "industry": "Technology",
    "companyDescription": "About the company...",
    "status": "ACTIVE"
  }
}
```

**Note:** `postedById` is automatically set from the authenticated user's token. You don't need to provide it.

## Update Job

### GraphQL Mutation
```graphql
mutation UpdateJob($input: UpdateJobInput!) {
  updateJob(input: $input) {
    id
    title
    department
    location
    salary
    type
    deadline
    description
    shortDescription
    responsibilities
    requirements
    benefits
    skills
    experience
    education
    jobLevel
    workType
    industry
    companyDescription
    status
    featured
    updatedAt
  }
}
```

### Variables
```json
{
  "input": {
    "id": "e693247c-32c0-4a2a-83fc-fb0ca3410f42",
    "title": "Updated Job Title",
    "salary": "$130,000 - $190,000",
    "status": "ACTIVE"
  }
}
```

**Important:** 
- The `id` field is **required** and must be inside the `input` object
- All other fields are optional - only include fields you want to update
- You can only update jobs posted by you or from your company

### Common Mistake ❌
```graphql
# WRONG - Don't do this:
mutation UpdateJob($id: ID!, $input: UpdateJobInput!) {
  updateJob(id: $id, input: $input) {  # ❌ id should be inside input
    id
    title
  }
}
```

### Correct Way ✅
```graphql
# CORRECT:
mutation UpdateJob($input: UpdateJobInput!) {
  updateJob(input: $input) {  # ✅ only input argument, id is inside
    id
    title
  }
}
```

## Delete Job (Soft Delete)

### GraphQL Mutation
```graphql
mutation DeleteJob($id: ID!) {
  deleteJob(id: $id)
}
```

### Variables
```json
{
  "id": "e693247c-32c0-4a2a-83fc-fb0ca3410f42"
}
```

**Note:** This performs a soft delete by setting the job status to "DELETED". The job remains in the database but is hidden from listings.

## Hard Delete Job (Permanent)

### GraphQL Mutation
```graphql
mutation HardDeleteJob($id: ID!) {
  hardDeleteJob(id: $id)
}
```

### Variables
```json
{
  "id": "e693247c-32c0-4a2a-83fc-fb0ca3410f42"
}
```

**Warning:** This permanently removes the job from the database. This action cannot be undone!

## Enums

### JobType
- `FULL_TIME`
- `PART_TIME`
- `CONTRACT`
- `INTERNSHIP`

### JobLevel
- `ENTRY`
- `MID`
- `SENIOR`
- `LEAD`
- `EXECUTIVE`

### WorkType
- `ONSITE`
- `REMOTE`
- `HYBRID`

### JobStatus
- `DRAFT`
- `ACTIVE`
- `CLOSED`
- `DELETED`

## Permissions

- **Create Job**: Any authenticated user can create a job
- **Update Job**: Only the job poster or users from the same company can update
- **Delete Job**: Only the job poster or users from the same company can delete

## Error Handling

### Common Errors

1. **Job not found**
```json
{
  "errors": [{
    "message": "Job not found"
  }]
}
```

2. **Permission denied**
```json
{
  "errors": [{
    "message": "You do not have permission to update/delete this job"
  }]
}
```

3. **Validation errors**
```json
{
  "errors": [{
    "message": "Field \"title\" of required type \"String!\" was not provided."
  }]
}
```

4. **Authentication required**
```json
{
  "errors": [{
    "message": "Unauthorized"
  }]
}
```
