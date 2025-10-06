# Development Guide

## Getting Started

This guide will help you set up your development environment and understand the codebase structure for contributing to Rolevate.

## Prerequisites

### Required Software
- **Node.js** 18+ (recommend using nvm for version management)
- **npm** 9+ or **yarn** 1.22+
- **Git** 2.30+
- **VS Code** (recommended) with suggested extensions

### Recommended VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Tailwind CSS IntelliSense
- ESLint
- Prettier
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens

## Environment Setup

### 1. Clone and Install
```bash
# Clone the repository
git clone https://github.com/husainf4l/rolevate-front.git
cd rolevate-front

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
```

### 2. Environment Variables
Edit `.env.local` with your configuration:

```env
# Development API
NEXT_PUBLIC_API_BASE_URL=http://localhost:4005/api
NEXT_PUBLIC_WS_URL=ws://localhost:4005

# Authentication
NEXT_PUBLIC_JWT_SECRET=your-development-secret

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_ENABLE_DEBUG_LOGS=true
```

### 3. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Project Architecture

### Folder Structure
```
src/
├── app/                    # Next.js 13+ App Router
│   ├── (website)/         # Public routes (marketing)
│   │   ├── page.tsx       # Homepage
│   │   ├── about/         # About page
│   │   ├── jobs/          # Public job listings
│   │   └── login/         # Authentication
│   ├── dashboard/         # Employer dashboard (protected)
│   │   ├── layout.tsx     # Dashboard layout
│   │   ├── page.tsx       # Dashboard home
│   │   ├── jobs/          # Job management
│   │   ├── candidates/    # Candidate management
│   │   └── analytics/     # Analytics & reports
│   ├── userdashboard/     # Job seeker dashboard (protected)
│   │   ├── layout.tsx     # User dashboard layout
│   │   ├── jobs/          # Job search & applications
│   │   ├── profile/       # Profile management
│   │   └── interviews/    # Interview management
│   ├── room/              # Video interview rooms
│   ├── join/              # Meeting join flow
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── common/           # Shared components
│   │   ├── Button.tsx    # Reusable button component
│   │   ├── Modal.tsx     # Modal component
│   │   └── ...
│   ├── dashboard/        # Employer-specific components
│   ├── homepage/         # Landing page components
│   └── interview/        # Video interview components
├── hooks/                # Custom React hooks
│   ├── useAuth.tsx       # Authentication hook
│   ├── useLocalStorage.ts # Local storage management
│   └── ...
├── lib/                  # Utility functions and configurations
│   ├── config.ts         # App configuration
│   ├── constants.ts      # Application constants
│   ├── utils.ts          # Utility functions
│   └── performance.ts    # Performance monitoring
├── services/             # API client and business logic
│   ├── auth.ts           # Authentication service
│   ├── job.ts            # Job management service
│   ├── api.ts            # Base API client
│   └── ...
└── types/                # TypeScript type definitions
    ├── auth.ts           # Authentication types
    ├── job.ts            # Job-related types
    └── ...
```

### Key Architectural Decisions

#### 1. App Router (Next.js 13+)
We use the new App Router for:
- Better performance with React Server Components
- Improved nested layouts
- Streaming and Suspense support
- Built-in loading and error states

#### 2. Component Architecture
```typescript
// Component structure example
interface ComponentProps {
  // Always define prop types
  title: string;
  optional?: boolean;
  children?: React.ReactNode;
}

export default function Component({ title, optional = false }: ComponentProps) {
  // Custom hooks at the top
  const { user } = useAuth();
  
  // State management
  const [loading, setLoading] = useState(false);
  
  // Event handlers (use useCallback for performance)
  const handleClick = useCallback(() => {
    // Handle click
  }, []);
  
  // Early returns for loading/error states
  if (loading) return <LoadingSpinner />;
  
  return (
    <div className="component-wrapper">
      <h1>{title}</h1>
      {/* Component content */}
    </div>
  );
}
```

