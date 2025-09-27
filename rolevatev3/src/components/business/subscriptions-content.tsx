'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Calendar, CheckCircle, XCircle, Crown, Loader2 } from 'lucide-react';
import { Subscription } from '@/types/subscriptions';
import { subscriptionsService } from '@/services/subscriptions';
import { toast } from 'sonner';

interface SubscriptionsContentProps {
  locale: string;
}

export default function SubscriptionsContent({ locale }: SubscriptionsContentProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    // Skip loading if no backend API is configured
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.log('No backend API configured, skipping subscriptions load');
      setLoading(false);
      return;
    }
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionsService.getSubscriptions();

      if (response.success && response.subscriptions) {
        setSubscriptions(response.subscriptions);
      } else {
        setError(response.message || 'Failed to load subscriptions');
      }
    } catch {
      setError('Network error while loading subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleRenewSubscription = async (subscriptionId: string) => {
    try {
      setActionLoading(subscriptionId);
      const response = await subscriptionsService.renewSubscription(subscriptionId);

      if (response.success) {
        toast.success(locale === 'ar' ? 'تم تجديد الاشتراك بنجاح' : 'Subscription renewed successfully');
        fetchSubscriptions(); // Refresh the list
      } else {
        toast.error(response.message || (locale === 'ar' ? 'فشل في تجديد الاشتراك' : 'Failed to renew subscription'));
      }
    } catch {
      toast.error(locale === 'ar' ? 'خطأ في الشبكة' : 'Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من إلغاء هذا الاشتراك؟' : 'Are you sure you want to cancel this subscription?')) {
      return;
    }

    try {
      setActionLoading(subscriptionId);
      const response = await subscriptionsService.cancelSubscription(subscriptionId);

      if (response.success) {
        toast.success(locale === 'ar' ? 'تم إلغاء الاشتراك بنجاح' : 'Subscription cancelled successfully');
        fetchSubscriptions(); // Refresh the list
      } else {
        toast.error(response.message || (locale === 'ar' ? 'فشل في إلغاء الاشتراك' : 'Failed to cancel subscription'));
      }
    } catch {
      toast.error(locale === 'ar' ? 'خطأ في الشبكة' : 'Network error');
    } finally {
      setActionLoading(null);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchSubscriptions}>
          {locale === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
        </Button>
      </div>
    );
  }

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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRenewSubscription(subscription.id)}
                    disabled={actionLoading === subscription.id}
                  >
                    {actionLoading === subscription.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {locale === 'ar' ? 'تجديد' : 'Renew'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelSubscription(subscription.id)}
                    disabled={actionLoading === subscription.id}
                  >
                    {actionLoading === subscription.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
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