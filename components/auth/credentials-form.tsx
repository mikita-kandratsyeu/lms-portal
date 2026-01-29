'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { PASSWORD_VALIDATION } from '@/constants/auth';
import { OTP_LENGTH } from '@/constants/otp';
import { fetcher } from '@/lib/fetcher';
import { isValidUrl } from '@/lib/utils';

import { CaptchaInvisible } from '../common/captcha-invisible';
import { OtpInput } from '../common/otp-input';
import { Button, Input } from '../ui';
import { useToast } from '../ui/use-toast';

type CredentialsFromProps = {
  callbackUrl?: string;
  isDisabledButtons?: boolean;
  isSignUpFlow?: boolean;
  setIsDisabledButtons?: (value: boolean) => void;
};

const signInEmailOnlySchema = z.object({
  email: z.string().min(8, { message: 'errors.email' }).email({ message: 'errors.invalidEmail' }),
});

const signInSchema = z.intersection(
  signInEmailOnlySchema,
  z.object({
    password: z.string().min(4, { message: 'errors.password' }).regex(PASSWORD_VALIDATION, {
      message: 'errors.passwordRules',
    }),
  }),
);

const signUpSchema = z.intersection(
  signInSchema,
  z.object({ name: z.string().min(4, { message: 'errors.username' }).trim() }),
);

type Data = z.infer<typeof signUpSchema> & { otp?: string };

export const CredentialsFrom = ({
  callbackUrl = '',
  isDisabledButtons,
  isSignUpFlow,
  setIsDisabledButtons,
}: CredentialsFromProps) => {
  const t = useTranslations('auth-form');
  const { toast } = useToast();

  const locale = useLocale();
  const router = useRouter();

  const [captchaToken, setCaptchaToken] = useState('');
  const [otp, setOtp] = useState('');

  const [captchaVisible, setCaptchaVisible] = useState(false);
  const [isSignInWithPass, setIsSignInWithPass] = useState(false);
  const [otpResponse, setOtpResponse] = useState<{ maskedEmail: string } | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = useMemo(() => {
    if (isSignUpFlow) {
      return signUpSchema;
    }

    if (isSignInWithPass) {
      return signInSchema;
    }

    return signInEmailOnlySchema;
  }, [isSignInWithPass, isSignUpFlow]);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      ...(isSignUpFlow && { name: '' }),
      email: '',
      password: '',
    },
  });

  const { isSubmitting, errors } = form.formState;

  useEffect(() => {
    const handleSubmitCallback = async () => {
      try {
        setIsDisabledButtons?.(true);

        let response = null;

        if (
          isSignUpFlow ||
          isSignInWithPass ||
          (Boolean(otpResponse) && otp.length === OTP_LENGTH)
        ) {
          response = await signIn('credentials', {
            ...data,
            email: data?.email?.toLowerCase(),
            callbackUrl,
            isSignUpFlow,
            redirect: false,
          });
        }

        if (!isSignUpFlow && !isSignInWithPass && !otpResponse) {
          response = await fetcher.post('/api/auth/without-pass', {
            responseType: 'json',
            body: { email: data?.email },
          });

          if (!response?.error) {
            setOtpResponse({ maskedEmail: response?.maskedEmail });

            return;
          }
        }

        switch (true) {
          case !response?.error:
            router.push('/');
            router.refresh();
            break;
          case isValidUrl(response?.error ?? ''):
            router.push(response.error);
            break;
          default:
            toast({
              description: response.error,
              isError: true,
            });
        }
      } catch (error) {
        console.error({ error });
        toast({ isError: true, description: (error as Error)?.message ?? '' });
      } finally {
        setIsDisabledButtons?.(false);
      }
    };

    if (captchaToken && data) {
      handleSubmitCallback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(captchaToken), data]);

  const handleGetNewOtpCode = useCallback(async () => {
    setOtp('');
    setOtpResponse(null);
  }, []);

  const handleSubmit = useCallback(
    async (data: Data) => {
      if (!captchaToken) {
        setCaptchaVisible(true);
      }

      setData({ ...data, otp: isSignInWithPass ? '' : otp });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [otp, isSignInWithPass],
  );

  const isDisabled = isSubmitting || isDisabledButtons;

  return (
    <>
      <Form {...form}>
        <form className="space-y-4 mb-2" onSubmit={form.handleSubmit(handleSubmit)}>
          {!isSignUpFlow && Boolean(otpResponse) && !isSignInWithPass && (
            <div className="flex flex-col items-center gap-y-4 mb-8">
              <p className="text-sm">
                {t('otp.title', { count: OTP_LENGTH, maskEmail: otpResponse?.maskedEmail ?? '' })}
              </p>
              <OtpInput setToken={setOtp} disabled={isDisabled} hasSeparator />
              <Button
                disabled={isDisabled}
                onClick={handleGetNewOtpCode}
                size="sm"
                type="button"
                variant="outline"
              >
                {t('otp.getNew')}
              </Button>
            </div>
          )}
          {isSignUpFlow && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} disabled={isDisabled} placeholder={t('username')} />
                  </FormControl>
                  {errors?.name?.message && (
                    <p className="text-xs text-red-500">{t(errors.name.message.toLowerCase())}</p>
                  )}
                </FormItem>
              )}
            />
          )}
          {(isSignInWithPass || isSignUpFlow || !otpResponse) && (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} disabled={isDisabled} placeholder={t('email')} type="email" />
                  </FormControl>
                  {errors?.email?.message && (
                    <p className="text-xs text-red-500">{t(errors.email.message)}</p>
                  )}
                </FormItem>
              )}
            />
          )}
          {(isSignUpFlow || isSignInWithPass) && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        disabled={isDisabled}
                        placeholder={t('password')}
                        type={showPassword ? 'text' : 'password'}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isDisabled}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  {errors?.password?.message && (
                    <p className="text-xs text-red-500">{t(errors.password.message)}</p>
                  )}
                </FormItem>
              )}
            />
          )}
          <div className="flex flex-col justify-center items-center gap-x-2 gap-y-4">
            <Button
              className="w-full"
              disabled={
                isDisabled ||
                (!isSignInWithPass &&
                  !isSignUpFlow &&
                  Boolean(otpResponse) &&
                  otp.length !== OTP_LENGTH)
              }
              isLoading={isSubmitting}
              type="submit"
            >
              {!isSignUpFlow && (Boolean(otpResponse) || isSignInWithPass) && t('signIn')}
              {!isSignUpFlow && !otpResponse && t('continue')}
              {isSignUpFlow && t('signUp')}
            </Button>
            {!isSignUpFlow && otpResponse && (
              <Button
                disabled={isDisabled}
                onClick={() => {
                  setOtp('');
                  setIsSignInWithPass((prev) => !prev);
                }}
                size="sm"
                type="button"
                variant="ghost"
              >
                {t(isSignInWithPass ? 'signInWithoutPass' : 'signInWithPass')}
              </Button>
            )}
          </div>
        </form>
      </Form>
      <CaptchaInvisible
        callback={(token) => {
          if (token) {
            setCaptchaToken(token);
          }
        }}
        locale={locale}
        setVisible={setCaptchaVisible}
        visible={captchaVisible}
      />
    </>
  );
};
