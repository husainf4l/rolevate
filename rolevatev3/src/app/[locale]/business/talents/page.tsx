import { getTranslations } from 'next-intl/server';
import BusinessLayout from '@/components/layout/business-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, Filter } from 'lucide-react';

interface TalentsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function TalentsPage({ params }: TalentsPageProps) {
  const { locale } = await params;
  const t = await getTranslations('business.talents');

  return (
    <BusinessLayout locale={locale}>
      <div className="space-y-6">
        {/* Header */}
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${locale === 'ar' ? 'sm:flex-row-reverse' : ''}`}>
          <div className={locale === 'ar' ? 'text-right' : 'text-left'}>
            <h1 className="text-2xl font-bold text-foreground">
              {t('title')}
            </h1>
            <p className="text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
          
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('addNew')}
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('search.placeholder')}
                className={`w-full py-2 bg-muted/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  locale === 'ar' ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                }`}
              />
            </div>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {t('search.filter')}
            </Button>
          </div>
        </Card>

        {/* Coming Soon Section */}
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {t('comingSoon.title')}
          </h2>
          
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {t('comingSoon.description')}
          </p>

          {/* Feature Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Search className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">
                {t('features.advancedSearch.title')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t('features.advancedSearch.description')}
              </p>
            </div>

            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">
                {t('features.profileManagement.title')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t('features.profileManagement.description')}
              </p>
            </div>

            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Filter className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">
                {t('features.smartFiltering.title')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t('features.smartFiltering.description')}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-6">
            <Badge variant="secondary" className="px-3 py-1">
              {t('status.inDevelopment')}
            </Badge>
          </div>
        </Card>
      </div>
    </BusinessLayout>
  );
}


