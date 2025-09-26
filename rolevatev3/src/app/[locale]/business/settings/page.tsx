import { getTranslations } from 'next-intl/server';
import BusinessLayout from '@/components/layout/business-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SubscriptionsContent from '@/components/business/subscriptions-content';
import ApiKeysContent from '@/components/business/api-keys-content';
import InvitationManagementContent from '@/components/business/invitation-management-content';

export default async function SettingsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <BusinessLayout locale={locale}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {locale === 'ar' ? 'الإعدادات' : 'Settings'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'ar' ? 'إدارة اشتراكاتك ومفاتيح API ودعوات الفريق' : 'Manage your subscriptions, API keys, and team invitations'}
          </p>
        </div>

        <Tabs defaultValue="subscriptions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subscriptions">
              {locale === 'ar' ? 'الاشتراكات' : 'Subscriptions'}
            </TabsTrigger>
            <TabsTrigger value="api-keys">
              {locale === 'ar' ? 'مفاتيح API' : 'API Keys'}
            </TabsTrigger>
            <TabsTrigger value="user-management">
              {locale === 'ar' ? 'إدارة الدعوات' : 'Invitations'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions">
            <SubscriptionsContent locale={locale} />
          </TabsContent>

          <TabsContent value="api-keys">
            <ApiKeysContent locale={locale} />
          </TabsContent>

          <TabsContent value="user-management">
            <InvitationManagementContent locale={locale} />
          </TabsContent>
        </Tabs>
      </div>
    </BusinessLayout>
  );
}