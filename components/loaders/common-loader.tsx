'use client';

import { useTranslations } from 'next-intl';

import { Spinner } from '../ui/spinner';

export const CommonLoader = () => {
  const t = useTranslations('app');

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Spinner className="h-4 w-4 animate-spin text-secondary-foreground mr-2" />
      <p className="text-sm">{t('loading')}</p>
    </div>
  );
};
