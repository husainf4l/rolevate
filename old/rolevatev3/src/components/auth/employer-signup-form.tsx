// 'use client';

// import { useState } from 'react';
// import { useTranslations } from 'next-intl';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card } from '@/components/ui/card';
// import OrganizationSetupForm from './organization-setup-form';

// interface EmployerSignupFormProps {
//   locale: string;
// }

// export default function EmployerSignupForm({ locale }: EmployerSignupFormProps) {
//   const t = useTranslations('employerSignup');

//   const handleSetupComplete = (data: any) => {
//     // Handle successful organization and admin setup
//     console.log('Organization and admin setup completed:', data);
//     // Redirect to dashboard or success page
//   };

//   return (
//     <div className="w-full space-y-6">
//       {/* Header */}
//       <div className={`text-center ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
//         <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
//           {t('title')}
//         </h1>
//         <p className="text-muted-foreground text-sm sm:text-base">
//           {t('subtitle')}
//         </p>
//       </div>

//       {/* Single Setup Form */}
//       <Card className="p-6">
//         <OrganizationSetupForm
//           locale={locale}
//           onComplete={handleSetupComplete}
//         />
//       </Card>
//     </div>
//   );
// }