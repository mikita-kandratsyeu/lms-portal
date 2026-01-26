'use client';

import { useState } from 'react';

import { EmptyState } from './_components/empty-state';
import { ExpiredPromotions } from './_components/expired-promotions';
import { PromotionsTabs } from './_components/promotions-tabs';

// Mock data - промокоды для пользователя
const MOCK_PROMOTIONS = [
  {
    id: '1',
    code: 'WELCOME2026',
    description: '20% off forever',
    restrictions: 'Only for first purchase.',
    active: true,
    isPersonal: false,
    maxRedemptions: 100,
    timesRedeemed: 45,
    applied: false,
  },
  {
    id: '2',
    code: 'USER_JOHN_DOE',
    description: '50% off for 3 months',
    restrictions: 'Min amount is $10.00.',
    active: true,
    isPersonal: true,
    maxRedemptions: 1,
    timesRedeemed: 0,
    applied: false,
  },
  {
    id: '3',
    code: 'STUDENT2026',
    description: '30% off for 6 months',
    restrictions: 'Only for first purchase. Min amount is $5.00.',
    active: true,
    isPersonal: false,
    maxRedemptions: 500,
    timesRedeemed: 234,
    applied: false,
  },
  {
    id: '4',
    code: 'VIP_PERSONAL',
    description: '$25.00',
    restrictions: '',
    active: true,
    isPersonal: true,
    maxRedemptions: 1,
    timesRedeemed: 0,
    applied: false,
  },
  {
    id: '5',
    code: 'EXPIRED2025',
    description: '40% off forever',
    restrictions: 'Only for first purchase.',
    active: false,
    isPersonal: false,
    maxRedemptions: 200,
    timesRedeemed: 200,
    applied: false,
  },
  {
    id: '6',
    code: 'EARLYBIRD',
    description: '15% off for 12 months',
    restrictions: '',
    active: true,
    isPersonal: false,
    maxRedemptions: 1000,
    timesRedeemed: 567,
    applied: false,
  },
];

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState(MOCK_PROMOTIONS);

  const handleApplyPromotion = (promoId: string) => {
    setPromotions(
      promotions.map(
        (promo) =>
          promo.id === promoId ? { ...promo, applied: true } : { ...promo, applied: false }, // Отменяем все остальные промокоды
      ),
    );
    // TODO: Здесь будет вызов API для применения промокода
  };

  const activePromotions = promotions.filter((promo) => promo.active);
  const inactivePromotions = promotions.filter((promo) => !promo.active);

  return (
    <div className="p-6 flex flex-col mb-6">
      <div className="mb-8">
        <h1 className="text-2xl font-medium">Promotions</h1>
        <p className="text-muted-foreground mt-2">
          View and apply available promotion codes to your account
        </p>
      </div>

      <PromotionsTabs promotions={activePromotions} onApply={handleApplyPromotion} />

      <ExpiredPromotions promotions={inactivePromotions} onApply={handleApplyPromotion} />

      {promotions.length === 0 && <EmptyState />}
    </div>
  );
};

export default PromotionsPage;
