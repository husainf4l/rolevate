'use client';

import { useAuthContext } from '@/providers/auth-provider';

interface BusinessDashboardClientProps {
  locale: string;
  children: React.ReactNode;
}

export default function BusinessDashboardClient({ locale, children }: BusinessDashboardClientProps) {
  const { user, isLoading, isAuthenticated, userType } = useAuthContext();
  // const t = useTranslations('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || userType !== 'business') {
    return null; // Redirect will be handled by the auth context
  }

  return (
    <div>
      {/* Welcome message with user data */}
      <div className="mb-6 p-4 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg">
        <h1 className="text-2xl font-bold">
          {locale === 'ar'
            ? `مرحباً ${user?.name || user?.email}`
            : `Welcome ${user?.name || user?.email}`
          }
        </h1>
        {user && 'organization' in user && user.organization && (
          <p className="text-muted-foreground">
            {locale === 'ar'
              ? `منظمة: ${user.organization.name}`
              : `Organization: ${user.organization.name}`
            }
          </p>
        )}
      </div>
      {children}
    </div>
  );
}