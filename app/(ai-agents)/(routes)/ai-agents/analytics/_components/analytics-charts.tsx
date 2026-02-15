'use client';

import { useTranslations } from 'next-intl';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

import type { ModelUsage, WeeklyUsage } from './types';

type AnalyticsChartsProps = {
  showGlobal: boolean;
  showPersonal: boolean;
  weeklyUsage: WeeklyUsage[];
  globalModelUsage: ModelUsage[];
  hasWeeklyUsage: boolean;
  hasGlobalUsage: boolean;
};

export const AnalyticsCharts = ({
  showGlobal,
  showPersonal,
  weeklyUsage,
  globalModelUsage,
  hasWeeklyUsage,
  hasGlobalUsage,
}: AnalyticsChartsProps) => {
  const t = useTranslations('ai-agents.analytics');
  const emptyLabel = t('emptyData');

  const usageTrendConfig = {
    global: { label: t('labels.global'), color: 'hsl(var(--primary))' },
    personal: { label: t('labels.personal'), color: 'hsl(var(--muted-foreground))' },
  } satisfies ChartConfig;

  const globalModelConfig = {
    uses: {
      label: t('labels.uses'),
      theme: {
        light: 'hsl(var(--muted-foreground))',
        dark: 'hsl(var(--muted-foreground))',
      },
    },
  } satisfies ChartConfig;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {(showGlobal || showPersonal) && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>{t('usageTrend.title')}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {showGlobal && showPersonal
                ? t('usageTrend.globalVsPersonal')
                : showGlobal
                  ? t('usageTrend.globalOnly')
                  : t('usageTrend.personalOnly')}
            </p>
          </CardHeader>
          <CardContent>
            {hasWeeklyUsage ? (
              <ChartContainer config={usageTrendConfig} className="h-[280px] w-full">
                <LineChart data={weeklyUsage} margin={{ left: 8, right: 8, top: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  {showGlobal && (
                    <Line
                      type="monotone"
                      dataKey="global"
                      stroke="var(--color-global)"
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
                  {showPersonal && (
                    <Line
                      type="monotone"
                      dataKey="personal"
                      stroke="var(--color-personal)"
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      dot={false}
                    />
                  )}
                  <ChartTooltip content={<ChartTooltipContent />} />
                </LineChart>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground">{emptyLabel}</p>
            )}
          </CardContent>
        </Card>
      )}
      {showGlobal && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>{t('popularModels.title')}</CardTitle>
            <p className="text-xs text-muted-foreground">{t('cards.publicOnly')}</p>
          </CardHeader>
          <CardContent>
            {hasGlobalUsage ? (
              <ChartContainer config={globalModelConfig} className="h-[280px] w-full">
                <BarChart
                  data={globalModelUsage}
                  layout="vertical"
                  margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="model"
                    width={160}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) =>
                      typeof value === 'string' && value.length > 22
                        ? `${value.slice(0, 20)}…`
                        : value
                    }
                  />
                  <Bar dataKey="uses" fill="var(--color-uses)" radius={[0, 6, 6, 0]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground">{emptyLabel}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
