'use client';

import { useTranslations } from 'next-intl';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Period } from '@/constants/ai/analytics';

import type { ModelUsage } from './types';

type AnalyticsSummaryProps = {
  globalTop: ModelUsage | null;
  globalUsers: number;
  globalUses: number;
  hasGlobalUsage: boolean;
  hasGlobalUsers: boolean;
  hasPersonalUsers: boolean;
  period: string;
  personalUsers: number;
  showGlobal: boolean;
  showPersonal: boolean;
};

export const AnalyticsSummary = ({
  globalTop,
  globalUsers,
  globalUses,
  hasGlobalUsage,
  hasGlobalUsers,
  hasPersonalUsers,
  period,
  personalUsers,
  showGlobal,
  showPersonal,
}: AnalyticsSummaryProps) => {
  const t = useTranslations('ai-agents.analytics');
  const emptyLabel = t('emptyData');

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {showGlobal && (
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle>{t('cards.globalUses')}</CardTitle>
          </CardHeader>
          <CardContent>
            {hasGlobalUsage ? (
              <>
                <div className="text-2xl font-semibold">{globalUses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{t('cards.publicOnly')}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{emptyLabel}</p>
            )}
          </CardContent>
        </Card>
      )}
      {showGlobal && (
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle>{t('cards.activeUsers')}</CardTitle>
          </CardHeader>
          <CardContent>
            {hasGlobalUsers ? (
              <>
                <div className="text-2xl font-semibold">{globalUsers.toLocaleString()}</div>
                {period !== Period.ALL && (
                  <p className="text-xs text-muted-foreground">
                    {t('cards.lastDays', { amount: period.slice(0, -1) })}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{emptyLabel}</p>
            )}
          </CardContent>
        </Card>
      )}
      {showPersonal && (
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle>{t('cards.myAgentsUsers')}</CardTitle>
          </CardHeader>
          <CardContent>
            {hasPersonalUsers ? (
              <>
                <div className="text-2xl font-semibold">{personalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{t('cards.includingPrivate')}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{emptyLabel}</p>
            )}
          </CardContent>
        </Card>
      )}
      {showGlobal && (
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle>{t('cards.topModelGlobal')}</CardTitle>
          </CardHeader>
          <CardContent>
            {globalTop && hasGlobalUsage ? (
              <>
                <div className="text-2xl font-semibold">{globalTop.model}</div>
                <p className="text-xs text-muted-foreground">
                  {t('cards.totalUses', { amount: globalTop.uses.toLocaleString() })}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{emptyLabel}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
