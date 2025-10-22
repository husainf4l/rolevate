'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Users, Star, CreditCard, ChevronRight } from 'lucide-react';

export default function EmployersNavbar() {
  const t = useTranslations('employers.navbar');
  const pathname = usePathname();

  const navItems = [
    { href: '/employers', label: t('home'), icon: Home },
    { href: '/employers/post-job', label: t('postJob'), icon: Briefcase },
    { href: '/employers/find-candidates', label: t('findCandidates'), icon: Users },
    { href: '/employers/customers', label: t('customers'), icon: Star },
    { href: '/employers/pricing', label: t('pricing'), icon: CreditCard }
  ];

  const isActive = (href: string) => {
    if (href === '/employers') {
      return pathname === '/employers' || pathname === '/ar/employers';
    }
    return pathname === href || pathname === `/ar${href}`;
  };

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border/50 sticky ">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Button
                  key={item.href}
                  variant={active ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 h-9 transition-all duration-200",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                    {active && <ChevronRight className="h-3 w-3 ml-1" />}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}