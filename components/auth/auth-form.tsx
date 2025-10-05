'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useAppConfigStore } from '@/hooks/store/use-app-config-store';
import { useHydration } from '@/hooks/use-hydration';

import { AuthFormSkeleton } from '../loaders/auth-form-skeleton';
import { CredentialsFrom } from './credentials-form';
import { OAuthButtons } from './oauth-buttons';
import { TermsAndPrivacy } from './terms-and-privacy';

type AuthFormProps = {
  callbackUrl?: string;
};

export const AuthForm = ({ callbackUrl }: AuthFormProps) => {
  const t = useTranslations('auth-form');
  const appName = useTranslations('app')('name');

  const { isMounted } = useHydration();

  const pathname = usePathname();

  const { config } = useAppConfigStore((state) => ({ config: state.config }));
  const { allowNewUsers = false, providers = {} } = config?.auth ?? {};

  const [isDisabledButtons, setIsDisabledButtons] = useState(false);
  const [isSignUpFlow, setIsSignUpFlow] = useState(false);

  if (!isMounted) {
    return <AuthFormSkeleton />;
  }

  return (
    <>
      <div>
        <div className="text-lg font-[600]">{t(`${isSignUpFlow ? 'signUp' : 'signIn'}`)}</div>
        <div className="text-base text-muted-foreground">{t('toContinue', { appName })}</div>
      </div>
      <CredentialsFrom
        callbackUrl={callbackUrl}
        isDisabledButtons={isDisabledButtons}
        isSignUpFlow={isSignUpFlow}
        setIsDisabledButtons={setIsDisabledButtons}
      />
      <OAuthButtons
        isDisabledButtons={isDisabledButtons}
        providers={providers}
        setIsDisabledButtons={setIsDisabledButtons}
      />
      {allowNewUsers && (
        <p className="text-sm text-muted-foreground text-center mt-4">
          {t(`${isSignUpFlow ? 'alreadyHaveAnAccount' : 'doNotHaveAnAccount'}`)}{' '}
          <Link
            className="text-primary hover:underline"
            href={pathname}
            onClick={() => setIsSignUpFlow((prev) => !prev)}
          >
            {t(`${isSignUpFlow ? 'signIn' : 'signUp'}`)}
          </Link>
        </p>
      )}
      {allowNewUsers && <TermsAndPrivacy />}
    </>
  );
};
