import { getTranslations } from 'next-intl/server';

import { getAnalytics } from '@/actions/analytics/get-analytics';
import { getCurrentUser } from '@/actions/auth/get-current-user';
import { Banner } from '@/components/common/banner';
import { ErrorModal } from '@/components/modals/error-modal';
import { DEFAULT_LOCALE } from '@/constants/locale';
import { formatPrice, getConvertedPrice } from '@/lib/format';

import { ClientTransactions } from './_components/client-transactions/client-transactions';
import { Income } from './_components/income/income';
import { SalesChart } from './_components/sales-chart';
import { StripeConnect } from './_components/stripe-connect/stripe-connect';

const AnalyticsPage = async () => {
  const [user, t] = await Promise.all([getCurrentUser(), getTranslations('teacher.analytics')]);

  const {
    activePayouts,
    chart,
    isError,
    map: mapData,
    stripeConnect,
    stripeConnectPayouts,
    totalProfit,
    totalRevenue,
    totalRevenueData,
    transactions,
  } = await getAnalytics(user!.userId);

  const hasActivePayouts = Boolean(activePayouts?.length);

  return (
    <>
      {isError && <ErrorModal />}
      {hasActivePayouts && (
        <Banner
          label={t('page.banner.pendingPayout', {
            amount: formatPrice(getConvertedPrice(activePayouts[0].amount), {
              locale: DEFAULT_LOCALE,
              currency: activePayouts[0].currency,
            }),
          })}
          variant="warning"
        />
      )}
      <div className="p-6">
        <div className="mb-10">
          <h1 className="text-2xl font-medium">{t('page.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('page.subtitle')}</p>
        </div>
        <StripeConnect
          hasActivePayouts={hasActivePayouts}
          stripeConnect={stripeConnect}
          stripeConnectPayout={stripeConnectPayouts}
          totalProfit={totalProfit}
        />
        <Income
          mapData={mapData}
          totalProfit={totalProfit}
          totalRevenue={totalRevenue}
          totalRevenueData={totalRevenueData}
        />
        <SalesChart data={chart} />
        <ClientTransactions transactions={transactions} />
      </div>
    </>
  );
};

export default AnalyticsPage;
