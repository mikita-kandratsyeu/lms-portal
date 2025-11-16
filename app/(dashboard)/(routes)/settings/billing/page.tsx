import { getTranslations } from 'next-intl/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { getUserBilling } from '@/actions/stripe/get-user-billing';
import { getUserSubscription } from '@/actions/stripe/get-user-subscription';
import { isBusinessOwner } from '@/lib/owner';

import { ActivePlan } from './_components/active-plan';
import { BillingHistory } from './_components/billing-history';

const BillingPage = async () => {
  const t = await getTranslations('settings.billing');

  const user = await getCurrentUser();
  const userBilling = await getUserBilling(user?.userId);
  const userSubscription = await getUserSubscription(user?.userId, true);

  return (
    <div className="p-6 flex flex-col">
      <h1 className="text-2xl font-medium">{t('title')}</h1>
      <div className="mt-12">
        {!isBusinessOwner(user?.userId) && <ActivePlan userSubscription={userSubscription} />}
        <BillingHistory userBilling={userBilling} />
      </div>
    </div>
  );
};

export default BillingPage;
