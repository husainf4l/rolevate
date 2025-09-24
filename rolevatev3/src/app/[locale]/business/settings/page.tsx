import { getTranslations } from 'next-intl/server';
import BusinessLayout from '@/components/layout/business-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SubscriptionsContent from '@/components/business/subscriptions-content';
import ApiKeysContent from '@/components/business/api-keys-content';

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
            {locale === 'ar' ? 'إدارة اشتراكاتك ومفاتيح API' : 'Manage your subscriptions and API keys'}
          </p>
        </div>

        <Tabs defaultValue="subscriptions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="subscriptions">
              {locale === 'ar' ? 'الاشتراكات' : 'Subscriptions'}
            </TabsTrigger>
            <TabsTrigger value="api-keys">
              {locale === 'ar' ? 'مفاتيح API' : 'API Keys'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions">
            <SubscriptionsContent locale={locale} />
          </TabsContent>

          <TabsContent value="api-keys">
            <ApiKeysContent locale={locale} />
          </TabsContent>
        </Tabs>
      </div>
    </BusinessLayout>
  );
}