# User Candidate Dashboard

A modern, comprehensive dashboard for job candidates built with Next.js, TypeScript, and Tailwind CSS.

## Features

### 📊 Dashboard Overview
- **Real-time Statistics**: Track applications, interviews, offers, and more
- **Visual Stats Cards**: Six key metrics displayed with animated cards
- **Profile Completion**: Progress tracker to help candidates complete their profiles
- **Activity Feed**: Recent actions and updates in chronological order

### 🎯 Key Components

#### 1. Stats Cards (`UserStatsCards.tsx`)
Displays six key metrics:
- Total Applications
- Active Applications
- Scheduled Interviews
- Job Offers
- Under Review
- Not Selected

Features:
- Animated entrance with staggered timing
- Hover effects with scale transformations
- Color-coded icons and backgrounds
- Responsive grid layout (1-6 columns based on screen size)

#### 2. Recent Applications Widget (`RecentApplicationsWidget.tsx`)
- Lists the 5 most recent job applications
- Status badges with color coding
- Application match scores
- Quick navigation to application details
- Empty state with call-to-action

#### 3. Job Recommendations (`UserJobRecommendations.tsx`)
- Personalized job suggestions
- Save/unsave functionality
- Company logos and details
- Skills tags
- Location, salary, and job type information
- Direct links to job details

#### 4. Upcoming Interviews (`UserUpcomingInterviews.tsx`)
- Next 3 scheduled interviews
- Interview type indicators (Video, Phone, On-site)
- Date, time, and location details
- Quick "Join Meeting" button for video interviews
- Empty state messaging

#### 5. Profile Completion Widget (`UserProfileCompletionWidget.tsx`)
- Visual progress bar
- Percentage completion
- List of incomplete sections
- Direct navigation to profile sections
- Celebration message at 100% completion

#### 6. Quick Actions (`UserQuickActions.tsx`)
Six actionable shortcuts:
- Browse Jobs
- Update Profile
- Upload Resume
- Saved Jobs
- Interview Prep
- Job Search

Features:
- Color-coded cards
- Icon animations on hover
- Grid layout (1-3 columns)

#### 7. Activity Feed (`UserActivityFeed.tsx`)
- Recent user activities
- Timeline-style display
- Activity type icons
- Clickable items for navigation
- Relative timestamps

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **State Management**: React Hooks

## Design System

### Color Palette
- **Primary**: `#0891b2` (Cyan/Teal)
- **Backgrounds**: White, Gray-50, Gray-100
- **Text**: Gray-900 (primary), Gray-600 (secondary)
- **Status Colors**: Blue, Green, Purple, Amber, Red, Teal

### Animation System
- **Entrance Animations**: Fade in + slide up
- **Stagger Delay**: 50ms between items
- **Hover Effects**: Scale, translate, color transitions
- **Transition Duration**: 200-300ms

### Responsive Breakpoints
- **Mobile**: < 640px (1 column)
- **Tablet**: 640px - 1024px (2 columns)
- **Desktop**: 1024px+ (3 columns for main content)
- **Large Desktop**: 1280px+ (6 columns for stats)

## File Structure

```
src/
├── app/
│   └── userdashboard/
│       ├── page.tsx              # Main dashboard page
│       └── layout.tsx            # Dashboard layout with sidebar
├── components/
│   └── dashboard/
│       ├── UserStatsCards.tsx
│       ├── RecentApplicationsWidget.tsx
│       ├── UserJobRecommendations.tsx
│       ├── UserUpcomingInterviews.tsx
│       ├── UserQuickActions.tsx
│       ├── UserProfileCompletionWidget.tsx
│       ├── UserActivityFeed.tsx
│       └── UserSidebar.tsx
├── services/
│   ├── application.ts            # Application API calls
│   ├── job.ts                    # Job API calls
│   └── savedJobs.ts              # Saved jobs API calls
└── hooks/
    ├── useAuth.tsx               # Authentication hook
    └── useSavedJobs.tsx          # Saved jobs management
```

## API Integration

### Endpoints Used
- `GET /api/applications/my-applications` - Fetch candidate applications
- `GET /api/jobs/public/all` - Fetch public jobs
- `GET /api/saved-jobs` - Fetch saved jobs
- `POST /api/saved-jobs` - Save a job
- `DELETE /api/saved-jobs/:jobId` - Unsave a job

## Performance Optimizations

1. **Lazy Loading**: Components use React.lazy for code splitting
2. **Memoization**: useMemo and useCallback to prevent unnecessary re-renders
3. **Skeleton Screens**: Loading states with animated skeletons
4. **Optimistic Updates**: Immediate UI feedback for save/unsave actions
5. **Debounced Searches**: Prevent excessive API calls

## Accessibility Features

- **ARIA Labels**: All interactive elements
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Clear focus indicators
- **Color Contrast**: WCAG AA compliant
- **Screen Reader Support**: Semantic HTML and ARIA attributes

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live notifications
2. **Advanced Filtering**: Filter jobs by multiple criteria
3. **Interview Scheduling**: In-app interview scheduling
4. **Video Interviews**: Integrated video calling
5. **AI Recommendations**: ML-powered job matching
6. **Analytics Dashboard**: Detailed application insights
7. **Export Data**: PDF/CSV export of applications
8. **Dark Mode**: Theme switching support

## Usage

```tsx
// Main dashboard page
import UserDashboardPage from '@/app/userdashboard/page';

// The dashboard automatically:
// 1. Fetches candidate data
// 2. Calculates statistics
// 3. Loads recommendations
// 4. Displays activity feed
// 5. Tracks profile completion
```

## Component Props

### UserStatsCards
```typescript
interface UserStatsCardsProps {
  stats: {
    totalApplications: number;
    activeApplications: number;
    interviews: number;
    offers: number;
    pending: number;
    rejected: number;
  };
  loading?: boolean;
}
```

### RecentApplicationsWidget
```typescript
interface RecentApplicationsWidgetProps {
  applications: Application[];
  loading?: boolean;
}
```

### UserJobRecommendations
```typescript
interface UserJobRecommendationsProps {
  jobs: JobPost[];
  loading?: boolean;
  savedJobIds?: Set<string>;
  onSaveJob?: (jobId: string) => void;
  onUnsaveJob?: (jobId: string) => void;
}
```

## Contributing

When adding new dashboard components:
1. Follow the existing naming convention (`User*`)
2. Use Framer Motion for animations
3. Implement loading states
4. Add empty states with CTAs
5. Ensure responsive design
6. Include TypeScript types
7. Add proper ARIA labels

## License

Proprietary - Rolevate
