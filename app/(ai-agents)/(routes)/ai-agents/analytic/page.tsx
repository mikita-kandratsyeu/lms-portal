'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ModelUsage = {
  model: string;
  uses: number;
};

type WeeklyUsage = {
  week: string;
  global: number;
  personal: number;
};

const periodOptionIds = ['all', '7d', '30d', '90d'] as const;

type PeriodId = (typeof periodOptionIds)[number];

const scopeOptionIds = ['all', 'global', 'personal'] as const;

type ScopeId = (typeof scopeOptionIds)[number];

const analyticsByPeriod: Record<
  PeriodId,
  {
    globalModelUsage: ModelUsage[];
    personalModelUsage: ModelUsage[];
    weeklyUsage: WeeklyUsage[];
    globalUsers: number;
    personalUsers: number;
  }
> = {
  all: {
    globalModelUsage: [
      { model: 'GPT-4o', uses: 118400 },
      { model: 'Claude 3.5 Sonnet', uses: 96500 },
      { model: 'Gemini 1.5 Pro', uses: 78400 },
      { model: 'DeepSeek R1', uses: 60200 },
      { model: 'Llama 3.1 70B', uses: 44800 },
    ],
    personalModelUsage: [
      { model: 'GPT-4o', uses: 12400 },
      { model: 'Claude 3.5 Sonnet', uses: 10350 },
      { model: 'Gemini 1.5 Pro', uses: 7810 },
      { model: 'Llama 3.1 70B', uses: 4620 },
      { model: 'DeepSeek R1', uses: 3390 },
    ],
    weeklyUsage: [
      { week: 'W1', global: 15200, personal: 1880 },
      { week: 'W2', global: 16800, personal: 2060 },
      { week: 'W3', global: 18200, personal: 2230 },
      { week: 'W4', global: 19500, personal: 2400 },
      { week: 'W5', global: 20900, personal: 2590 },
      { week: 'W6', global: 22400, personal: 2760 },
    ],
    globalUsers: 16450,
    personalUsers: 1210,
  },
  '7d': {
    globalModelUsage: [
      { model: 'GPT-4o', uses: 2850 },
      { model: 'Claude 3.5 Sonnet', uses: 2430 },
      { model: 'Gemini 1.5 Pro', uses: 1900 },
      { model: 'DeepSeek R1', uses: 1600 },
      { model: 'Llama 3.1 70B', uses: 1120 },
    ],
    personalModelUsage: [
      { model: 'GPT-4o', uses: 410 },
      { model: 'Claude 3.5 Sonnet', uses: 360 },
      { model: 'Gemini 1.5 Pro', uses: 240 },
      { model: 'Llama 3.1 70B', uses: 190 },
      { model: 'DeepSeek R1', uses: 160 },
    ],
    weeklyUsage: [
      { week: 'W1', global: 1200, personal: 140 },
      { week: 'W2', global: 1350, personal: 170 },
      { week: 'W3', global: 1480, personal: 190 },
      { week: 'W4', global: 1650, personal: 220 },
      { week: 'W5', global: 1780, personal: 240 },
      { week: 'W6', global: 1950, personal: 260 },
    ],
    globalUsers: 520,
    personalUsers: 38,
  },
  '30d': {
    globalModelUsage: [
      { model: 'GPT-4o', uses: 12450 },
      { model: 'Claude 3.5 Sonnet', uses: 10320 },
      { model: 'Gemini 1.5 Pro', uses: 8420 },
      { model: 'DeepSeek R1', uses: 6240 },
      { model: 'Llama 3.1 70B', uses: 4180 },
    ],
    personalModelUsage: [
      { model: 'GPT-4o', uses: 1680 },
      { model: 'Claude 3.5 Sonnet', uses: 1420 },
      { model: 'Gemini 1.5 Pro', uses: 980 },
      { model: 'Llama 3.1 70B', uses: 620 },
      { model: 'DeepSeek R1', uses: 540 },
    ],
    weeklyUsage: [
      { week: 'W1', global: 4200, personal: 520 },
      { week: 'W2', global: 5100, personal: 680 },
      { week: 'W3', global: 6000, personal: 720 },
      { week: 'W4', global: 7100, personal: 860 },
      { week: 'W5', global: 8200, personal: 920 },
      { week: 'W6', global: 9400, personal: 1100 },
    ],
    globalUsers: 1840,
    personalUsers: 128,
  },
  '90d': {
    globalModelUsage: [
      { model: 'GPT-4o', uses: 29800 },
      { model: 'Claude 3.5 Sonnet', uses: 25500 },
      { model: 'Gemini 1.5 Pro', uses: 20600 },
      { model: 'DeepSeek R1', uses: 15800 },
      { model: 'Llama 3.1 70B', uses: 11100 },
    ],
    personalModelUsage: [
      { model: 'GPT-4o', uses: 3820 },
      { model: 'Claude 3.5 Sonnet', uses: 3180 },
      { model: 'Gemini 1.5 Pro', uses: 2350 },
      { model: 'Llama 3.1 70B', uses: 1320 },
      { model: 'DeepSeek R1', uses: 980 },
    ],
    weeklyUsage: [
      { week: 'W1', global: 8200, personal: 980 },
      { week: 'W2', global: 9100, personal: 1100 },
      { week: 'W3', global: 10200, personal: 1240 },
      { week: 'W4', global: 11200, personal: 1320 },
      { week: 'W5', global: 12600, personal: 1480 },
      { week: 'W6', global: 13900, personal: 1620 },
    ],
    globalUsers: 5020,
    personalUsers: 276,
  },
};

