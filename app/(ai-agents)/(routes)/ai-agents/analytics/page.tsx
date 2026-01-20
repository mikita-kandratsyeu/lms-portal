'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Period, Scope } from '@/constants/ai/analytics';

import { AnalyticsCharts } from './_components/analytics-charts';
import { AnalyticsHeader } from './_components/analytics-header';
import { AnalyticsPersonal } from './_components/analytics-personal';
import { AnalyticsSummary } from './_components/analytics-summary';
import type { ModelUsage, PersonalAgent, WeeklyUsage } from './_components/types';

const periodOptionIds = Object.values(Period);
const scopeOptionIds = Object.values(Scope);

type PeriodId = (typeof periodOptionIds)[number];
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

const AnalyticPage = () => {
  const t = useTranslations('ai-agents.analytics');

  const [period, setPeriod] = useState<PeriodId>(Period['30D']);
  const [scope, setScope] = useState<ScopeId>(Scope.ALL);

  const periodOptions = periodOptionIds.map((id) => ({
    id,
    label: t(`periods.${id}`),
  }));
  const scopeOptions = scopeOptionIds.map((id) => ({
    id,
    label: t(`scopes.${id}`),
  }));

  const personalAgents: PersonalAgent[] = [
    { name: t('personalAgents.tutor'), users: 64 },
    { name: t('personalAgents.reviewer'), users: 41 },
    { name: t('personalAgents.marketing'), users: 27 },
    { name: t('personalAgents.coach'), users: 18 },
  ];

  const { globalModelUsage, personalModelUsage, weeklyUsage, globalUsers, personalUsers } =
    analyticsByPeriod[period];
  const globalTop = getTopModel(globalModelUsage);
  const personalTop = getTopModel(personalModelUsage);
  const showGlobal = scope === Scope.ALL || scope === Scope.GLOBAL;
  const showPersonal = scope === Scope.ALL || scope === Scope.PERSONAL;

  return (
    <div className="w-full space-y-6 p-4 sm:space-y-8 sm:p-6">
      <AnalyticsHeader
        title={t('title')}
        subtitle={t('subtitle')}
        scope={scope}
        period={period}
        scopeOptions={scopeOptions}
        periodOptions={periodOptions}
        onScopeChange={(value) => setScope(value as ScopeId)}
        onPeriodChange={(value) => setPeriod(value as PeriodId)}
      />
      <AnalyticsSummary
        showGlobal={showGlobal}
        showPersonal={showPersonal}
        globalUses={sumUses(globalModelUsage)}
        globalUsers={globalUsers}
        personalUsers={personalUsers}
        globalTop={globalTop}
      />
      <AnalyticsCharts
        showGlobal={showGlobal}
        showPersonal={showPersonal}
        weeklyUsage={weeklyUsage}
        globalModelUsage={globalModelUsage}
      />
      {showPersonal && (
        <AnalyticsPersonal
          personalAgents={personalAgents}
          personalUsers={personalUsers}
          personalTop={personalTop}
          personalModelUsage={personalModelUsage}
        />
      )}
    </div>
  );
};

export default AnalyticPage;
