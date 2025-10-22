# Job Types

Comprehensive TypeScript type definitions for job-related functionality.

## Core Types

### Job
The main job interface containing all job-related information.

```typescript
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  salary?: string;
  postedAt: string;
  description: string;
  tags: string[];
  urgent?: boolean;
  remote?: boolean;
  companyLogo?: string;
  rating?: number;
  experienceLevel?: ExperienceLevel;
  salaryRange?: SalaryRange;
  category?: string;
  requirements?: string[];
  benefits?: string[];
  applicationDeadline?: string;
  companySize?: string;
  industry?: string;
}
```

### JobType
Enumeration of available job types.

```typescript
type JobType = 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship' | 'temporary';
```

### ExperienceLevel
Experience level classifications.

```typescript
type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive';
```

### SalaryRange
Predefined salary range categories.

```typescript
type SalaryRange = '0-30000' | '30000-50000' | '50000-80000' | '80000-120000' | '120000+';
```

## Filter & Search Types

### JobFilters
Interface for filtering job listings.

```typescript
interface JobFilters {
  searchQuery?: string;
  location?: string;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  salaryRange?: SalaryRange;
  remote?: boolean;
  urgent?: boolean;
  category?: string;
}
```

### JobSearchParams
URL parameters for job search functionality.

```typescript
interface JobSearchParams {
  q?: string;
  location?: string;
  type?: JobType;
  experience?: ExperienceLevel;
  salary?: SalaryRange;
  remote?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'salary' | 'company';
  sortOrder?: 'asc' | 'desc';
}
```

## API Response Types

### JobListResponse
Standardized response format for job listing API calls.

```typescript
interface JobListResponse {
  jobs: Job[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

### JobStats
Statistics and analytics for job data.

```typescript
interface JobStats {
  totalJobs: number;
  activeJobs: number;
  newJobsThisWeek: number;
  averageSalary: number;
  topCategories: Array<{
    name: string;
    count: number;
  }>;
  topLocations: Array<{
    name: string;
    count: number;
  }>;
}
```

## Component Props

### JobCardProps
Props interface for the JobCard component.

```typescript
interface JobCardProps {
  job: Job;
  locale?: string;
  onSave?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
  isSaved?: boolean;
  className?: string;
}
```

## Best Practices

1. **Type Safety**: Use these types throughout the application for consistency
2. **Extensibility**: Add new properties to interfaces as needed
3. **Validation**: Use these types for runtime validation with libraries like Zod
4. **API Contracts**: Use these types to define API request/response contracts
5. **Documentation**: Keep this file updated when adding new types

## Usage Examples

```typescript
// Creating a job object
const job: Job = {
  id: '123',
  title: 'Software Engineer',
  company: 'Tech Corp',
  location: 'San Francisco, CA',
  type: 'full-time',
  salary: '$100,000 - $150,000',
  postedAt: '2 days ago',
  description: 'Join our engineering team...',
  tags: ['React', 'TypeScript', 'Node.js'],
  remote: true,
  experienceLevel: 'mid',
  salaryRange: '80000-120000'
};

// Using in component props
<JobCard job={job} onSave={handleSave} />
```

## Future Enhancements

- Add more specific job categories
- Include location coordinates for mapping
- Add job application status tracking
- Include company culture and work environment data