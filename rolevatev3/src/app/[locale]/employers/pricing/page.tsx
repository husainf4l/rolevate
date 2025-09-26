import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Star, Zap, Crown, Building } from "lucide-react";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("employers.pricing");

  const plans = [
    {
      name: t("plans.starter.name"),
      price: t("plans.starter.price"),
      period: t("plans.starter.period"),
      description: t("plans.starter.description"),
      icon: Building,
      popular: false,
      features: [
        { name: t("features.postJobs"), included: true },
        { name: t("features.basicSearch"), included: true },
        { name: t("features.emailSupport"), included: true },
        { name: t("features.basicAnalytics"), included: true },
        { name: t("features.aiMatching"), included: false },
        { name: t("features.prioritySupport"), included: false },
        { name: t("features.advancedAnalytics"), included: false },
        { name: t("features.apiAccess"), included: false },
      ],
    },
    {
      name: t("plans.professional.name"),
      price: t("plans.professional.price"),
      period: t("plans.professional.period"),
      description: t("plans.professional.description"),
      icon: Zap,
      popular: true,
      features: [
        { name: t("features.postJobs"), included: true },
        { name: t("features.basicSearch"), included: true },
        { name: t("features.emailSupport"), included: true },
        { name: t("features.basicAnalytics"), included: true },
        { name: t("features.aiMatching"), included: true },
        { name: t("features.prioritySupport"), included: true },
        { name: t("features.advancedAnalytics"), included: false },
        { name: t("features.apiAccess"), included: false },
      ],
    },
    {
      name: t("plans.enterprise.name"),
      price: t("plans.enterprise.price"),
      period: t("plans.enterprise.period"),
      description: t("plans.enterprise.description"),
      icon: Crown,
      popular: false,
      features: [
        { name: t("features.postJobs"), included: true },
        { name: t("features.basicSearch"), included: true },
        { name: t("features.emailSupport"), included: true },
        { name: t("features.basicAnalytics"), included: true },
        { name: t("features.aiMatching"), included: true },
        { name: t("features.prioritySupport"), included: true },
        { name: t("features.advancedAnalytics"), included: true },
        { name: t("features.apiAccess"), included: true },
      ],
    },
  ];

  const faqs = [
    {
      question: t("faqs.aiMatching.question"),
      answer: t("faqs.aiMatching.answer"),
    },
    {
      question: t("faqs.support.question"),
      answer: t("faqs.support.answer"),
    },
    {
      question: t("faqs.cancellation.question"),
      answer: t("faqs.cancellation.answer"),
    },
    {
      question: t("faqs.upgrade.question"),
      answer: t("faqs.upgrade.answer"),
    },
  ];

  return (
    <div className="min-h-screen py-8 lg:py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Star className="h-3 w-3 mr-1" />
            {t("badge")}
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <Card
                key={index}
                className={`relative ${
                  plan.popular ? "border-primary shadow-lg scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      {t("popular")}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">
                      /{plan.period}
                    </span>
                  </div>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <Button
                    className={`w-full mb-6 ${
                      plan.popular ? "" : "variant-outline"
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {t("getStarted")}
                  </Button>

                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center space-x-3"
                      >
                        {feature.included ? (
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span
                          className={`text-sm ${
                            feature.included
                              ? ""
                              : "text-muted-foreground line-through"
                          }`}
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-center">
              {t("comparison.title")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("comparison.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4 font-semibold">
                      {t("comparison.feature")}
                    </th>
                    <th className="text-center py-4 px-4 font-semibold">
                      {plans[0].name}
                    </th>
                    <th className="text-center py-4 px-4 font-semibold">
                      {plans[1].name}
                    </th>
                    <th className="text-center py-4 px-4 font-semibold">
                      {plans[2].name}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plans[0].features.map((_, featureIndex) => (
                    <tr key={featureIndex} className="border-b">
                      <td className="py-4 px-4 font-medium">
                        {plans[0].features[featureIndex].name}
                      </td>
                      {plans.map((plan, planIndex) => (
                        <td key={planIndex} className="text-center py-4 px-4">
                          {plan.features[featureIndex].included ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* AI Features Highlight */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8 lg:p-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                  {t("aiFeatures.title")}
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {t("aiFeatures.subtitle")}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">
                    {t("aiFeatures.intelligent.title")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("aiFeatures.intelligent.description")}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">
                    {t("aiFeatures.automated.title")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("aiFeatures.automated.description")}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">
                    {t("aiFeatures.accurate.title")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("aiFeatures.accurate.description")}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">
                    {t("aiFeatures.scalable.title")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("aiFeatures.scalable.description")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-2xl lg:text-3xl font-bold text-center mb-12">
            {t("faq.title")}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground text-sm">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 lg:p-12">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                {t("cta.title")}
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                {t("cta.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/business-signup">{t("cta.primary")}</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link href="/contact">{t("cta.secondary")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
