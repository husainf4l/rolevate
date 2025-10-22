import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  Filter,
  Brain,
  Star,
  MapPin,
  Briefcase,
  GraduationCap,
  Users,
  Sparkles,
  CheckCircle,
  Heart,
  MessageSquare
} from 'lucide-react';

export default async function FindCandidatesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { /* locale */ } = await params;
  const t = await getTranslations('employers.findCandidates');

  const aiMatchingFeatures = [
    {
      icon: Brain,
      title: t('aiFeatures.skill.title'),
      description: t('aiFeatures.skill.description')
    },
    {
      icon: Star,
      title: t('aiFeatures.experience.title'),
      description: t('aiFeatures.experience.description')
    },
    {
      icon: Users,
      title: t('aiFeatures.cultural.title'),
      description: t('aiFeatures.cultural.description')
    }
  ];

  // Candidates will be loaded from API - no demo data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockCandidates: any[] = [];

  return (
    <div className="min-h-screen py-8 lg:py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            {t('badge')}
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label>{t('filters.keywords.label')}</Label>
                <Input
                  placeholder={t('filters.keywords.placeholder')}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('filters.location.label')}</Label>
                <Input
                  placeholder={t('filters.location.placeholder')}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('filters.experience.label')}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={t('filters.experience.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">{t('filters.experience.options.entry')}</SelectItem>
                    <SelectItem value="mid">{t('filters.experience.options.mid')}</SelectItem>
                    <SelectItem value="senior">{t('filters.experience.options.senior')}</SelectItem>
                    <SelectItem value="executive">{t('filters.experience.options.executive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('filters.jobType.label')}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={t('filters.jobType.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fulltime">{t('filters.jobType.options.fulltime')}</SelectItem>
                    <SelectItem value="parttime">{t('filters.jobType.options.parttime')}</SelectItem>
                    <SelectItem value="contract">{t('filters.jobType.options.contract')}</SelectItem>
                    <SelectItem value="freelance">{t('filters.jobType.options.freelance')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">React</Badge>
              <Badge variant="secondary">TypeScript</Badge>
              <Badge variant="secondary">Node.js</Badge>
              <Button variant="ghost" size="sm">
                <Filter className="h-3 w-3 mr-1" />
                {t('filters.more')}
              </Button>
            </div>

            <div className="flex gap-4">
              <Button className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                {t('search.button')}
              </Button>
              <Button variant="outline">
                <Brain className="h-4 w-4 mr-2" />
                {t('search.aiMatch')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Candidates List */}
          <div className="lg:col-span-3 space-y-4">
            {mockCandidates.map((candidate) => (
              <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={candidate.avatar} alt={candidate.name} />
                      <AvatarFallback>{candidate.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">{candidate.name}</h3>
                          <p className="text-muted-foreground">{candidate.title}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 mb-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="font-semibold text-lg">{candidate.matchScore}%</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{t('matchScore')}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{candidate.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Briefcase className="h-3 w-3" />
                          <span>{candidate.experience}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <GraduationCap className="h-3 w-3" />
                          <span>{candidate.education}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {candidate.skills.map((skill: string) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button size="sm">
                          <Heart className="h-3 w-3 mr-1" />
                          {t('actions.save')}
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {t('actions.message')}
                        </Button>
                        <Button size="sm" variant="default">
                          {t('actions.viewProfile')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Features Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <span>{t('aiFeatures.title')}</span>
                </CardTitle>
                <CardDescription>
                  {t('aiFeatures.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiMatchingFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex space-x-3 p-3 rounded-lg bg-muted/50">
                      <Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>{t('premium.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{t('premium.features.unlimited')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{t('premium.features.priority')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{t('premium.features.analytics')}</span>
                </div>
                <Button className="w-full mt-4" size="sm">
                  {t('premium.upgrade')}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t('aiInsights.title')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('aiInsights.description')}
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>{t('aiInsights.metrics.skillMatch')}</span>
                    <span className="font-medium">95%</span>
                  </div>
                  <Progress value={95} className="h-1" />
                  <div className="flex justify-between">
                    <span>{t('aiInsights.metrics.experience')}</span>
                    <span className="font-medium">88%</span>
                  </div>
                  <Progress value={88} className="h-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}