'use client';

import { TagIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const EmptyState = () => {
  const t = useTranslations('promotions');

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <TagIcon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">{t('notFound')}</h3>
    </div>
  );
};
