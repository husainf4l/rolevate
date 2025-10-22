import { getTranslations } from 'next-intl/server';
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
  const t = await getTranslations('business.settings');

  return (
    <div className="p-6 space-y-6">
        <div className={locale === 'ar' ? 'text-right' : 'text-left'}>
          <h1 className="text-3xl font-bold text-foreground">
            {t('title')}
          </h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <Tabs defaultValue="subscriptions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subscriptions">
              {t('tabs.subscriptions')}
            </TabsTrigger>
            <TabsTrigger value="api-keys">
              {t('tabs.apiKeys')}
            </TabsTrigger>
            <TabsTrigger value="user-management">
              {t('tabs.invitations')}
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
  );
}