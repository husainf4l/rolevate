# Authentication System Integration - Complete Guide

This document provides a comprehensive overview of the updated authentication system for the Rolevate platform, including all components, services, and usage examples.

## 🚀 Quick Start

1. **Backend Setup**: Ensure your backend API is running on `https://rolevate.com/api` (or update `NEXT_PUBLIC_API_URL`)
2. **Test the Demo**: Visit `/auth-demo` to test all authentication features
3. **Integration**: Use the provided components and hooks in your application

## 📁 File Structure

```
src/
├── services/
│   └── auth.service.ts         # Main authentication service
├── hooks/
│   └── useAuth.ts              # Authentication hook
├── components/
│   ├── auth/
│   │   ├── AuthDemo.tsx        # Comprehensive demo component
│   │   ├── ProtectedRoute.tsx  # Route protection wrapper
│   │   ├── UserProfile.tsx     # User profile management
│   │   └── SubscriptionManagement.tsx # Subscription features
│   └── AuthChecker.tsx         # Authentication checker
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx      # Updated login page
│   │   └── signup/page.tsx     # Updated registration page
│   └── auth-demo/page.tsx      # Demo page
└── docs/
    └── AUTH_INTEGRATION_GUIDE.md # Detailed integration guide
```

## 🔧 Core Services & Hooks

### Auth Service (`auth.service.ts`)

The main authentication service provides:

```typescript
// Authentication
login(credentials: LoginCredentials): Promise<User>
register(credentials: RegisterCredentials): Promise<User>
logout(): Promise<void>
isAuthenticated(): Promise<boolean>
getCurrentUser(): Promise<User | null>
refreshAccessToken(): Promise<string | null>

// Profile Management
changePassword(data: ChangePasswordRequest): Promise<{message: string}>

// Company & Subscription
getCompany(): Promise<Company>
getSubscriptionStatus(): Promise<SubscriptionStatus>
getSubscriptionLimits(): Promise<SubscriptionLimits>
upgradeSubscription(plan: string): Promise<{message: string}>
```

### useAuth Hook

Simple hook for accessing user state:

```typescript
const { user, loading, authenticated } = useAuth();
```

## 🛡️ Protection Components

### ProtectedRoute

Wrap pages that require authentication:

```tsx
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Protected content here</div>
    </ProtectedRoute>
  );
}
```

### Role-Based Protection

```tsx
import { RequireRole } from "@/components/auth/ProtectedRoute";

<RequireRole roles={["HR_MANAGER", "ADMIN"]}>
  <AdminPanel />
</RequireRole>;
```

### Subscription-Based Protection

```tsx
import { RequireSubscription } from "@/components/auth/ProtectedRoute";

<RequireSubscription plans={["PREMIUM", "ENTERPRISE"]}>
  <PremiumFeature />
</RequireSubscription>;
```

## 📝 Form Components

### Login Form (Updated)

- Now accepts email OR username
- Automatic redirect after login
- Error handling with clear messages
- Loading states

### Registration Form (Updated)

- Complete user profile fields
- Company creation option
- Role selection
- Form validation
- Auto-login after registration

## 👤 User Management Components

### UserProfile Component

Complete user profile management with:

- Profile information display
- Company details
- Subscription status
- Password change functionality
- Tabbed interface

```tsx
import UserProfile from "@/components/auth/UserProfile";

<UserProfile />;
```

### SubscriptionManagement Component

Full subscription management interface:

- Current plan display
- Usage limits with progress bars
- Plan comparison table
- Upgrade functionality
- Billing cycle toggle

```tsx
import SubscriptionManagement from "@/components/auth/SubscriptionManagement";

<SubscriptionManagement />;
```

## 🎯 Usage Examples

### Basic Authentication Check

```tsx
"use client";
import { useAuth } from "@/hooks/useAuth";

export default function MyComponent() {
  const { user, loading, authenticated } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!authenticated) return <div>Please log in</div>;

  return <div>Welcome, {user?.name}!</div>;
}
```

### Manual Login

```tsx
import { login, AuthError } from "@/services/auth.service";

const handleLogin = async () => {
  try {
    const user = await login({
      emailOrUsername: "user@example.com",
      password: "password123",
    });
    console.log("Logged in:", user);
  } catch (error) {
    if (error instanceof AuthError) {
      console.error("Login failed:", error.message);
    }
  }
};
```

