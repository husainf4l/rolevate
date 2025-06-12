# Company Setup Integration Guide

This guide explains how the company setup flow works when a user doesn't have a company associated with their account.

## 🔄 Complete Flow

### 1. User Authentication

```typescript
// User logs in and gets profile data
{
  "id": "124a790a-9c2f-433a-89b1-60c2454adc93",
  "email": "al-hussein@papayatrading.com",
  "username": "widd",
  "name": "Al-hussein Abdullah",
  "companyId": null,  // ← No company!
  "company": null     // ← No company!
}
```

### 2. Company Setup Detection

The system automatically detects users without a company and redirects them through the setup flow.

## 🛡️ Protection Components

### CompanySetupGuard

Wraps pages that require a company:

```tsx
// Usage in dashboard
export default function Dashboard() {
  return (
    <CompanySetupGuard>
      <DashboardContent />
    </CompanySetupGuard>
  );
}
```

**What it does:**

1. Checks if user has `companyId` or `company` object
2. If no company → Shows `CompanySetup` component
3. If has company → Renders children normally

### useCompanySetupStatus Hook

For custom logic:

```tsx
const { needsSetup, loading } = useCompanySetupStatus();

if (needsSetup) {
  return <CompanySetupMessage />;
}
```

## 🏢 Company Setup Component

### Step 1: Company Information

- Company name (required)
- Display name (required)
- Industry (required)
- Company size
- Description
- Website
- Location details

### Step 2: Subscription Plan

- Basic ($29/month)
- Premium ($99/month) - Recommended
- Enterprise ($299/month)

### Step 3: Success & Onboarding

Shows `OnboardingFlow` component with next steps.

## 🎯 Integration Points

### 1. Dashboard Protection

```tsx
// src/app/dashboard/page.tsx
import CompanySetupGuard from "@/components/auth/CompanySetupGuard";

export default function Dashboard() {
  return (
    <CompanySetupGuard>
      <DashboardContent />
    </CompanySetupGuard>
  );
}
```

### 2. Profile Page Enhancement

```tsx
// Shows setup button if no company
{
  !company && <a href="/company-setup">Set Up Company</a>;
}
```

### 3. Manual Setup Page

```tsx
// src/app/company-setup/page.tsx
import CompanySetup from "@/components/auth/CompanySetup";

export default function CompanySetupPage() {
  return <CompanySetup />;
}
```

## 📡 Backend Integration

### New Endpoint: Create Company

```http
POST /api/auth/create-company
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "TechCorp",
  "displayName": "TechCorp Solutions",
  "industry": "Technology",
  "description": "Leading tech company",
  "website": "https://techcorp.com",
  "location": "Dubai, UAE",
  "country": "UAE",
  "city": "Dubai",
  "size": "MEDIUM",
  "subscriptionPlan": "PREMIUM"
}
```

### Auth Service Integration

```typescript
// Added to auth.service.ts
export async function createCompany(
  companyData: CompanyData
): Promise<Company> {
  return fetchWithAuth<Company>(`${API_URL}/api/auth/create-company`, {
    method: "POST",
    body: JSON.stringify(companyData),
  });
}
```

## 🎨 User Experience Flow

### Scenario: New User Without Company

1. **Login** → User authenticates successfully
2. **Profile Check** → System detects `companyId: null`
3. **Redirect** → User redirected to company setup
4. **Company Creation** → User fills form and selects plan
5. **Success** → Shows onboarding flow
6. **Dashboard Access** → User can now access dashboard

### Scenario: Existing User Without Company

1. **Dashboard Visit** → `CompanySetupGuard` detects no company
2. **Setup Display** → Shows company setup form inline
3. **Completion** → Updates user profile and continues
4. **Normal Access** → Full dashboard functionality

## 🔧 Configuration Options

### CompanySetupGuard Props

```tsx
interface CompanySetupGuardProps {
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode; // Custom setup component
}
```

### CompanySetup Props

```tsx
interface CompanySetupProps {
  onCompanyCreated?: () => void; // Callback after creation
}
```

## 🎯 Testing the Flow

### 1. Complete Flow Test

```bash
# Visit auth demo
/auth-demo

# Register user without company
# Login and visit dashboard
# Should see company setup
```

### 2. Manual Setup Test

```bash
# Direct company setup
/company-setup

# Should work for authenticated users
```

### 3. Profile Integration Test

```bash
# Visit profile page
/profile (or use UserProfile component)

# Should show "Set Up Company" button if no company
```

## 📋 Checklist

- ✅ **CompanySetupGuard** - Protects dashboard and pages
- ✅ **CompanySetup** - Multi-step setup form
- ✅ **OnboardingFlow** - Post-setup guidance
- ✅ **UserProfile** - Shows setup option
- ✅ **Backend Integration** - Create company endpoint
- ✅ **Auth Service** - Company creation function
- ✅ **Dashboard Protection** - Automatic redirection
- ✅ **Manual Setup Page** - Direct access option

## 🔍 Troubleshooting

### Company Setup Not Triggering

- Check user profile has `companyId: null`
- Verify `CompanySetupGuard` is wrapping protected components
- Check auth token is valid

### Backend Errors

- Ensure `/api/auth/create-company` endpoint exists
- Verify request body matches expected format
- Check authorization headers

### Styling Issues

- All components use Tailwind CSS
- Responsive design included
- Dark mode support where applicable

## 🚀 Production Deployment

1. **Environment Variables**

   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.com
   ```

2. **Backend Endpoints**

   - Ensure all auth endpoints are deployed
   - Test company creation endpoint
   - Verify CORS settings

3. **User Flow Testing**
   - Test with users who have no company
   - Verify redirection works correctly
   - Test onboarding completion

---

This integration provides a seamless experience for users who need to set up their company profile before accessing the main application features.
