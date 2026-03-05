'use client';

import { format, parseISO } from 'date-fns';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { getAnalytics } from '@/actions/analytics/get-analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '@/constants/locale';
import { formatPrice, getConvertedPrice, getCurrencySymbol } from '@/lib/format';
import { isNumber } from '@/lib/guard';
import { cn } from '@/lib/utils';

const COMPARISON_OFFSETS = [1, 2, 3] as const;

type Analytics = Awaited<ReturnType<typeof getAnalytics>>;

type TotalRevenueCardProps = Pick<Analytics, 'totalRevenue' | 'totalRevenueData'>;

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--primary))',
  },
  average: {
    label: 'Avg / sale',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export const TotalRevenueCard = ({ totalRevenue, totalRevenueData }: TotalRevenueCardProps) => {
  const t = useTranslations('teacher.analytics.revenueCard');
  const [comparisonOffset, setComparisonOffset] = useState<number>(1);

  useEffect(() => {
    if (totalRevenueData.length > 0 && comparisonOffset >= totalRevenueData.length) {
      setComparisonOffset(1);
    }
  }, [totalRevenueData.length, comparisonOffset]);

  if (!isNumber(totalRevenue)) {
    return null;
  }

  const hasMonthlyData = totalRevenueData.length > 0;
  const latestIndex = totalRevenueData.length - 1;
  const comparisonIndex = latestIndex - comparisonOffset;

  const currentRevenue = totalRevenueData[latestIndex]?.revenue;
  const comparisonRevenue = comparisonIndex >= 0 ? totalRevenueData[comparisonIndex]?.revenue : 0;

  const canCompare = comparisonRevenue > 0 && isNumber(currentRevenue);
  const diff = canCompare
    ? parseFloat((((currentRevenue - comparisonRevenue) / comparisonRevenue) * 100).toFixed(2))
    : null;
  const times = canCompare ? currentRevenue / comparisonRevenue : null;

  const isPositive = isNumber(diff) && diff >= 0;

  const chartData = totalRevenueData.map((d) => ({
    ...d,
    monthLabel: d.month
      ? format(parseISO(`${d.month}-01`), totalRevenueData.length > 6 ? 'MMM yy' : 'MMM yyyy')
      : '',
    revenueConverted: getConvertedPrice(d.revenue),
    averageConverted: getConvertedPrice(d.average),
  }));

  const comparisonLabel =
    comparisonOffset === 1 ? t('vsPrevMonth') : t('vsMonthsAgo', { count: comparisonOffset });

  return (
    <Card className="shadow-none h-full">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t('title')}</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          {hasMonthlyData && totalRevenueData.length > 1 && (
            <Select
              value={String(comparisonOffset)}
              onValueChange={(v) => setComparisonOffset(Number(v) as 1 | 2 | 3)}
            >
              <SelectTrigger className="h-8 w-auto min-w-[140px] text-xs">
                <SelectValue placeholder={t('compareTo')} />
              </SelectTrigger>
              <SelectContent>
                {COMPARISON_OFFSETS.filter((off) => totalRevenueData.length > off).map((off) => (
                  <SelectItem key={off} value={String(off)} className="text-xs">
                    {off === 1 ? t('options.prevMonth') : t('options.monthsAgo', { count: off })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {canCompare && (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
                  isPositive
                    ? 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400'
                    : 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {isPositive ? '+' : ''}
                {diff}%
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {t('times', { value: times! < 1 ? times!.toFixed(2) : times!.toFixed(1) })}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <CountUp
          className="text-2xl font-bold"
          decimals={2}
          duration={2.75}
          end={getConvertedPrice(totalRevenue)}
          prefix={`${getCurrencySymbol(DEFAULT_LOCALE, DEFAULT_CURRENCY)} `}
        />
        {canCompare && (
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">{comparisonLabel}</p>
        )}

        {hasMonthlyData ? (
          <ChartContainer config={chartConfig} className="h-[140px] w-full">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="monthLabel"
                axisLine={false}
                tickLine={false}
                fontSize={10}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                fontSize={10}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(v: number) =>
                  `${getCurrencySymbol(DEFAULT_LOCALE, DEFAULT_CURRENCY)}${v}`
                }
                width={40}
              />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div className="rounded-lg border bg-background px-3 py-2 shadow-sm text-xs">
                      <p className="font-semibold mb-1">{label}</p>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{t('tooltip.revenue')}</span>
                        <span className="font-medium">
                          {formatPrice(d.revenueConverted, {
                            locale: DEFAULT_LOCALE,
                            currency: DEFAULT_CURRENCY,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{t('tooltip.avgSale')}</span>
                        <span className="font-medium">
                          {formatPrice(d.averageConverted, {
                            locale: DEFAULT_LOCALE,
                            currency: DEFAULT_CURRENCY,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{t('tooltip.transactions')}</span>
                        <span className="font-medium">{d.transactionCount}</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="revenueConverted"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[140px] text-xs text-muted-foreground">
            {t('noData')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
