import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Briefcase,
  Eye,
  TrendingUp,
  Plus,
  MoreHorizontal,
  Building2,
  MessageSquare,
  Calendar,
  BarChart3,
} from 'lucide-react';

interface BusinessPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: BusinessPageProps) {
  const { locale } = await params;
  const t = await getTranslations('business.dashboard');
  
  return {
    title: t('title'),
    description: t('description')
  };
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { locale } = await params;
  const t = await getTranslations('business.dashboard');

  return (
    <div className="p-6 space-y-6">
          {/* Header */}
          <div className={`flex items-center justify-between ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t('welcome')}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t('subtitle')}
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              {t('actions.postJob')}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('stats.totalJobs')}
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2</span> {t('stats.thisMonth')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('stats.activeApplications')}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">254</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+18%</span> {t('stats.fromLastMonth')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('stats.profileViews')}
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,429</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+8%</span> {t('stats.fromLastMonth')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('stats.hireMade')}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+3</span> {t('stats.thisMonth')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {t('quickActions.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('quickActions.postNewJob')}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  {t('quickActions.viewCandidates')}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t('quickActions.checkMessages')}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {t('quickActions.viewReports')}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Jobs */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('recentJobs.title')}</CardTitle>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Sample job listings */}
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <h4 className="font-medium">Senior Frontend Developer</h4>
                      <p className="text-sm text-muted-foreground">{t('recentJobs.postedToday')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">24 {t('recentJobs.applicants')}</Badge>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        {t('recentJobs.active')}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <h4 className="font-medium">Product Manager</h4>
                      <p className="text-sm text-muted-foreground">{t('recentJobs.posted2DaysAgo')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">18 {t('recentJobs.applicants')}</Badge>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        {t('recentJobs.active')}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <h4 className="font-medium">UX/UI Designer</h4>
                      <p className="text-sm text-muted-foreground">{t('recentJobs.posted1WeekAgo')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">42 {t('recentJobs.applicants')}</Badge>
                      <Badge variant="outline">{t('recentJobs.closed')}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Interviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {t('upcomingInterviews.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <h4 className="font-medium">Ahmed Hassan - Frontend Developer</h4>
                      <p className="text-sm text-muted-foreground">
                        {locale === 'ar' ? 'اليوم 2:00 م' : 'Today at 2:00 PM'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{t('upcomingInterviews.upcoming')}</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <h4 className="font-medium">Sara Al-Rashid - Product Manager</h4>
                      <p className="text-sm text-muted-foreground">
                        {locale === 'ar' ? 'غداً 10:00 ص' : 'Tomorrow at 10:00 AM'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{t('upcomingInterviews.scheduled')}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
    </div>
  );
}
