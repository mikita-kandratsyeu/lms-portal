import { TagIcon } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { PromotionCard } from './promotion-card';
import { Promotion } from './types';

type PromotionsTabsProps = {
  promotions: Promotion[];
};

export const PromotionsTabs = ({ promotions }: PromotionsTabsProps) => {
  const renderPromotionCards = (promos: Promotion[]) => (
    <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {promos.map((promo) => (
        <PromotionCard key={promo.id} promo={promo} />
      ))}
    </div>
  );

  if (promotions.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
        <TagIcon className="h-5 w-5" />
        Available Promotions
      </h2>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
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
