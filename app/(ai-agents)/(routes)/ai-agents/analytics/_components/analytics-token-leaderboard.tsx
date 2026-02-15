'use client';

import { Info, Trophy } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { type TokenUsageLeaderboardEntry } from '@/actions/ai/analytics/get-token-usage-leaderboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCompactNumber } from '@/lib/format';

type AnalyticsTokenLeaderboardProps = {
  entries: TokenUsageLeaderboardEntry[];
  periodLabel: string;
};

export const AnalyticsTokenLeaderboard = ({
  entries,
  periodLabel,
}: AnalyticsTokenLeaderboardProps) => {
  const t = useTranslations('ai-agents.analytics');
  const emptyLabel = t('emptyData');

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <CardTitle>{t('tokenLeaderboard.title')}</CardTitle>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <p className="text-sm text-muted-foreground">{t('tokenLeaderboard.subtitle')}</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-[240px] text-xs">{t('tokenLeaderboard.tooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <span className="rounded-md border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {periodLabel}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {entries.map((entry, index) => (
              <div
                key={`${entry.model}-${entry.provider}`}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{entry.modelName ?? entry.model}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('tokenLeaderboard.byProvider', {
                        provider: entry.providerName ?? entry.provider,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <span className="text-sm font-medium">
                    {formatCompactNumber(entry.totalTokens)} {t('tokenLeaderboard.tokens')}
                  </span>
                  {entry.changePercent !== null ? (
                    <span
                      className={`text-xs font-medium ${
                        entry.changePercent >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {entry.changePercent >= 0 ? '↑' : '↓'}
                      {Math.abs(entry.changePercent)}%
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                      {t('tokenLeaderboard.new')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        )}
      </CardContent>
    </Card>
  );
};
