import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Star,
  Quote,
  TrendingUp,
  Users,
  Award,
  Building2,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default async function CustomersPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('employers.customers');

  const testimonials = [
    {
      id: 1,
      name: 'Ahmed Al-Mansoori',
      position: 'HR Director',
      company: 'TechCorp UAE',
      avatar: '/images/testimonials/ahmed.jpg',
      rating: 5,
      quote: t('testimonials.ahmed.quote'),
      results: {
        hires: '+45%',
        time: '-60%',
        quality: '+30%'
      }
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      position: 'Talent Acquisition Manager',
      company: 'Innovate Solutions',
      avatar: '/images/testimonials/sarah.jpg',
      rating: 5,
      quote: t('testimonials.sarah.quote'),
      results: {
        hires: '+52%',
        time: '-55%',
        quality: '+35%'
      }
    },
    {
      id: 3,
      name: 'Mohammed Al-Rashid',
      position: 'CEO',
      company: 'FutureTech KSA',
      avatar: '/images/testimonials/mohammed.jpg',
      rating: 5,
      quote: t('testimonials.mohammed.quote'),
      results: {
        hires: '+38%',
        time: '-65%',
        quality: '+40%'
      }
    }
  ];

  const companies = [
    'TechCorp UAE', 'Innovate Solutions', 'FutureTech KSA', 'Digital Dynamics',
    'Smart Systems', 'NextGen Solutions', 'CloudTech', 'DataFlow Inc',
    'AI Solutions', 'TechHub', 'Innovation Labs', 'FutureWorks'
  ];

  const stats = [
    { number: '500+', label: t('stats.companies') },
    { number: '95%', label: t('stats.satisfaction') },
    { number: '60%', label: t('stats.timeReduction') },
    { number: '40%', label: t('stats.qualityIncrease') }
  ];

  const caseStudies = [
    {
      company: 'TechCorp UAE',
      industry: 'Technology',
      challenge: t('caseStudies.techcorp.challenge'),
      solution: t('caseStudies.techcorp.solution'),
      results: [
        t('caseStudies.techcorp.results.0'),
        t('caseStudies.techcorp.results.1'),
        t('caseStudies.techcorp.results.2')
      ]
    },
    {
      company: 'Innovate Solutions',
      industry: 'Consulting',
      challenge: t('caseStudies.innovate.challenge'),
      solution: t('caseStudies.innovate.solution'),
      results: [
        t('caseStudies.innovate.results.0'),
        t('caseStudies.innovate.results.1'),
        t('caseStudies.innovate.results.2')
      ]
    }
  ];

  return (
    <div className="min-h-screen py-8 lg:py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Award className="h-3 w-3 mr-1" />
            {t('badge')}
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonials */}
        <section className="mb-16">
          <h2 className="text-2xl lg:text-3xl font-bold text-center mb-12">
            {t('testimonials.title')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="relative">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-primary/20 absolute top-4 right-4" />

                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                    ))}
                  </div>

                  <blockquote className="text-muted-foreground mb-6 italic">
                    "{testimonial.quote}"
                  </blockquote>

                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.position}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">{testimonial.results.hires}</div>
                      <div className="text-xs text-muted-foreground">{t('metrics.hires')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">{testimonial.results.time}</div>
                      <div className="text-xs text-muted-foreground">{t('metrics.time')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">{testimonial.results.quality}</div>
                      <div className="text-xs text-muted-foreground">{t('metrics.quality')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Case Studies */}
        <section className="mb-16">
          <h2 className="text-2xl lg:text-3xl font-bold text-center mb-12">
            {t('caseStudies.title')}
          </h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {caseStudies.map((study, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Building2 className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{study.company}</span>
                    <Badge variant="outline">{study.industry}</Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-red-600 mb-2">{t('caseStudies.challenge')}</h4>
                      <p className="text-sm text-muted-foreground">{study.challenge}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-blue-600 mb-2">{t('caseStudies.solution')}</h4>
                      <p className="text-sm text-muted-foreground">{study.solution}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-green-600 mb-2">{t('caseStudies.results')}</h4>
                      <ul className="space-y-1">
                        {study.results.map((result, resultIndex) => (
                          <li key={resultIndex} className="flex items-start space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Companies Using Rolevate */}
        <section className="mb-16">
          <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8">
            {t('companies.title')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {companies.map((company, index) => (
              <Card key={index} className="text-center p-4 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="font-semibold text-sm">{company}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 lg:p-12">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/business-signup">
                {t('cta.primary')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/employers/pricing">
                {t('cta.secondary')}
              </a>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}