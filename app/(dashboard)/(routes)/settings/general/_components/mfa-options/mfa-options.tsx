'use client';

import { User, UserSettings } from '@prisma/client';
import { useTranslations } from 'next-intl';

import { OtpForm } from './otp-form';

type MfaOptionsProps = {
  initialData: User & { settings: UserSettings | null };
};

export const MfaOptions = ({ initialData }: MfaOptionsProps) => {
  const t = useTranslations('settings');

  return (
    <div className="flex flex-col gap-4 mt-8">
      <p className="font-medium text-xl">{t('mfaOptions')}</p>
      <OtpForm initialData={initialData} />
    </div>
  );
};
