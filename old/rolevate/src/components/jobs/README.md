# Jobs Components

This folder contains all job-related React components for the job search functionality.

## Components

### JobCard
A comprehensive job card component that displays job listings with rich information and interactive features.

**Features:**
- Job title, company, and location
- Salary information and job type
- Company rating and logo
- Skills/tags display
- Benefits showcase
- Save/unsave functionality
- Apply button with external link
- Responsive design
- RTL support for Arabic
- Accessibility features
- Loading states

**Props:**
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

**Usage:**
```tsx
import { JobCard } from '@/components/jobs';

<JobCard
  job={jobData}
  locale="en"
  onSave={handleSave}
  onApply={handleApply}
  isSaved={false}
/>
```

## Best Practices

1. **Type Safety**: All components use strict TypeScript types from `@/types/jobs`
2. **Accessibility**: Components include proper ARIA labels and semantic HTML
3. **Performance**: Components are optimized with proper memoization and lazy loading
4. **Internationalization**: Full i18n support with next-intl
5. **Responsive Design**: Mobile-first approach with proper breakpoints
6. **Error Handling**: Proper error boundaries and loading states
7. **Clean Architecture**: Separation of concerns with clear component boundaries

## File Structure

```
jobs/
├── JobCard.tsx          # Main job card component
├── index.ts            # Barrel exports
└── README.md           # This documentation
```

## Dependencies

- React
- next-intl (for internationalization)
- Lucide React (for icons)
- Tailwind CSS (for styling)