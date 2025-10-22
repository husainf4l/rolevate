'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import Logo from '@/components/common/logo';
import SettingsMenu from '@/components/common/settingsMenu';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuthContext } from '@/providers/auth-provider';
// import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Menu, X, Home, Briefcase, Building2, FileText, Info, Phone, Settings, User, LogOut, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const t = useTranslations('navbar');
  const { user, userType, isAuthenticated, logout } = useAuthContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: t('home'), icon: Home },
    { href: '/jobs', label: t('jobs'), icon: Briefcase },
    { href: '/employers', label: t('employers'), icon: Building2 },
    { href: '/blog', label: t('blog'), icon: FileText },
    { href: '/about', label: t('about'), icon: Info },
    { href: '/contact', label: t('contact'), icon: Phone }
  ];

  const getUserInitials = () => {
    if (!user?.name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return user.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  const getDashboardLink = () => {
    return userType === 'business' ? '/business' : '/dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="text-lg" asText />
            </Link>
          </div>

          {/* Navigation Links - Hidden on mobile */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink 
                    asChild 
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link href={item.href}>
                      {item.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right side - Controls */}
          <div className="flex items-center space-x-3">
            <SettingsMenu />

            {isAuthenticated ? (
              // Authenticated user menu
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.image || undefined} alt={user?.name || user?.email} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || user?.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      {userType === 'business' && user && user.organization && (
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.organization.name}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()}>
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Unauthenticated user buttons
              <>
                {/* Business Sign Up Button */}
                <Button asChild variant="outline" className="hidden sm:inline-flex">
                  <Link href="/business-signup">
                    {t('businessSignUp')}
                  </Link>
                </Button>

                {/* Sign In Button */}
                <Button asChild className="hidden sm:inline-flex">
                  <Link href="/login">
                    {t('signIn')}
                  </Link>
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Mobile Navigation Menu</SheetTitle>
                  <SheetDescription>
                    Access navigation links, settings, and account options
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-border/50">
                    <Link href="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
                      <Logo className="text-lg" asText />
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileMenuOpen(false)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 overflow-y-auto">
                    {/* Navigation Section */}
                    <div className="p-6">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                        Navigation
                      </h3>
                      <div className="space-y-1">
                        {navItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Button
                              key={item.href}
                              variant="ghost"
                              className="w-full justify-start h-12 px-3 hover:bg-accent hover:text-accent-foreground"
                              asChild
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Link href={item.href} className="flex items-center space-x-3">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                                <span className="flex-1 text-left">{item.label}</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                              </Link>
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Settings Section */}
                    <div className="px-6 pb-6 border-b border-border/50">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                        Preferences
                      </h3>
                      <SettingsMenu />
                    </div>

                    {/* Account Section */}
                    <div className="p-6">
                      {isAuthenticated ? (
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Account
                          </h3>

                          {/* User Profile */}
                          <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/50">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={user?.image || undefined} alt={user?.name || user?.email} />
                              <AvatarFallback className="text-sm">{getUserInitials()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
                              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                              {userType === 'business' && user && user.organization && (
                                <p className="text-xs text-muted-foreground truncate">{user.organization.name}</p>
                              )}
                            </div>
                          </div>

                          {/* Account Actions */}
                          <div className="space-y-1">
                            <Button
                              variant="ghost"
                              className="w-full justify-start h-10 px-3"
                              asChild
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Link href={getDashboardLink()} className="flex items-center space-x-3">
                                <User className="h-4 w-4" />
                                <span>Dashboard</span>
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start h-10 px-3"
                              asChild
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Link href="/profile" className="flex items-center space-x-3">
                                <Settings className="h-4 w-4" />
                                <span>Profile</span>
                              </Link>
                            </Button>
                          </div>

                          {/* Logout */}
                          <div className="pt-2 border-t border-border/50">
                            <Button
                              variant="ghost"
                              className="w-full justify-start h-10 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                logout();
                                setMobileMenuOpen(false);
                              }}
                            >
                              <LogOut className="h-4 w-4 mr-3" />
                              Log out
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Get Started
                          </h3>

                          <div className="space-y-3">
                            <Button
                              asChild
                              className="w-full h-12"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Link href="/login">
                                {t('signIn')}
                              </Link>
                            </Button>
                            <Button
                              asChild
                              variant="outline"
                              className="w-full h-12"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Link href="/business-signup">
                                {t('businessSignUp')}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}