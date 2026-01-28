import { getTranslations } from 'next-intl/server';

import { getUserPromotions } from '@/actions/stripe/get-user-promotions';

import { EmptyState } from './_components/empty-state';
import { PromotionsTabs } from './_components/promotions-tabs';

const PromotionsPage = async () => {
  const t = await getTranslations('promotions');
  const { promotions } = await getUserPromotions();

  return (
    <div className="p-6 flex flex-col mb-6">
      <div className="mb-8">
        <h1 className="text-2xl font-medium">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>

      {promotions.length === 0 ? <EmptyState /> : <PromotionsTabs promotions={promotions} />}
    </div>
  );
};

export default PromotionsPage;
