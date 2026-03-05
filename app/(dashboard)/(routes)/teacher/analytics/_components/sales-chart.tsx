'use client';

import { BarChart2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card, CardContent } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

type ChartProps = {
  data: Record<string, number | string>[];
};

const chartConfig = {
  qty: {
    label: 'Sales',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export const SalesChart = ({ data }: ChartProps) => {
  const t = useTranslations('teacher.analytics.salesChart');
  const totalSales = data.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);

  return (
    <div className="flex flex-col gap-4 mt-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-muted-foreground" />
          <p className="font-medium text-xl">{t('title')}</p>
        </div>
        <span className="text-xs text-muted-foreground">
          {t('subtitle', { totalSales, courseCount: data.length })}
        </span>
      </div>
      <Card className="shadow-none">
        <CardContent className="pt-6">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
              {t('noData')}
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  axisLine={false}
                  dataKey="title"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(value: string) =>
                    value.length > 20 ? `${value.substring(0, 20)}…` : value
                  }
                />
                <YAxis axisLine={false} fontSize={11} tickLine={false} allowDecimals={false} />
                <ChartTooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="qty" fill="var(--color-qty)" radius={[4, 4, 0, 0]} maxBarSize={64} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
