'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';

export default function LocaleNotFound() {
  const t = useTranslations('notFound');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-6">
          {/* 404 Number */}
          <div className="text-8xl font-bold text-primary/20">
            404
          </div>
          
          {/* Error Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              {t('title')}
            </h1>
            <p className="text-muted-foreground">
              {t('description')}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button 
              asChild 
              className="flex-1"
              variant="default"
            >
              <Link href="/">
                {t('goHome')}
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.history.back()}
            >
              {t('goBack')}
            </Button>
          </div>
          
          {/* Additional Help */}
          <div className="text-sm text-muted-foreground">
            {t('needHelp')} <Link href="/contact" className="text-primary hover:underline">{t('contactUs')}</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}