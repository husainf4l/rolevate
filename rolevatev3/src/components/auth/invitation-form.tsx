'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, User, ArrowLeft, CheckCircle } from 'lucide-react';
import Logo from '@/components/common/logo';
import { authService } from '@/services/auth';
import { useAuthContext } from '@/providers/auth-provider';
import { invitationsService, Invitation } from '@/services/invitations';

interface InvitationFormProps {
  token?: string;
}

export default function InvitationForm({ token }: InvitationFormProps) {
  const [step, setStep] = useState<'validate' | 'register' | 'success'>('validate');
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const t = useTranslations('invitation');
  const router = useRouter();
  const { login } = useAuthContext();

  const validateInvitation = useCallback(async (invitationToken: string) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await invitationsService.validateInvitation(invitationToken);

      if (result.success && result.invitation) {
        setInvitation(result.invitation);
        setEmail(result.invitation.email);
        setStep('register');
      } else {
        setError(result.message || t('invalidToken'));
        setStep('validate');
      }
    } catch {
      setError(t('invalidToken'));
      setStep('validate');
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (token) {
      validateInvitation(token);
    } else {
      setError(t('invalidToken'));
      setStep('validate');
    }
  }, [token, t, validateInvitation]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim()) {
      setError(t('form.validation.firstNameRequired'));
      return;
    }

    if (!lastName.trim()) {
      setError(t('form.validation.lastNameRequired'));
      return;
    }

    if (!password) {
      setError(t('form.validation.passwordRequired'));
      return;
    }

    if (password.length < 8) {
      setError(t('form.validation.passwordMinLength'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('form.validation.passwordMismatch'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const registerResult = await authService.registerCandidate({
        email,
        password,
        firstName,
        lastName,
        invitationToken: token,
      });

      if (registerResult.success) {
        // Auto-login after successful registration
        const loginResult = await login(email, password);

        if (loginResult.success) {
          setStep('success');
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setError('Account created but login failed. Please try logging in manually.');
        }
      } else {
        setError(registerResult.message || 'Registration failed');
      }
    } catch {
      setError('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'validate') {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl">
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>{t('loading')}</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                <p className="font-medium">{t('invalidToken')}</p>
              </div>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => router.push('/login')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (step === 'success') {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            {t('success.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {t('success.description')}
          </p>
          <Button onClick={() => router.push('/dashboard')} className="w-full">
            {t('success.goToDashboard')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Logo />
        </div>
        <CardTitle className="text-2xl">
          {t('title')}
        </CardTitle>
        <p className="text-muted-foreground">
          {invitation?.invitedBy?.name ? t('subtitle').replace('{organizationName}', invitation.invitedBy.name) : t('subtitle').replace('{organizationName}', 'your organization')}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t('form.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="pl-10 bg-muted"
                placeholder={t('form.emailPlaceholder')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium">
                {t('form.firstName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-10"
                  placeholder={t('form.firstNamePlaceholder')}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium">
                {t('form.lastName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="pl-10"
                  placeholder={t('form.lastNamePlaceholder')}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              {t('form.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                placeholder={t('form.passwordPlaceholder')}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">{t('form.passwordHint')}</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              {t('form.confirmPassword')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
                placeholder={t('form.confirmPasswordPlaceholder')}
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? t('creatingAccount') : t('createAccount')}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {t('form.termsText')}{' '}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/terms" className="text-primary hover:underline">
              {t('form.termsLink')}
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}