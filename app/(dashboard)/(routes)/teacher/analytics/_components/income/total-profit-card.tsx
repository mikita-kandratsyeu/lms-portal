'use client';

import { useTranslations } from 'next-intl';
import CountUp from 'react-countup';

import { getAnalytics } from '@/actions/analytics/get-analytics';
import { Separator } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '@/constants/locale';
import { formatPrice, getConvertedPrice, getCurrencySymbol } from '@/lib/format';

type Analytics = Awaited<ReturnType<typeof getAnalytics>>;

type TotalProfitCardProps = Pick<Analytics, 'totalProfit'>;

export const TotalProfitCard = ({ totalProfit }: TotalProfitCardProps) => {
  const t = useTranslations('teacher.analytics.profitCard');

  if (!totalProfit) {
    return null;
  }

  const totalFees = totalProfit.feeDetails.reduce((sum, fee) => sum + fee.amount, 0);
  const netPercent =
    totalProfit.total > 0 ? Math.round((totalProfit.net / totalProfit.total) * 100) : 0;

  return (
    <Card className="shadow-none h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t('title')}</CardTitle>
        <span className="text-xs text-muted-foreground font-medium">
          {t('margin', { percent: netPercent })}
        </span>
      </CardHeader>
      <CardContent>
        <CountUp
          className="text-2xl font-bold"
          decimals={2}
          duration={2.75}
          end={getConvertedPrice(totalProfit.net)}
          prefix={`${getCurrencySymbol(DEFAULT_LOCALE, DEFAULT_CURRENCY)} `}
        />

        <div className="mt-3 mb-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${netPercent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {t('feesDeducted', { amount: formatPrice(getConvertedPrice(totalFees)) })}
        </p>

        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2 items-center justify-between text-xs text-muted-foreground">
            <span>{t('grossRevenue')}</span>
            <span>{formatPrice(getConvertedPrice(totalProfit.total))}</span>
          </div>
          {totalProfit.feeDetails.map((fee) => (
            <div
              key={fee.name}
              className="flex gap-2 items-center justify-between text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive/60" />
                {fee.name}
              </span>
              <span className="text-destructive/80">
                &minus;&nbsp;{formatPrice(getConvertedPrice(fee.amount))}
              </span>
            </div>
          ))}
        </div>

        <Separator className="my-3" />

        <div className="flex gap-2 items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground">{t('availableForPayout')}</span>
          <CountUp
            className="font-semibold text-green-600 dark:text-green-400"
            decimals={2}
            duration={2.75}
            end={getConvertedPrice(totalProfit.availableForPayout)}
            prefix={`${getCurrencySymbol(DEFAULT_LOCALE, DEFAULT_CURRENCY)} `}
          />
        </div>
      </CardContent>
    </Card>
  );
};
