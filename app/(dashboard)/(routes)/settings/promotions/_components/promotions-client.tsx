'use client';

import { useState } from 'react';

import { ExpiredPromotions } from './expired-promotions';
import { PromotionsTabs } from './promotions-tabs';
import { Promotion } from './types';

type PromotionsClientProps = {
  activePromotions: Promotion[];
  inactivePromotions: Promotion[];
};

export const PromotionsClient = ({
  activePromotions: initialActive,
  inactivePromotions,
}: PromotionsClientProps) => {
  const [activePromotions, setActivePromotions] = useState(initialActive);

  const handleApplyPromotion = (promoId: string) => {
    setActivePromotions(
      activePromotions.map((promo) =>
        promo.id === promoId ? { ...promo, applied: true } : { ...promo, applied: false },
      ),
    );
    // TODO: Здесь будет вызов API для применения промокода
  };

  return (
    <>
      <PromotionsTabs promotions={activePromotions} onApply={handleApplyPromotion} />
      <ExpiredPromotions promotions={inactivePromotions} onApply={handleApplyPromotion} />
    </>
  );
};
