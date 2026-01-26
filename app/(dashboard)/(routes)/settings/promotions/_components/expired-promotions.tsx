import { TagIcon } from 'lucide-react';

import { PromotionCard } from './promotion-card';
import { Promotion } from './types';

type ExpiredPromotionsProps = {
  promotions: Promotion[];
  onApply: (id: string) => void;
};

export const ExpiredPromotions = ({ promotions, onApply }: ExpiredPromotionsProps) => {
  if (promotions.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-medium mb-4 flex items-center gap-2 text-muted-foreground">
        <TagIcon className="h-5 w-5" />
        Expired or Unavailable
      </h2>
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {promotions.map((promo) => (
          <PromotionCard key={promo.id} promo={promo} onApply={onApply} isExpired />
        ))}
      </div>
    </div>
  );
};