const getTopModel = (models: ModelUsage[]) =>
  models.reduce((top, current) => (current.uses > top.uses ? current : top), models[0]);

const sumUses = (models: ModelUsage[]) => models.reduce((total, model) => total + model.uses, 0);

const personalPieColors = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444'];

const AnalyticPage = () => {
  const t = useTranslations('ai-agents.analytics');
  const [period, setPeriod] = useState<PeriodId>('30d');
  const [scope, setScope] = useState<ScopeId>('all');

  const periodOptions = periodOptionIds.map((id) => ({
    id,
    label: t(`periods.${id}`),
  }));
  const scopeOptions = scopeOptionIds.map((id) => ({
    id,
    label: t(`scopes.${id}`),
  }));

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

  const personalAgents = [
    { name: t('personalAgents.tutor'), users: 64 },
    { name: t('personalAgents.reviewer'), users: 41 },
    { name: t('personalAgents.marketing'), users: 27 },
    { name: t('personalAgents.coach'), users: 18 },
  ];

  const { globalModelUsage, personalModelUsage, weeklyUsage, globalUsers, personalUsers } =
    analyticsByPeriod[period];
  const globalTop = getTopModel(globalModelUsage);
  const personalTop = getTopModel(personalModelUsage);
  const showGlobal = scope === 'all' || scope === 'global';
  const showPersonal = scope === 'all' || scope === 'personal';

  return (
    <div className="w-full space-y-6 p-4 sm:space-y-8 sm:p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Tabs value={scope} onValueChange={(value) => setScope(value as ScopeId)}>
              <TabsList className="grid h-auto w-full grid-cols-3 gap-1 sm:h-9 sm:inline-flex sm:w-auto sm:gap-0">
                {scopeOptions.map((option) => (
                  <TabsTrigger key={option.id} value={option.id} className="w-full">
                    {option.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Tabs value={period} onValueChange={(value) => setPeriod(value as PeriodId)}>
              <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:h-9 sm:inline-flex sm:w-auto sm:grid-cols-none sm:gap-0">
                {periodOptions.map((option) => (
                  <TabsTrigger key={option.id} value={option.id} className="w-full">
                    {option.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {showGlobal && (
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{t('cards.globalUses')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {sumUses(globalModelUsage).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">{t('cards.publicOnly')}</p>
            </CardContent>
          </Card>
        )}
        {showGlobal && (
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{t('cards.activeUsers')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{globalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{t('cards.last30Days')}</p>
            </CardContent>
          </Card>
        )}
        {showPersonal && (
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {t('cards.myAgentsUsers')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{personalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{t('cards.includingPrivate')}</p>
            </CardContent>
          </Card>
        )}
        {showGlobal && (
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {t('cards.topModelGlobal')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{globalTop.model}</div>
              <p className="text-xs text-muted-foreground">
                {t('cards.totalUses', { amount: globalTop.uses.toLocaleString() })}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
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
              <ChartContainer config={globalModelConfig} className="h-[280px] w-full">
                <BarChart data={globalModelUsage} margin={{ left: 8, right: 8, top: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="model"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Bar dataKey="uses" fill="var(--color-uses)" radius={[6, 6, 0, 0]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
      {showPersonal && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>{t('myAgentUsers.title')}</CardTitle>
              <p className="text-xs text-muted-foreground">{t('myAgentUsers.subtitle')}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {personalAgents.map((agent) => (
                <div key={agent.name} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('myAgentUsers.activeUsers', { count: agent.users })}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((agent.users / personalUsers) * 100)}%
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>{t('popularModelPersonal.title')}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {t('popularModelPersonal.uses', { amount: personalTop.uses.toLocaleString() })}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-lg font-semibold">{personalTop.model}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('popularModelPersonal.subtitle')}
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={personalModelUsage} dataKey="uses" nameKey="model" innerRadius={50}>
                    {personalModelUsage.map((entry, index) => (
                      <Cell
                        key={entry.model}
                        fill={personalPieColors[index % personalPieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AnalyticPage;
