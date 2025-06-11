# 🚀 Jobs Frontend Integration

This document outlines the complete frontend integration for the Rolevate Jobs API, providing comprehensive job listing, search, filtering, and detailed job information for your React/Next.js application.

## 📋 Overview

The Jobs frontend integration includes:

- **Job Listings Page**: Browse all jobs with advanced filtering and search
- **Job Details Page**: Detailed view of individual job postings
- **Featured Jobs Component**: Highlight special job opportunities
- **Job Statistics Component**: Display platform analytics
- **Search Components**: Quick job search functionality
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🎯 Features Implemented

### ✅ Core Features

- **Advanced Search**: Full-text search across job titles, descriptions, requirements, and skills
- **Multi-level Filtering**: Filter by company, experience level, work type, location, and status
- **Pagination**: Efficient pagination with configurable page sizes
- **Sorting**: Sort by any field in ascending or descending order
- **View Tracking**: Automatic view count increment when viewing job details
- **Featured Jobs**: Special section for highlighted job postings
- **Real-time Statistics**: Job analytics and distribution data
- **AI Interview Integration**: Display AI interview configuration and questions
- **Application Tracking**: View recent applications and candidate information

### 🎨 UI/UX Features

- **Dark Theme**: Consistent with Rolevate branding
- **Responsive Design**: Works seamlessly on all devices
- **Loading States**: Smooth loading animations
- **Error Handling**: User-friendly error messages
- **Interactive Elements**: Hover effects and smooth transitions
- **Accessibility**: ARIA labels and keyboard navigation support

## 📁 File Structure

```
src/
├── services/
│   └── jobs.service.ts         # API service for jobs endpoints
├── hooks/
│   └── useJobs.ts             # Custom hook for jobs data management
├── constants/
│   └── jobs.constants.ts      # Job-related constants and enums
├── components/
│   └── jobs/
│       ├── index.ts           # Export file for easy imports
│       ├── JobCard.tsx        # Individual job card component
│       ├── JobFilters.tsx     # Advanced filtering component
│       ├── Pagination.tsx     # Pagination component
│       ├── FeaturedJobs.tsx   # Featured jobs section
│       ├── JobStats.tsx       # Statistics dashboard
│       └── JobSearchBox.tsx   # Quick search component
└── app/
    └── jobs/
        ├── page.tsx           # Main jobs listing page
        └── [id]/
            └── page.tsx       # Job details page
```

## 🔧 Component Documentation

### JobCard Component

```tsx
import { JobCard } from "@/components/jobs";

<JobCard
  job={jobObject}
  onViewDetails={(jobId) => router.push(`/jobs/${jobId}`)}
/>;
```

**Props:**

- `job`: Job object from API
- `onViewDetails?`: Callback function when "View Details" is clicked

### JobFilters Component

```tsx
import { JobFilters } from "@/components/jobs";

<JobFilters
  filters={currentFilters}
  onFilterChange={handleFilterChange}
  onSearch={handleSearch}
/>;
```

**Props:**

- `filters`: Current filter state
- `onFilterChange`: Callback for filter changes
- `onSearch`: Callback for search term changes

### FeaturedJobs Component

```tsx
import { FeaturedJobs } from "@/components/jobs";

<FeaturedJobs limit={6} showHeader={true} showViewAll={true} />;
```

**Props:**

- `limit?`: Number of jobs to display (default: 6)
- `showHeader?`: Show section header (default: true)
- `showViewAll?`: Show "View All" button (default: true)

### JobStats Component

```tsx
import { JobStats } from "@/components/jobs";

<JobStats showHeader={true} className="my-8" />;
```

**Props:**

- `showHeader?`: Show section header (default: true)
- `className?`: Additional CSS classes

### JobSearchBox Component

```tsx
import { JobSearchBox } from "@/components/jobs";

<JobSearchBox
  showLocation={true}
  placeholder="Search for jobs..."
  className="max-w-4xl mx-auto"
/>;
```

**Props:**

- `showLocation?`: Show location input (default: true)
- `placeholder?`: Search input placeholder
- `className?`: Additional CSS classes

## 🎯 API Integration

### Service Layer

The `jobs.service.ts` provides all necessary API calls:

```typescript
import {
  getJobs,
  getJobDetails,
  getFeaturedJobs,
  getJobStats,
} from "@/services/jobs.service";

// Get paginated jobs with filters
const jobsData = await getJobs({
  search: "developer",
  experienceLevel: "SENIOR",
  workType: "REMOTE",
  page: 1,
  limit: 12,
});

// Get job details
const job = await getJobDetails("job-id");

// Get featured jobs
const featuredJobs = await getFeaturedJobs(6);

// Get platform statistics
const stats = await getJobStats();
```

### Custom Hook

The `useJobs` hook simplifies data management:

