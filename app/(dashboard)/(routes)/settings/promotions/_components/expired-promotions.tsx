'use client';

import { TagIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { PromotionCard } from './promotion-card';
import { Promotion } from './types';

type ExpiredPromotionsProps = {
  promotions: Promotion[];
};

export const ExpiredPromotions = ({ promotions }: ExpiredPromotionsProps) => {
  const t = useTranslations('promotions');

  if (promotions.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-medium mb-4 flex items-center gap-2 text-muted-foreground">
        <TagIcon className="h-5 w-5" />
        {t('expiredSection')}
      </h2>
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {promotions.map((promo) => (
          <PromotionCard key={promo.id} promo={promo} />
        ))}
      </div>
    </div>
  );
};
