'use client';

import { TagIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { PromotionCard } from './promotion-card';
import { Promotion } from './types';

type PromotionsTabsProps = {
  promotions: Promotion[];
};

export const PromotionsTabs = ({ promotions }: PromotionsTabsProps) => {
  const t = useTranslations('promotions.tabs');

  const renderPromotionCards = (promos: Promotion[]) => {
    if (promos.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 rounded-lg border border-dashed">
          <TagIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground">{t('empty')}</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {promos.map((promo) => (
          <PromotionCard key={promo.id} promo={promo} />
        ))}
      </div>
    );
  };

  if (promotions.length === 0) return null;

  return (
    <div className="mb-8">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">{t('all')}</TabsTrigger>
          <TabsTrigger value="general">{t('general')}</TabsTrigger>
          <TabsTrigger value="personal">{t('personal')}</TabsTrigger>
        </TabsList>
        <TabsContent value="all">{renderPromotionCards(promotions)}</TabsContent>
        <TabsContent value="general">
          {renderPromotionCards(promotions.filter((p) => !p.isPersonal))}
        </TabsContent>
        <TabsContent value="personal">
          {renderPromotionCards(promotions.filter((p) => p.isPersonal))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
