'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { AiAnalyticsResponse, PeriodAnalytics } from '@/actions/ai/analytics/get-ai-analytics';
import type { TokenUsageLeaderboardByPeriod } from '@/actions/ai/analytics/get-token-usage-leaderboard';
import { Period, Scope } from '@/constants/ai/analytics';

import { AnalyticsCharts } from './analytics-charts';
import { AnalyticsHeader } from './analytics-header';
import { AnalyticsPersonal } from './analytics-personal';
import { AnalyticsSummary } from './analytics-summary';
import { AnalyticsTokenLeaderboard } from './analytics-token-leaderboard';
import type { ModelUsage } from './types';

const periodOptionIds = Object.values(Period);
const scopeOptionIds = Object.values(Scope);

type PeriodId = (typeof periodOptionIds)[number];
type ScopeId = (typeof scopeOptionIds)[number];

const getTopModel = (models: ModelUsage[]) =>
  models.reduce((top, current) => (current.uses > top.uses ? current : top), models[0]);

const sumUses = (models: ModelUsage[]) => models.reduce((total, model) => total + model.uses, 0);

type AnalyticsPageClientProps = {
  analytics: AiAnalyticsResponse;
  tokenLeaderboard: TokenUsageLeaderboardByPeriod;
};

export const AnalyticsPageClient = ({ analytics, tokenLeaderboard }: AnalyticsPageClientProps) => {
  const t = useTranslations('ai-agents.analytics');

  const [period, setPeriod] = useState<PeriodId>(Period['7D']);
  const [scope, setScope] = useState<ScopeId>(Scope.ALL);

  const periodOptions = periodOptionIds.map((id) => ({
    id,
    label: t(`periods.${id}`),
  }));
  const scopeOptions = scopeOptionIds.map((id) => ({
    id,
    label: t(`scopes.${id}`),
  }));

  const emptyPeriod: PeriodAnalytics = {
    globalModelUsage: [],
    personalModelUsage: [],
    weeklyUsage: [],
    globalUsers: 0,
    personalUsers: 0,
    personalAgents: [],
  };

  const {
    globalModelUsage,
    globalUsers,
    personalAgents,
    personalModelUsage,
    personalUsers,
    weeklyUsage,
  } = analytics[period] ?? emptyPeriod;

  const hasGlobalUsage = globalModelUsage.length > 0;
  const hasPersonalUsage = personalModelUsage.length > 0;
  const hasWeeklyUsage = weeklyUsage.length > 0;
  const hasGlobalUsers = globalUsers > 0;
  const hasPersonalUsers = personalUsers > 0;

  const globalTop = hasGlobalUsage ? getTopModel(globalModelUsage) : null;
  const personalTop = hasPersonalUsage ? getTopModel(personalModelUsage) : null;
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
        globalTop={globalTop}
        globalUsers={globalUsers}
        globalUses={sumUses(globalModelUsage)}
        hasGlobalUsage={hasGlobalUsage}
        hasGlobalUsers={hasGlobalUsers}
        hasPersonalUsers={hasPersonalUsers}
        period={period}
        personalUsers={personalUsers}
        showGlobal={showGlobal}
        showPersonal={showPersonal}
      />
      <AnalyticsCharts
        showGlobal={showGlobal}
        showPersonal={showPersonal}
        weeklyUsage={weeklyUsage}
        globalModelUsage={globalModelUsage}
        hasWeeklyUsage={hasWeeklyUsage}
        hasGlobalUsage={hasGlobalUsage}
      />
      <AnalyticsTokenLeaderboard
        entries={tokenLeaderboard[period] ?? []}
        periodLabel={t(`periods.${period}`)}
      />
      {showPersonal && (
        <AnalyticsPersonal
          personalAgents={personalAgents}
          personalUsers={personalUsers}
          personalTop={personalTop}
          personalModelUsage={personalModelUsage}
          hasPersonalUsage={hasPersonalUsage}
        />
      )}
    </div>
  );
};
