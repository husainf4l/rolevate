import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  FileText,
  Users,
  Clock,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';

export default async function PostJobPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('employers.postJob');

  const aiFeatures = [
    {
      icon: Brain,
      title: t('aiFeatures.description.title'),
      description: t('aiFeatures.description.description')
    },
    {
      icon: FileText,
      title: t('aiFeatures.requirements.title'),
      description: t('aiFeatures.requirements.description')
    },
    {
      icon: Users,
      title: t('aiFeatures.candidates.title'),
      description: t('aiFeatures.candidates.description')
    }
  ];

  const jobTypes = [
    t('form.jobTypes.fullTime'),
    t('form.jobTypes.partTime'),
    t('form.jobTypes.contract'),
    t('form.jobTypes.freelance')
  ];

  const experienceLevels = [
    t('form.experienceLevels.entry'),
    t('form.experienceLevels.mid'),
    t('form.experienceLevels.senior'),
    t('form.experienceLevels.executive')
  ];

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

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Job Posting Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>{t('form.title')}</span>
                </CardTitle>
                <CardDescription>
                  {t('form.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">{t('form.jobTitle.label')}</Label>
                    <Input
                      id="jobTitle"
                      placeholder={t('form.jobTitle.placeholder')}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">{t('form.company.label')}</Label>
                    <Input
                      id="company"
                      placeholder={t('form.company.placeholder')}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">{t('form.location.label')}</Label>
                    <Input
                      id="location"
                      placeholder={t('form.location.placeholder')}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobType">{t('form.jobType.label')}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t('form.jobType.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((type) => (
                          <SelectItem key={type} value={type.toLowerCase()}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">{t('form.experience.label')}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t('form.experience.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level} value={level.toLowerCase()}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">{t('form.salary.label')}</Label>
                    <Input
                      id="salary"
                      placeholder={t('form.salary.placeholder')}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('form.description.label')}</Label>
                  <Textarea
                    id="description"
                    placeholder={t('form.description.placeholder')}
                    className="min-h-32"
                  />
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Brain className="h-3 w-3 mr-1" />
                    {t('form.description.aiHelp')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">{t('form.requirements.label')}</Label>
                  <Textarea
                    id="requirements"
                    placeholder={t('form.requirements.placeholder')}
                    className="min-h-24"
                  />
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Brain className="h-3 w-3 mr-1" />
                    {t('form.requirements.aiHelp')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t('form.skills.label')}</Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-12">
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>React</span>
                      <button className="ml-1 hover:bg-destructive/20 rounded-full p-0.5">
                        ×
                      </button>
                    </Badge>
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>TypeScript</span>
                      <button className="ml-1 hover:bg-destructive/20 rounded-full p-0.5">
                        ×
                      </button>
                    </Badge>
                  </div>
                  <Input
                    placeholder={t('form.skills.placeholder')}
                    className="mt-2"
                  />
                </div>

                <Button className="w-full" size="lg">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t('form.submit')}
                </Button>
              </CardContent>
            </Card>
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
                {aiFeatures.map((feature, index) => {
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
                  <span>{t('benefits.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{t('benefits.instant')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{t('benefits.quality')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{t('benefits.time')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{t('benefits.analytics')}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">{t('quickPost.title')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('quickPost.description')}
                </p>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('quickPost.button')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}