#### 3. State Management
- **Local State**: React useState for component-specific state
- **Shared State**: Custom hooks with Context API
- **Server State**: Fetch in Server Components when possible
- **Form State**: React Hook Form for complex forms

#### 4. Styling Strategy
- **Tailwind CSS**: Utility-first CSS framework
- **Component Variants**: Use clsx for conditional classes
- **Responsive Design**: Mobile-first approach
- **Design System**: Consistent spacing and colors

## Development Workflow

### 1. Branch Strategy
```bash
main           # Production-ready code
├── develop    # Integration branch
├── feature/*  # Feature branches
├── bugfix/*   # Bug fix branches
└── hotfix/*   # Critical fixes
```

### 2. Feature Development
```bash
# Create feature branch
git checkout -b feature/user-profile-enhancement

# Make changes and commit
git add .
git commit -m "feat: add profile completion indicator"

# Push and create PR
git push origin feature/user-profile-enhancement
```

### 3. Commit Convention
```bash
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation changes
style:    # Code style changes (formatting, etc.)
refactor: # Code refactoring
test:     # Adding or updating tests
chore:    # Maintenance tasks
```

## Code Standards

### TypeScript Guidelines

#### 1. Type Definitions
```typescript
// Always define interfaces for objects
interface User {
  id: string;
  email: string;
  profile: UserProfile;
  createdAt: Date;
}

// Use unions for limited options
type UserRole = 'admin' | 'employer' | 'jobseeker';

// Use generics for reusable types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
```

#### 2. Component Props
```typescript
// Define props interface
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// Use the interface
export default function Button({ 
  variant, 
  size = 'md', 
  disabled = false,
  loading = false,
  onClick,
  children 
}: ButtonProps) {
  // Component implementation
}
```

#### 3. API Types
```typescript
// Request/Response types
interface CreateJobRequest {
  title: string;
  description: string;
  requirements: string;
  skills: string[];
  salary?: string;
}

interface JobResponse {
  id: string;
  title: string;
  company: Company;
  applicationsCount: number;
  createdAt: string;
}
```

### React Best Practices

#### 1. Component Organization
```typescript
// Imports at the top
import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';

// Types and interfaces
interface ComponentProps {
  // ...
}

// Main component
export default function Component({ ...props }: ComponentProps) {
  // Custom hooks
  const { user } = useAuth();
  const router = useRouter();
  
  // State
  const [loading, setLoading] = useState(false);
  
  // Computed values (useMemo)
  const expensiveValue = useMemo(() => {
    return heavyComputation(data);
  }, [data]);
  
  // Event handlers (useCallback)
  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      await submitData();
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // Early returns
  if (loading) return <LoadingSpinner />;
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

#### 2. Performance Optimization
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }: Props) => {
  return <div>{/* Expensive rendering */}</div>;
});

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // Handle click
}, [dependency]);

// Use useMemo for expensive calculations
const sortedData = useMemo(() => {
  return data.sort(sortFunction);
}, [data]);
```

#### 3. Error Handling
```typescript
// Error boundaries for components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}

// Async error handling
const handleAsyncOperation = async () => {
  try {
    setLoading(true);
    const result = await apiCall();
    setData(result);
  } catch (error) {
    console.error('Operation failed:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### CSS/Styling Guidelines

#### 1. Tailwind Usage
```typescript
// Use semantic class names with Tailwind
const buttonClasses = clsx(
  'px-4 py-2 rounded-md font-medium transition-colors',
  {
    'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
    'bg-gray-200 text-gray-800 hover:bg-gray-300': variant === 'secondary',
    'opacity-50 cursor-not-allowed': disabled,
  }
);

return <button className={buttonClasses}>{children}</button>;
```

#### 2. Responsive Design
```tsx
// Mobile-first responsive design
<div className="
  grid grid-cols-1       // Mobile: 1 column
  md:grid-cols-2         // Tablet: 2 columns  
  lg:grid-cols-3         // Desktop: 3 columns
  gap-4                  // Consistent spacing
