'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Logo, FloatingParticles } from '@/components/common';

interface FooterProps {
  locale: string;
}

export default function Footer({ locale }: FooterProps) {
  const t = useTranslations('footer');
  const router = useRouter();

  const navigationLinks = {
    company: [
      { name: t('company.about'), href: '/about' },
      { name: t('company.careers'), href: '/careers' },
      { name: t('company.press'), href: '/press' },
      { name: t('company.blog'), href: '/blog' }
    ],
    services: [
      { name: t('services.jobSearch'), href: '/jobs' },
      { name: t('services.resumeBuilder'), href: '/resume-builder' },
      { name: t('services.careerAdvice'), href: '/career-advice' },
      { name: t('services.employerServices'), href: '/employers' }
    ],
    support: [
      { name: t('support.helpCenter'), href: '/help' },
      { name: t('support.contactUs'), href: '/contact' },
      { name: t('support.privacy'), href: '/privacy' },
      { name: t('support.terms'), href: '/terms' }
    ],
    employers: [
      { name: t('employers.postJob'), href: '/post-job' },
      { name: t('employers.talentSearch'), href: '/talent-search' },
      { name: t('employers.pricing'), href: '/pricing' },
      { name: t('employers.successStories'), href: '/success-stories' }
    ]
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/rolevate', color: 'hover:text-blue-600' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/rolevate', color: 'hover:text-sky-500' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/rolevate', color: 'hover:text-pink-600' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/rolevate', color: 'hover:text-blue-700' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/rolevate', color: 'hover:text-red-600' }
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup');
  };

  return (
    <footer className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:24px_24px]"></div>
        </div>

        {/* Floating Particles Effect */}
        <FloatingParticles count={20} />
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10">
        {/* Top Section with Enhanced Design */}
        <div className="backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

              {/* Enhanced Company Info Section */}
              <div className="lg:col-span-4 space-y-8">
                {/* Logo and Brand */}
                <div className="group">
                  <Logo className="mb-4" />
                  <div className="w-16 h-1 bg-gradient-to-r from-primary to-blue-500 rounded-full mb-6 group-hover:w-24 transition-all duration-500"></div>
                  <p className="text-slate-300 leading-relaxed text-base">
                    {t('description')}
                  </p>
                </div>

                {/* Enhanced Contact Info */}
                <div className="space-y-4">
                  <div className="flex items-center text-slate-300 group hover:text-white transition-colors duration-300">
                    <div className="p-2 bg-slate-800/50 rounded-lg mr-4 group-hover:bg-primary/20 transition-colors duration-300">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">contact@rolevate.com</span>
                  </div>
                  <div className="flex items-center text-slate-300 group hover:text-white transition-colors duration-300">
                    <div className="p-2 bg-slate-800/50 rounded-lg mr-4 group-hover:bg-primary/20 transition-colors duration-300">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center text-slate-300 group hover:text-white transition-colors duration-300">
                    <div className="p-2 bg-slate-800/50 rounded-lg mr-4 group-hover:bg-primary/20 transition-colors duration-300">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{t('address')}</span>
                  </div>
                </div>

                {/* Enhanced Social Links */}
                <div className="pt-4">
                  <h5 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Follow Us</h5>
                  <div className="flex space-x-3">
                    {socialLinks.map((social) => (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group relative p-3 bg-slate-800/30 hover:bg-slate-700/50 rounded-xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 ${social.color} backdrop-blur-sm`}
                        aria-label={social.name}
                      >
                        <social.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced Navigation Links */}
              <div className="lg:col-span-5">
                <div className="grid grid-cols-2 gap-8 lg:gap-12">
                  {/* Company */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-bold text-white relative">
                      {t('sections.company')}
                      <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
                    </h4>
                    <ul className="space-y-3">
                      {navigationLinks.company.map((link) => (
                        <li key={link.name}>
                          <a
                            href={link.href}
                            className="group flex items-center text-slate-300 hover:text-white transition-all duration-300 text-sm font-medium"
                          >
                            <span className="w-0 group-hover:w-2 h-0.5 bg-primary transition-all duration-300 mr-0 group-hover:mr-2"></span>
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Services */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-bold text-white relative">
                      {t('sections.services')}
                      <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
                    </h4>
                    <ul className="space-y-3">
                      {navigationLinks.services.map((link) => (
                        <li key={link.name}>
                          <a
                            href={link.href}
                            className="group flex items-center text-slate-300 hover:text-white transition-all duration-300 text-sm font-medium"
                          >
                            <span className="w-0 group-hover:w-2 h-0.5 bg-primary transition-all duration-300 mr-0 group-hover:mr-2"></span>
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Support */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-bold text-white relative">
                      {t('sections.support')}
                      <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
                    </h4>
                    <ul className="space-y-3">
                      {navigationLinks.support.map((link) => (
                        <li key={link.name}>
                          <a
                            href={link.href}
                            className="group flex items-center text-slate-300 hover:text-white transition-all duration-300 text-sm font-medium"
                          >
                            <span className="w-0 group-hover:w-2 h-0.5 bg-primary transition-all duration-300 mr-0 group-hover:mr-2"></span>
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Employers */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-bold text-white relative">
                      {t('sections.employers')}
                      <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
                    </h4>
                    <ul className="space-y-3">
                      {navigationLinks.employers.map((link) => (
                        <li key={link.name}>
                          <a
                            href={link.href}
                            className="group flex items-center text-slate-300 hover:text-white transition-all duration-300 text-sm font-medium"
                          >
                            <span className="w-0 group-hover:w-2 h-0.5 bg-primary transition-all duration-300 mr-0 group-hover:mr-2"></span>
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Enhanced Newsletter & App Section */}
              <div className="lg:col-span-3 space-y-8">
                {/* Newsletter */}
                <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-white mb-3">{t('newsletter.title')}</h4>
                  <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                    {t('newsletter.description')}
                  </p>

                  <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                    <input
                      type="email"
                      placeholder={t('newsletter.placeholder')}
                      className="w-full px-4 py-3 bg-slate-800/60 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full px-4 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      {t('newsletter.subscribe')}
                    </button>
                  </form>
                </div>

                {/* Enhanced App Download */}
                <div className="space-y-4">
                  <h5 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t('app.download')}</h5>
                  <div className="grid grid-cols-1 gap-3">
                    <button className="group flex items-center justify-center px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                      <svg className="w-6 h-6 mr-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      <div className="text-left">
                        <div className="text-xs text-slate-400">Download on the</div>
                        <div className="text-sm font-semibold text-white">App Store</div>
                      </div>
                    </button>
                    <button className="group flex items-center justify-center px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                      <svg className="w-6 h-6 mr-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.53 20.75,12C20.75,12.47 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                      </svg>
                      <div className="text-left">
                        <div className="text-xs text-slate-400">Get it on</div>
                        <div className="text-sm font-semibold text-white">Google Play</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Section */}
        <div className="relative">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
              {/* Enhanced Copyright */}
              <div className="flex items-center space-x-4">
                <div className="text-slate-400 text-sm">
                  © {new Date().getFullYear()} <Logo className="inline" />. {t('copyright.allRightsReserved')}
                </div>
                <div className="text-slate-500 text-xs">
                  Made with ❤️ for job seekers
                </div>
              </div>

              {/* Enhanced Legal Links */}
              <div className="flex flex-wrap justify-center lg:justify-end space-x-6">
                {[
                  { name: t('legal.privacy'), href: '/privacy' },
                  { name: t('legal.terms'), href: '/terms' },
                  { name: t('legal.cookies'), href: '/cookies' },
                  { name: t('legal.accessibility'), href: '/accessibility' }
                ].map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="group relative text-slate-400 hover:text-white transition-all duration-300 text-sm font-medium"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}