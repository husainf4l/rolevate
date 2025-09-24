import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/i18n/navigation';
import {
  Brain,
  Search,
  MessageSquare,
  TrendingUp,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';

export default async function EmployersPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('employers');

  const features = [
    {
      icon: Brain,
      title: t('features.aiInterview.title'),
      description: t('features.aiInterview.description'),
      benefits: [
        t('features.aiInterview.benefits.0'),
        t('features.aiInterview.benefits.1'),
        t('features.aiInterview.benefits.2')
      ]
    },
    {
      icon: Search,
      title: t('features.aiMatching.title'),
      description: t('features.aiMatching.description'),
      benefits: [
        t('features.aiMatching.benefits.0'),
        t('features.aiMatching.benefits.1'),
        t('features.aiMatching.benefits.2')
      ]
    },
    {
      icon: Star,
      title: t('features.smartRating.title'),
      description: t('features.smartRating.description'),
      benefits: [
        t('features.smartRating.benefits.0'),
        t('features.smartRating.benefits.1'),
        t('features.smartRating.benefits.2')
      ]
    },
    {
      icon: TrendingUp,
      title: t('features.analytics.title'),
      description: t('features.analytics.description'),
      benefits: [
        t('features.analytics.benefits.0'),
        t('features.analytics.benefits.1'),
        t('features.analytics.benefits.2')
      ]
    }
  ];

  const stats = [
    { number: '95%', label: t('stats.matchAccuracy') },
    { number: '60%', label: t('stats.timeReduction') },
    { number: '500+', label: t('stats.companies') },
    { number: '10k+', label: t('stats.candidates') }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              {t('hero.badge')}
            </Badge>

            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              {t('hero.title')}
              <span className="text-primary block mt-2">{t('hero.subtitle')}</span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              {t('hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild className="px-8">
                <Link href="/employers/post-job">
                  {t('hero.cta.primary')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8">
                <Link href="/employers/find-candidates">
                  {t('hero.cta.secondary')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm lg:text-base text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t('features.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t('howItWorks.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('howItWorks.step1.title')}</h3>
              <p className="text-muted-foreground">{t('howItWorks.step1.description')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('howItWorks.step2.title')}</h3>
              <p className="text-muted-foreground">{t('howItWorks.step2.description')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('howItWorks.step3.title')}</h3>
              <p className="text-muted-foreground">{t('howItWorks.step3.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-lg lg:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="px-8">
              <Link href="/business-signup">
                {t('cta.primary')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link href="/employers/pricing">
                {t('cta.secondary')}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}