">
  {items.map(item => (
    <div key={item.id} className="
      p-4                  // Padding
      bg-white             // Background
      rounded-lg           // Rounded corners
      shadow-sm            // Subtle shadow
      hover:shadow-md      // Hover effect
      transition-shadow    // Smooth transition
    ">
      {item.content}
    </div>
  ))}
</div>
```

## Testing Strategy

### 1. Test Structure
```
src/
├── __tests__/          # Global tests
├── components/
│   └── __tests__/      # Component tests
├── services/
│   └── __tests__/      # Service tests
└── hooks/
    └── __tests__/      # Hook tests
```

### 2. Unit Testing
```typescript
// Component testing
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when loading', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 3. Service Testing
```typescript
// API service testing
import { vi } from 'vitest';
import { jobService } from './job';

// Mock fetch
global.fetch = vi.fn();

describe('jobService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('fetches jobs successfully', async () => {
    const mockJobs = [{ id: '1', title: 'Developer' }];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockJobs,
    });

    const jobs = await jobService.getJobs();
    expect(jobs).toEqual(mockJobs);
    expect(fetch).toHaveBeenCalledWith('/api/jobs');
  });
});
```

### 4. Hook Testing
```typescript
// Custom hook testing
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  it('stores and retrieves values', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial')
    );

    expect(result.current[0]).toBe('initial');

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
  });
});
```

## Performance Guidelines

### 1. Bundle Optimization
```typescript
// Dynamic imports for code splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Use Suspense for loading states
<Suspense fallback={<LoadingSpinner />}>
  <HeavyComponent />
</Suspense>
```

### 2. Image Optimization
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/profile-picture.jpg"
  alt="Profile"
  width={200}
  height={200}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### 3. API Optimization
```typescript
// Implement request deduplication
const cache = new Map();

async function fetchWithCache(url: string) {
  if (cache.has(url)) {
    return cache.get(url);
  }
  
  const promise = fetch(url).then(res => res.json());
  cache.set(url, promise);
  
  return promise;
}
```

## Debugging

### 1. Development Tools
```typescript
// Add debug logging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', { user, state });
}

// React Developer Tools
// Install browser extension for component inspection
```

### 2. Error Tracking
```typescript
// Error boundary with logging
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  console.error('Component error:', error, errorInfo);
  
  // Send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    errorTracker.captureException(error, { extra: errorInfo });
  }
}
```

### 3. Performance Monitoring
```typescript
// Use React DevTools Profiler
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log('Render performance:', { id, phase, actualDuration });
}

<Profiler id="App" onRender={onRenderCallback}>
  <App />
</Profiler>
```

## Deployment

### 1. Build Process
```bash
# Production build
npm run build

# Check build output
npm run start

# Analyze bundle
npm run build:analyze
```

### 2. Environment Configuration
```typescript
// Environment-specific configs
const config = {
  development: {
    apiUrl: 'http://localhost:4005/api',
    debug: true,
  },
  production: {
    apiUrl: 'https://api.rolevate.com',
    debug: false,
  },
};

export default config[process.env.NODE_ENV];
```

### 3. Performance Checks
```bash
# Lighthouse CLI
npm install -g lighthouse
lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html

# Bundle analyzer
npm run build:analyze
```

## Common Issues & Solutions

### 1. Hydration Errors
```typescript
// Use useEffect for client-only code
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null;

return <ClientOnlyComponent />;
```

### 2. Memory Leaks
```typescript
// Clean up subscriptions
useEffect(() => {
  const subscription = subscribe(callback);
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 3. State Management Issues
```typescript
// Use functional updates for state
setCount(prevCount => prevCount + 1);

// Avoid stale closures with useCallback
const handleClick = useCallback(() => {
  setCount(c => c + 1);
}, []); // No dependencies needed
```

## Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind Play](https://play.tailwindcss.com)

### Learning Resources
- [React Patterns](https://reactpatterns.com)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript)
- [Web Performance](https://web.dev/performance)

---

*Happy coding! 🚀*