### Registration with Company

```tsx
import { register } from "@/services/auth.service";

const handleRegisterWithCompany = async () => {
  try {
    const user = await register({
      email: "hr@newcompany.com",
      username: "hr_manager",
      password: "securePassword",
      name: "HR Manager",
      firstName: "Jane",
      lastName: "Smith",
      phoneNumber: "+971501234567",
      role: "HR_MANAGER",
      createCompany: true,
      companyData: {
        name: "NewCompany",
        displayName: "New Company Ltd",
        industry: "Technology",
        // ... other fields
      },
    });
  } catch (error) {
    console.error("Registration failed:", error);
  }
};
```

### Check Subscription Limits

```tsx
import { getSubscriptionLimits } from "@/services/auth.service";

const checkLimits = async () => {
  try {
    const limits = await getSubscriptionLimits();
    console.log("Job posts:", limits.jobPosts.used, "/", limits.jobPosts.limit);
    console.log(
      "Interviews:",
      limits.interviews.used,
      "/",
      limits.interviews.limit
    );
  } catch (error) {
    console.error("Failed to get limits:", error);
  }
};
```

## 🔗 API Endpoints

The service works with these backend endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/refresh` - Refresh access token
- `PATCH /api/auth/change-password` - Change password
- `GET /api/auth/company` - Get company info
- `GET /api/auth/subscription/status` - Get subscription status
- `GET /api/auth/subscription/limits` - Get usage limits
- `POST /api/auth/subscription/upgrade` - Upgrade subscription

## ⚙️ Configuration

### Environment Variables

```env
NEXT_PUBLIC_API_URL=https://rolevate.com/api
```

### Backend API Base URL

Update in `auth.service.ts` if needed:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://rolevate.com/api";
```

## 🎨 Demo Page

Visit `/auth-demo` to see a comprehensive demonstration of all features:

- Login/Registration forms
- Profile management
- Company information
- Subscription management
- Error handling
- Loading states

## 🔄 Migration from Old System

If you have existing authentication code:

1. **Update login calls**: Change `username` to `emailOrUsername`
2. **Update registration**: Use `register` instead of `signup`
3. **Update interfaces**: User interface now includes more fields
4. **Update token handling**: Only access tokens are used

## 🐛 Troubleshooting

### Common Issues

1. **401 Errors**: Check if backend is running and accessible
2. **CORS Issues**: Ensure backend CORS is configured for your frontend URL
3. **Token Issues**: Check localStorage for stored tokens
4. **Registration Fails**: Verify all required fields are provided

### Debug Mode

Enable debug logging in `auth.service.ts`:

```typescript
console.log("[AuthService] Debug info:", response);
```

## 📚 Additional Resources

- **Backend API Documentation**: See Postman collection in project docs
- **Component Demos**: Visit `/auth-demo` for live examples
- **Integration Guide**: See `docs/AUTH_INTEGRATION_GUIDE.md`

## 🤝 Support

For issues or questions:

1. Check the demo page for working examples
2. Review error messages in browser console
3. Verify backend API responses
4. Check network requests in browser dev tools

---

**Note**: This authentication system is designed to work with the Rolevate backend API. Ensure your backend implements the expected endpoints and response formats.

## 🏢 Company Setup Flow

For users without a company, the system automatically guides them through company creation:

### Components

- **`CompanySetupGuard`** - Protects pages requiring a company
- **`CompanySetup`** - Multi-step company creation form
- **`OnboardingFlow`** - Post-setup guidance

### Usage

```tsx
// Protect dashboard
<CompanySetupGuard>
  <DashboardContent />
</CompanySetupGuard>

// Direct setup
<CompanySetup onCompanyCreated={() => router.push('/dashboard')} />
```

### Flow

1. User login with `companyId: null`
2. Automatic redirection to company setup
3. Company creation with subscription selection
4. Onboarding flow with next steps
5. Full dashboard access

See `COMPANY_SETUP_GUIDE.md` for complete integration details.

// Legacy compatibility - keep signup function for backward compatibility
export const signup = register;

```

```
