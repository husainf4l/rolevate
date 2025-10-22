# Services

This folder contains service classes and functions that handle business logic, data operations, and external API integrations.

## JobsService (`jobsService.ts`)

A comprehensive service for managing job-related data and operations.

### Features

- **Mock Data Management**: Provides demo job data for development
- **Filtering & Search**: Advanced filtering capabilities by multiple criteria
- **Type Safety**: Full TypeScript integration with proper typing
- **Extensible Architecture**: Easy to extend with real API calls

### Usage

```typescript
import { JobsService } from '@/services/jobsService';

// Get all jobs
const allJobs = JobsService.getJobs();

// Get jobs with filters
const filteredJobs = JobsService.getJobs({
  searchQuery: 'software engineer',
  location: 'Amman',
  jobType: 'full-time',
  experienceLevel: 'senior'
});

// Get a specific job
const job = JobsService.getJobById('123');

// Get jobs by category
const techJobs = JobsService.getJobsByCategory('Technology');

// Get urgent jobs
const urgentJobs = JobsService.getUrgentJobs();

// Get remote jobs
const remoteJobs = JobsService.getRemoteJobs();
```

### Methods

#### `getJobs(filters?: JobFilters): Job[]`
Returns all jobs or filtered jobs based on provided criteria.

**Parameters:**
- `filters` (optional): Object containing filter criteria

**Returns:** Array of Job objects

#### `getJobById(id: string): Job | undefined`
Returns a single job by its ID.

#### `getJobsByCategory(category: string): Job[]`
Returns jobs filtered by category.

#### `getUrgentJobs(): Job[]`
Returns only urgent jobs.

#### `getRemoteJobs(): Job[]`
Returns only remote jobs.

#### `searchJobs(query: string, filters?: any): Job[]`
Performs advanced search with query and optional filters.

### Architecture

The service follows a class-based architecture with static methods for easy access. In a production environment, this would be replaced with actual API calls to a backend service.

### Future Enhancements

- **API Integration**: Replace mock data with real API endpoints
- **Caching**: Add caching layer for better performance
- **Pagination**: Implement server-side pagination
- **Real-time Updates**: Add WebSocket support for live job updates
- **Analytics**: Track user interactions and search patterns

### Best Practices

1. **Separation of Concerns**: Business logic separated from UI components
2. **Type Safety**: All methods are fully typed
3. **Error Handling**: Proper error handling for API calls
4. **Performance**: Optimized filtering and search operations
5. **Maintainability**: Clean, documented code structure
6. **Testability**: Easy to unit test with mock data

## File Structure

```
services/
├── jobsService.ts          # Job data management service
└── README.md              # This documentation
```

## Dependencies

- `@/types/jobs` - Job type definitions
- No external dependencies (pure TypeScript)