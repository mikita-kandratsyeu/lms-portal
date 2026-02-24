import { getTranslations } from 'next-intl/server';

import { getUserPromotions } from '@/actions/stripe/get-user-promotions';

import { EmptyState } from './_components/empty-state';
import { PromotionsTabs } from './_components/promotions-tabs';

const PromotionsPage = async () => {
  const t = await getTranslations('promotions');
  const { promotions } = await getUserPromotions();

  return (
    <div className="p-4 sm:p-6 flex flex-col mb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-medium">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>
      <div className="w-full">
        {promotions.length === 0 ? <EmptyState /> : <PromotionsTabs promotions={promotions} />}
      </div>
    </div>
  );
};

export default PromotionsPage;
