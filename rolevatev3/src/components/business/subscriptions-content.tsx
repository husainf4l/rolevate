'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Calendar, CheckCircle, XCircle, Crown } from 'lucide-react';

interface Subscription {
  id: string;
  name: string;
  plan: string;
  status: 'active' | 'inactive' | 'expired';
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  features: string[];
}

interface SubscriptionsContentProps {
  locale: string;
}

export default function SubscriptionsContent({ locale }: SubscriptionsContentProps) {
  // Mock data - replace with actual API call
  const subscriptions: Subscription[] = [
    {
      id: '1',
      name: 'Premium Job Posting',
      plan: 'Monthly',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      price: 99,
      currency: 'AED',
      features: ['Unlimited job posts', 'Priority support', 'Advanced analytics']
    },
    {
      id: '2',
      name: 'Resume Database Access',
      plan: 'Annual',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      price: 499,
      currency: 'AED',
      features: ['Full database access', 'Advanced search filters', 'Export capabilities']
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />{locale === 'ar' ? 'نشط' : 'Active'}</Badge>;
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800"><XCircle className="w-3 h-3 mr-1" />{locale === 'ar' ? 'غير نشط' : 'Inactive'}</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />{locale === 'ar' ? 'منتهي الصلاحية' : 'Expired'}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {locale === 'ar' ? 'الاشتراكات' : 'Subscriptions'}
          </h2>
          <p className="text-muted-foreground">
            {locale === 'ar' ? 'إدارة اشتراكاتك وخططك' : 'Manage your subscriptions and plans'}
          </p>
        </div>
        <Button>
          <Crown className="w-4 h-4 mr-2" />
          {locale === 'ar' ? 'ترقية الخطة' : 'Upgrade Plan'}
        </Button>
      </div>

      <div className="grid gap-6">
        {subscriptions.map((subscription) => (
          <Card key={subscription.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    {subscription.name}
                  </CardTitle>
                  <CardDescription>
                    {subscription.plan} • {subscription.price} {subscription.currency}
                  </CardDescription>
                </div>
                {getStatusBadge(subscription.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {locale === 'ar' ? 'من' : 'From'}: {subscription.startDate}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {locale === 'ar' ? 'إلى' : 'To'}: {subscription.endDate}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">
                    {locale === 'ar' ? 'المميزات' : 'Features'}:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {subscription.features.map((feature, index) => (
                      <Badge key={index} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    {locale === 'ar' ? 'تجديد' : 'Renew'}
                  </Button>
                  <Button variant="outline" size="sm">
                    {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {subscriptions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {locale === 'ar' ? 'لا توجد اشتراكات' : 'No subscriptions'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {locale === 'ar' ? 'لم تقم بشراء أي اشتراكات بعد' : 'You haven\'t purchased any subscriptions yet'}
            </p>
            <Button>
              {locale === 'ar' ? 'تصفح الخطط' : 'Browse Plans'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}