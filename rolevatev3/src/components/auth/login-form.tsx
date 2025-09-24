'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';
import Logo from '@/components/common/logo';
import { authService } from '@/services/auth';
import { useAuthContext } from '@/providers/auth-provider';

export default function LoginForm() {
  const [step, setStep] = useState<'email' | 'login' | 'signup'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const t = useTranslations('login');
  const router = useRouter();
  const { login } = useAuthContext();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError('');
    }
  };

  const handleEmailSubmit = async (action: 'login' | 'signup') => {
    if (!email) {
      setEmailError(t('emailRequired'));
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError(t('emailInvalid'));
      return;
    }
    
    setStep(action);
  };

  const handleBackToEmail = () => {
    setStep('email');
    setEmailError('');
    setError('');
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !password || !confirmPassword) {
      setError(t('fillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await authService.registerCandidate({
        email: email,
        password: password,
        name: `${firstName} ${lastName}`,
      });

      if (result.success && result.user) {
        // Store user data (token is already stored as HTTP-only cookie)
        // For registration, we know it's a candidate user
        authService.storeUserData(result.user, 'candidate');
        
        // Navigate to dashboard
        router.push('/dashboard');
      } else {
        setError(result.message || t('registrationFailed'));
      }
    } catch (error) {
      setError(t('networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!password) {
      setError(t('passwordRequired'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await login(email, password);

      if (!result.success) {
        setError(result.message || t('loginFailed'));
      }
      // Navigation is handled by the auth context
    } catch (error) {
      setError(t('networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex justify-center mb-4">
          <Logo className="text-2xl" />
        </div>
        <p className="text-muted-foreground text-center text-sm">
          {t('subtitle')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email Input */}
        <div className="space-y-2">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={`pl-10 ${emailError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  // Don't auto-submit, let user choose login or signup
                }
              }}
            />
          </div>
          {emailError && (
            <p className="text-sm text-red-500 mt-1">
              {emailError}
            </p>
          )}
        </div>

        {/* Login Button */}
        <Button 
          className="w-full" 
          size="lg" 
          onClick={() => handleEmailSubmit('login')}
          disabled={!email || !validateEmail(email)}
        >
          {t('signIn')}
        </Button>

        {/* Sign Up Button */}
        <Button 
          variant="outline"
          className="w-full" 
          size="lg" 
          onClick={() => handleEmailSubmit('signup')}
          disabled={!email || !validateEmail(email)}
        >
          {t('signUp')}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t('or')}
            </span>
          </div>
        </div>

        {/* Google Button */}
        <Button variant="outline" className="w-full" size="lg">
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {t('continueWithGoogle')}
        </Button>
      </CardContent>
    </Card>
  );

  const renderLoginStep = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToEmail}
            className="p-1"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Logo className="text-xl" />
          <div className="w-8"></div> {/* Spacer for balance */}
        </div>
        <CardTitle className="text-2xl font-bold text-center">
          {t('welcomeBack')}
        </CardTitle>
        <p className="text-muted-foreground text-center text-sm">
          {email}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-500 text-center p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        {/* Password Input */}
        <div className="space-y-2">
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Sign In Button */}
        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? t('signingIn') : t('signIn')}
        </Button>

        {/* Forgot Password */}
        <div className="text-center">
          <button className="text-sm text-primary hover:underline">
            {t('forgotPassword')}
          </button>
        </div>
      </CardContent>
    </Card>
  );

  const renderSignupStep = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToEmail}
            className="p-1"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Logo className="text-xl" />
          <div className="w-8"></div> {/* Spacer for balance */}
        </div>
        <CardTitle className="text-2xl font-bold text-center">
          {t('registration.title')}
        </CardTitle>
        <p className="text-muted-foreground text-center text-sm">
          {email}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-500 text-center p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        {/* First Name */}
        <div className="space-y-2">
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('registration.firstNamePlaceholder')}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('registration.lastNamePlaceholder')}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder={t('registration.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder={t('registration.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Sign Up Button */}
        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? t('registration.creatingAccount') : t('registration.signUp')}
        </Button>

        {/* Terms */}
        <p className="text-xs text-muted-foreground text-center">
          {t('termsText')} {' '}
          <button className="text-primary hover:underline">
            {t('termsLink')}
          </button>
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
          {step === 'email' && renderEmailStep()}
      {step === 'login' && renderLoginStep()}
      {step === 'signup' && renderSignupStep()}
    </div>
  );
}