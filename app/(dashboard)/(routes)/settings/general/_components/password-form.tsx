'use client';

import { User } from '@prisma/client';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { OtpInput } from '@/components/common/otp-input';
import { TextBadge } from '@/components/common/text-badge';
import { Button, Input } from '@/components/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';
import { maskEmail } from '@/lib/utils';

const RESEND_COOLDOWN_SEC = 60;

type PasswordFormProps = {
  initialData: User;
};

export const PasswordForm = ({ initialData }: PasswordFormProps) => {
  const t = useTranslations('settings.passwordForm');

  const { toast } = useToast();
  const router = useRouter();

  const hasPassword = Boolean(initialData.password);

  const [isOpen, setIsOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [maskedEmail, setMaskedEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [codeError, setCodeError] = useState('');

  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN_SEC);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const handleOpen = async () => {
    setIsFetching(true);
    setPasswordError('');
    setCodeError('');

    try {
      const data = await fetcher.post(`/api/users/${initialData.id}/password`, {
        responseType: 'json',
      });

      setMaskedEmail(data.maskedEmail || maskEmail(initialData.email));
      setIsOpen(true);
      startCooldown();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsFetching(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsFetching(true);
    setCodeError('');

    try {
      await fetcher.delete(`/api/users/${initialData.id}/password`);
      const data = await fetcher.post(`/api/users/${initialData.id}/password`, {
        responseType: 'json',
      });

      setMaskedEmail(data.maskedEmail || maskEmail(initialData.email));
      setCode('');
      startCooldown();
      toast({ title: t('codeSent', { email: maskedEmail }) });
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsFetching(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setCode('');
    setPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setCodeError('');
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setResendCooldown(0);
  };

  const handleSubmit = async () => {
    setPasswordError('');
    setCodeError('');

    if (password.length < 8) {
      setPasswordError(t('errors.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError(t('errors.passwordMismatch'));
      return;
    }

    if (code.length < 6) {
      setCodeError(t('errors.invalidCode'));
      return;
    }

    setIsFetching(true);

    try {
      await fetcher.patch(`/api/users/${initialData.id}/password`, {
        body: { code, password, confirmPassword },
        responseType: 'json',
      });

      toast({ title: t('passwordUpdated') });
      handleCancel();
      router.refresh();
    } catch (error) {
      const message = (error as Error)?.message ?? '';
      if (message.toLowerCase().includes('code') || message.toLowerCase().includes('invalid')) {
        setCodeError(t('errors.invalidCode'));
      } else if (message.toLowerCase().includes('match')) {
        setPasswordError(t('errors.passwordMismatch'));
      } else if (message.toLowerCase().includes('short') || message.toLowerCase().includes('8')) {
        setPasswordError(t('errors.passwordTooShort'));
      } else {
        toast({ isError: true, description: message });
      }
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Card className="shadow-none rounded-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-base">{t('title')}</CardTitle>
              <TextBadge
                label={t(hasPassword ? 'isSet' : 'notSet')}
                variant={hasPassword ? 'green' : 'yellow'}
              />
            </div>
            <CardDescription className="text-xs">{t('body')}</CardDescription>
          </div>
          {!isOpen && (
            <div className="shrink-0">
              <Button
                variant={hasPassword ? 'secondary' : 'outline'}
                disabled={isFetching}
                onClick={handleOpen}
                className="w-full sm:w-auto"
              >
                {t(hasPassword ? 'change' : 'set')}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-0">
          <div className="flex flex-col gap-5">
            <p className="text-sm text-muted-foreground">
              {t('codeSent', { email: maskedEmail || maskEmail(initialData.email) })}
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{t('code')}</label>
              <OtpInput
                setToken={setCode}
                disabled={isFetching}
                errorMessage={codeError}
                hasSeparator
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-medium">{t('newPassword')}</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    disabled={isFetching}
                    placeholder={t('enterNewPassword')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={passwordError ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-medium">{t('confirmPassword')}</label>
                <div className="relative">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    disabled={isFetching}
                    placeholder={t('enterConfirmPassword')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={passwordError ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {passwordError && <p className="text-xs text-red-500 -mt-2">{passwordError}</p>}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={isFetching || code.length < 6}>
                  {t('save')}
                </Button>
                <Button variant="ghost" onClick={handleCancel} disabled={isFetching}>
                  {t('cancel')}
                </Button>
              </div>

              <button
                type="button"
                onClick={handleResend}
                disabled={isFetching || resendCooldown > 0}
                className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors underline-offset-4 hover:underline"
              >
                {resendCooldown > 0 ? t('resendIn', { seconds: resendCooldown }) : t('resend')}
              </button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
