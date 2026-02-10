'use client';

import CountUp from 'react-countup';

import { getAnalytics } from '@/actions/analytics/get-analytics';
import { Separator } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '@/constants/locale';
import { formatPrice, getConvertedPrice, getCurrencySymbol } from '@/lib/format';

type Analytics = Awaited<ReturnType<typeof getAnalytics>>;

type TotalProfitCardProps = Pick<Analytics, 'totalProfit'>;

export const TotalProfitCard = ({ totalProfit }: TotalProfitCardProps) => {
  if (!totalProfit) {
    return null;
  }

  return (
    <Card className="shadow-none h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <div className="text-xs font-normal text-muted-foreground">
              <div className="flex gap-2 items-center justify-between">
                <span>Total Revenue</span>
                <span>{formatPrice(getConvertedPrice(totalProfit.total))}</span>
              </div>
              {totalProfit.feeDetails.map((fee) => (
                <div key={fee.name} className="flex gap-2 items-center justify-between ">
                  <span>{fee.name}</span>
                  <span>&#8722;&nbsp;{formatPrice(getConvertedPrice(fee.amount))}</span>
                </div>
              ))}
            </div>
            <Separator className="my-2" />
            <div className="flex gap-2 items-center justify-between text-sm">
              <span className="font-medium">Total</span>
              <CountUp
                className="font-semibold"
                decimals={2}
                duration={2.75}
                end={getConvertedPrice(totalProfit.net)}
                prefix={`${getCurrencySymbol(DEFAULT_LOCALE, DEFAULT_CURRENCY)} `}
              />
            </div>
            <Separator className="my-2" />
            <div className="flex gap-2 items-center justify-between text-sm">
              <span className="font-medium">Available for payout</span>
              <CountUp
                className="font-semibold"
                decimals={2}
                duration={2.75}
                end={getConvertedPrice(totalProfit.availableForPayout)}
                prefix={`${getCurrencySymbol(DEFAULT_LOCALE, DEFAULT_CURRENCY)} `}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
