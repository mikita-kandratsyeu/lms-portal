import { getUserPromotions } from '@/actions/stripe/get-user-promotions';

import { EmptyState } from './_components/empty-state';
import { PromotionsClient } from './_components/promotions-client';

const PromotionsPage = async () => {
  const { promotions } = await getUserPromotions();

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

      {promotions.length === 0 ? (
        <EmptyState />
      ) : (
        <PromotionsClient
          activePromotions={activePromotions}
          inactivePromotions={inactivePromotions}
        />
      )}
    </div>
  );
};

export default PromotionsPage;
