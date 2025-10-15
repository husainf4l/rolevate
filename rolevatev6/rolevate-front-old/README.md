# Rolevate Frontend

> Modern recruitment platform built with Next.js 15, React 19, and TypeScript. Connecting talent with opportunity through intelligent matching and seamless communication.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-teal?logo=tailwind-css)](https://tailwindcss.com/)

## 🚀 Features

### For Job Seekers
- **Smart Profile Builder** - AI-assisted CV creation and optimization
- **Intelligent Job Matching** - Algorithm-powered job recommendations
- **Application Tracking** - Real-time status updates and notifications
- **Interview Management** - Scheduling, preparation, and feedback
- **Skills Assessment** - Interactive evaluations and certifications

### For Employers
- **Advanced Job Posting** - AI-enhanced job descriptions and requirements
- **Candidate Discovery** - Powerful search and filtering tools
- **Application Management** - Streamlined review and communication
- **Interview Scheduling** - Integrated calendar and video conferencing
- **Analytics Dashboard** - Hiring metrics and insights

### Platform Features
- **Real-time Communication** - In-app messaging and notifications
- **Video Interviews** - Built-in video calling with recording
- **Performance Analytics** - Web vitals monitoring and optimization
- **Multi-language Support** - English and Arabic interface
- **Mobile Responsive** - Optimized for all devices

## 🛠️ Tech Stack

### Core Framework
- **Next.js 15.5.4** - React framework with App Router
- **React 19.0.0** - Latest React with concurrent features
- **TypeScript 5** - Static type checking

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **Responsive Design** - Mobile-first approach

### Development Tools
- **ESLint 9** - Advanced linting with custom rules
- **Vitest** - Fast unit testing framework  
- **React Testing Library** - Component testing utilities
- **Bundle Analyzer** - Performance optimization tools

### Performance & Monitoring
- **Web Vitals** - Core performance metrics
- **Performance Monitor** - Custom monitoring solution
- **Bundle Optimization** - Code splitting and lazy loading

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Modern web browser

### Quick Start

```bash
# Clone the repository
git clone https://github.com/husainf4l/rolevate-front.git
cd rolevate-front

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Environment Configuration

Create a `.env.local` file with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:4005/api
NEXT_PUBLIC_WS_URL=ws://localhost:4005

# Authentication
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret
NEXT_PUBLIC_SESSION_TIMEOUT=3600000

# External Services
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (website)/         # Public marketing pages
│   ├── dashboard/         # Employer dashboard
│   ├── userdashboard/     # Job seeker dashboard
│   ├── room/              # Video interview rooms
│   └── join/              # Meeting join flow
├── components/            # Reusable UI components
│   ├── common/           # Shared components
│   ├── dashboard/        # Employer-specific components
│   ├── homepage/         # Landing page components
│   └── interview/        # Video interview components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── services/             # API client and business logic
└── pages/                # Legacy pages (being migrated)
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Test Structure

```
tests/
├── __mocks__/            # Mock implementations
├── components/           # Component tests
├── services/             # API service tests
├── hooks/                # Custom hook tests
└── utils/                # Utility function tests
```

### Writing Tests

```typescript
// Example component test
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

## 🎯 Development Guidelines

### Code Standards
- Use TypeScript for all new code
- Follow ESLint rules and Prettier formatting
- Write unit tests for new components and utilities
- Use semantic commit messages

### Component Architecture
- Create reusable components in `src/components/common/`
- Use custom hooks for complex state logic
- Implement proper error boundaries
- Follow React 19 best practices

### Performance Best Practices
- Use `useCallback` and `useMemo` for expensive operations
- Implement code splitting with dynamic imports
- Optimize images with Next.js Image component
- Monitor Core Web Vitals

### State Management
- Use React's built-in state for component-level state
- Implement custom hooks for shared state logic
- Use Context API sparingly for global state
- Consider Zustand or Redux for complex state needs

## 🚀 Deployment

### Production Build

```bash
# Create optimized production build
npm run build

# Start production server
npm start

# Analyze bundle size
npm run build:analyze
```

### Environment Setup

#### Development
```bash
npm run dev
```

#### Staging
```bash
npm run build
npm start
```

#### Production
```bash
NODE_ENV=production npm run build
NODE_ENV=production npm start
```

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Performance Monitoring

### Web Vitals Tracking
- **LCP (Largest Contentful Paint)** - Loading performance
- **FID (First Input Delay)** - Interactivity
- **CLS (Cumulative Layout Shift)** - Visual stability
- **TTFB (Time to First Byte)** - Server responsiveness

### Monitoring Setup
```typescript
// pages/_app.tsx
import { reportWebVitals } from '../lib/performance';

export function reportWebVitals(metric) {
  // Send to analytics service
  reportWebVitals(metric);
}
```

## 🔒 Security

### Security Headers
- Content Security Policy (CSP)
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

### Authentication
- JWT-based authentication
- Secure cookie handling
- Session management
- Role-based access control

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Workflow
1. **Issue Creation** - Create an issue for bugs or feature requests
2. **Branch Creation** - Create a branch from main for your work
3. **Development** - Write code following our guidelines
4. **Testing** - Add comprehensive tests for your changes
5. **Code Review** - Submit PR and address feedback
6. **Deployment** - Merge after approval

### Commit Convention
```bash
feat: add new user authentication system
fix: resolve mobile navigation bug
docs: update API documentation
style: improve button component styling
refactor: optimize job search algorithm
test: add unit tests for user service
chore: update dependencies
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](docs/api.md)
- [Component Library](docs/components.md)
- [Development Guide](docs/development.md)
- [Deployment Guide](docs/deployment.md)

### Getting Help
- 📧 Email: support@rolevate.com
- 💬 Discord: [Join our community](https://discord.gg/rolevate)
- 🐛 Issues: [GitHub Issues](https://github.com/husainf4l/rolevate-front/issues)
- 📖 Wiki: [Project Wiki](https://github.com/husainf4l/rolevate-front/wiki)

### Changelog
See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes.

---

**Built with ❤️ by the Rolevate Team**

*Connecting talent with opportunity, one match at a time.*