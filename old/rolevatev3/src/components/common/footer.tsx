"use client";

import { Link } from '@/i18n/navigation';
import Logo from '@/components/common/logo';
import { Separator } from '@/components/ui/separator';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Globe
} from 'lucide-react';

interface FooterProps {
  locale: string;
}

export default function Footer({ locale }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { href: '/about', label: locale === 'ar' ? 'من نحن' : 'About Us' },
      { href: '/careers', label: locale === 'ar' ? 'الوظائف' : 'Careers' },
      { href: '/press', label: locale === 'ar' ? 'الإعلام' : 'Press' },
      { href: '/contact', label: locale === 'ar' ? 'اتصل بنا' : 'Contact' }
    ],
    services: [
      { href: '/jobs', label: locale === 'ar' ? 'البحث عن وظائف' : 'Job Search' },
      { href: '/employers', label: locale === 'ar' ? 'للموظفين' : 'For Employers' },
      { href: '/business-signup', label: locale === 'ar' ? 'تسجيل الشركات' : 'Business Signup' },
      { href: '/pricing', label: locale === 'ar' ? 'الأسعار' : 'Pricing' }
    ],
    resources: [
      { href: '/blog', label: locale === 'ar' ? 'المدونة' : 'Blog' },
      { href: '/help', label: locale === 'ar' ? 'المساعدة' : 'Help Center' },
      { href: '/faq', label: locale === 'ar' ? 'الأسئلة الشائعة' : 'FAQ' },
      { href: '/support', label: locale === 'ar' ? 'الدعم' : 'Support' }
    ],
    legal: [
      { href: '/privacy', label: locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy' },
      { href: '/terms', label: locale === 'ar' ? 'الشروط والأحكام' : 'Terms of Service' },
      { href: '/cookies', label: locale === 'ar' ? 'سياسة الكوكيز' : 'Cookie Policy' },
      { href: '/accessibility', label: locale === 'ar' ? 'إمكانية الوصول' : 'Accessibility' }
    ]
  };

  const socialLinks = [
    { href: 'https://facebook.com/rolevate', icon: Facebook, label: 'Facebook' },
    { href: 'https://twitter.com/rolevate', icon: Twitter, label: 'Twitter' },
    { href: 'https://instagram.com/rolevate', icon: Instagram, label: 'Instagram' },
    { href: 'https://linkedin.com/company/rolevate', icon: Linkedin, label: 'LinkedIn' },
    { href: 'https://youtube.com/rolevate', icon: Youtube, label: 'YouTube' }
  ];

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Logo className="text-xl" />
              <span className="text-xl font-bold text-foreground">Rolevate</span>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {locale === 'ar'
                ? 'منصة التوظيف المدعومة بالذكاء الاصطناعي للشرق الأوسط. وجد وظيفتك المثالية بشكل أسرع مع مطابقة الوظائف الذكية.'
                : 'AI-powered recruitment platform for the Middle East. Land your dream job faster with intelligent career matching.'
              }
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>contact@rolevate.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+971 50 123 4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>
                  {locale === 'ar'
                    ? 'دبي، الإمارات العربية المتحدة'
                    : 'Dubai, United Arab Emirates'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {locale === 'ar' ? 'الشركة' : 'Company'}
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {locale === 'ar' ? 'الخدمات' : 'Services'}
            </h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {locale === 'ar' ? 'الموارد' : 'Resources'}
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {locale === 'ar' ? 'قانوني' : 'Legal'}
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="text-sm text-muted-foreground">
            © {currentYear} Rolevate. {locale === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </div>

          {/* Social Media Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-muted/50 hover:bg-primary hover:text-primary-foreground rounded-lg flex items-center justify-center transition-colors"
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="w-4 h-4" />
            <Link
              href="/"
              locale="en"
              className={`hover:text-primary transition-colors ${locale === 'en' ? 'text-primary font-medium' : ''}`}
            >
              English
            </Link>
            <span className="text-muted-foreground/50">|</span>
            <Link
              href="/"
              locale="ar"
              className={`hover:text-primary transition-colors ${locale === 'ar' ? 'text-primary font-medium' : ''}`}
            >
              العربية
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}