```typescript
import { useJobs } from "@/hooks/useJobs";

const { jobs, pagination, loading, error, refetch } = useJobs({
  page: 1,
  limit: 12,
  sortBy: "createdAt",
  sortOrder: "desc",
});
```

## 🛠 Usage Examples

### 1. Basic Jobs Listing

```tsx
import { useJobs } from "@/hooks/useJobs";
import { JobCard, JobFilters, Pagination } from "@/components/jobs";

const JobsPage = () => {
  const [filters, setFilters] = useState({ page: 1, limit: 12 });
  const { jobs, pagination, loading, error, refetch } = useJobs(filters);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    refetch(newFilters);
  };

  return (
    <div>
      <JobFilters filters={filters} onFilterChange={handleFilterChange} />

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      <Pagination
        current={pagination.page}
        total={pagination.totalPages}
        onPageChange={(page) => handleFilterChange("page", page)}
      />
    </div>
  );
};
```

### 2. Featured Jobs on Homepage

```tsx
import { FeaturedJobs } from "@/components/jobs";

const HomePage = () => {
  return (
    <div>
      {/* Other homepage content */}
      <FeaturedJobs limit={6} showHeader={true} showViewAll={true} />
      {/* More content */}
    </div>
  );
};
```

### 3. Job Search in Hero Section

```tsx
import { JobSearchBox } from "@/components/jobs";

const HeroSection = () => {
  return (
    <section className="hero-section">
      <h1>Find Your Dream Job</h1>
      <p>Discover amazing opportunities with top companies</p>
      <JobSearchBox className="max-w-4xl mx-auto mt-8" />
    </section>
  );
};
```

## 🎨 Styling & Theming

### Dark Theme Support

All components are designed with dark theme in mind:

```css
/* Primary colors used */
--bg-primary: #111827; /* gray-900 */
--bg-secondary: #1f2937; /* gray-800 */
--bg-tertiary: #374151; /* gray-700 */
--text-primary: #f9fafb; /* white */
--text-secondary: #9ca3af; /* gray-400 */
--accent: #00c6ad; /* teal-500 */
--accent-hover: #14b8a6; /* teal-600 */
```

### Responsive Breakpoints

```css
/* Mobile first approach */
.jobs-grid {
  grid-template-columns: 1fr;
}

/* Tablet */
@media (min-width: 768px) {
  .jobs-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .jobs-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## 🔍 SEO & Performance

### Page Optimization

```tsx
// Job details page with proper meta tags
export async function generateMetadata({ params }): Promise<Metadata> {
  const job = await getJobDetails(params.id);

  return {
    title: `${job.title} at ${job.company.name} | Rolevate`,
    description: job.description.substring(0, 160),
    openGraph: {
      title: job.title,
      description: job.description,
      images: [job.company.logo],
    },
  };
}
```

### Performance Features

- **Lazy Loading**: Components load only when needed
- **Optimized Images**: Proper image optimization for company logos
- **Pagination**: Efficient data loading with pagination
- **Caching**: API responses can be cached for better performance

## 🚀 Deployment

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:4005
```

### Build Optimization

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Issues**

   - Verify `NEXT_PUBLIC_API_URL` environment variable
   - Check CORS settings on backend
   - Ensure API endpoints are accessible

2. **Styling Issues**

   - Verify Tailwind CSS is properly configured
   - Check for conflicting CSS classes
   - Ensure dark theme utilities are available

3. **Performance Issues**
   - Implement proper error boundaries
   - Add loading states for better UX
   - Consider implementing virtual scrolling for large lists

### Debug Mode

```typescript
// Enable debug logging
const DEBUG = process.env.NODE_ENV === "development";

if (DEBUG) {
  console.log("Jobs API Response:", jobsData);
}
```

## 📱 Mobile Experience

- **Touch-friendly**: All interactive elements are properly sized
- **Swipe Support**: Horizontal scrolling for job cards on mobile
- **Responsive Filters**: Collapsible filter panel on small screens
- **Optimized Performance**: Reduced data loading on mobile networks

## 🔐 Security

- **Input Validation**: All user inputs are properly sanitized
- **XSS Protection**: Content is safely rendered
- **CSRF Protection**: API calls include proper headers
- **Rate Limiting**: Built-in request throttling

## 📊 Analytics Integration

Ready for analytics integration:

```typescript
// Track job view
const handleJobView = (jobId: string) => {
  analytics.track("Job Viewed", {
    jobId,
    timestamp: new Date().toISOString(),
  });
};

// Track job application
const handleJobApplication = (jobId: string) => {
  analytics.track("Job Applied", {
    jobId,
    timestamp: new Date().toISOString(),
  });
};
```

## 🎉 Ready for Production

The Jobs frontend integration is fully functional and production-ready with:

- ✅ Complete API integration
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states
- ✅ SEO optimization
- ✅ Accessibility support
- ✅ Performance optimization
- ✅ Type safety with TypeScript

Start exploring jobs at `/jobs` and experience the complete job browsing functionality!
