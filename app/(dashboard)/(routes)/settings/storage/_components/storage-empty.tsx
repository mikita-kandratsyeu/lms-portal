'use client';

import { HardDrive } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const StorageEmpty = () => {
  const t = useTranslations('settings.storage');

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 rounded-lg border border-dashed">
      <HardDrive className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-center text-muted-foreground">{t('empty')}</p>
    </div>
  );
};
