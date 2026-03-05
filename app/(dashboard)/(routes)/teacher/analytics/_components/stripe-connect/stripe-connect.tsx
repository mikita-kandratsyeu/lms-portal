'use client';

import { useTranslations } from 'next-intl';

import { getAnalytics } from '@/actions/analytics/get-analytics';
import { Card, CardContent } from '@/components/ui';

import { Actions } from './actions';
import { BalanceTransactions } from './balance-transactions';

type Analytics = Awaited<ReturnType<typeof getAnalytics>>;

type StripeConnectProps = {
  hasActivePayouts?: boolean;
  stripeConnect: Analytics['stripeConnect'];
  stripeConnectPayout: Analytics['stripeConnectPayouts'];
  totalProfit: Analytics['totalProfit'];
};

export const StripeConnect = ({
  hasActivePayouts,
  stripeConnect,
  stripeConnectPayout,
  totalProfit,
}: StripeConnectProps) => {
  const t = useTranslations('teacher.analytics.stripeConnect');

  const autoPaymentSchedule = {
    interval: stripeConnect?.payouts?.schedule.interval,
    weeklyAnchor: stripeConnect?.payouts?.schedule.weekly_anchor,
  };

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-col gap-1">
        <p className="font-medium text-xl">{t('title')}</p>
        <p className="text-xs text-muted-foreground">
          {t.rich('subtitle', {
            stripeConnect: (chunks) => (
              <span className="text-blue-500 font-semibold">{chunks}</span>
            ),
          })}{' '}
          {autoPaymentSchedule.weeklyAnchor && autoPaymentSchedule.interval && (
            <span>
              {t('autoPayments', {
                interval: autoPaymentSchedule.interval,
                day: t(`days.${autoPaymentSchedule.weeklyAnchor}`),
              })}
            </span>
          )}
        </p>
      </div>
      <Card className="shadow-none">
        <CardContent>
          <Actions
            stripeConnect={stripeConnect}
            totalProfit={totalProfit}
            disableRequest={hasActivePayouts}
          />
          {stripeConnect && stripeConnect.isActive && Boolean(stripeConnectPayout.length) && (
            <BalanceTransactions stripeConnectPayout={stripeConnectPayout} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
