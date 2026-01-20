'use client';

import { useTranslations } from 'next-intl';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

import type { ModelUsage } from './types';

type AnalyticsSummaryProps = {
  showGlobal: boolean;
  showPersonal: boolean;
  globalUses: number;
  globalUsers: number;
  personalUsers: number;
  globalTop: ModelUsage;
};

export const AnalyticsSummary = ({
  showGlobal,
  showPersonal,
  globalUses,
  globalUsers,
  personalUsers,
  globalTop,
}: AnalyticsSummaryProps) => {
  const t = useTranslations('ai-agents.analytics');

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {showGlobal && (
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t('cards.globalUses')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{globalUses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{t('cards.publicOnly')}</p>
          </CardContent>
        </Card>
      )}
      {showGlobal && (
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t('cards.activeUsers')}
            </CardTitle>
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
  );
};
