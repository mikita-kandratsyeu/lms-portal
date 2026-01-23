'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { getAiAnalytics } from '@/actions/ai/analytics/get-ai-analytics';
import { Period, Scope } from '@/constants/ai/analytics';

import { AnalyticsCharts } from './analytics-charts';
import { AnalyticsHeader } from './analytics-header';
import { AnalyticsPersonal } from './analytics-personal';
import { AnalyticsSummary } from './analytics-summary';
import type { ModelUsage } from './types';

const periodOptionIds = Object.values(Period);
const scopeOptionIds = Object.values(Scope);

type PeriodId = (typeof periodOptionIds)[number];
type ScopeId = (typeof scopeOptionIds)[number];

const getTopModel = (models: ModelUsage[]) =>
  models.reduce((top, current) => (current.uses > top.uses ? current : top), models[0]);

const sumUses = (models: ModelUsage[]) => models.reduce((total, model) => total + model.uses, 0);

type AnalyticsPageClientProps = {
  analytics: Awaited<ReturnType<typeof getAiAnalytics>>;
};

export const AnalyticsPageClient = ({ analytics }: AnalyticsPageClientProps) => {
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

  const {
    globalModelUsage,
    globalUsers,
    personalAgents,
    personalModelUsage,
    personalUsers,
    weeklyUsage,
  } = analytics[period];

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
