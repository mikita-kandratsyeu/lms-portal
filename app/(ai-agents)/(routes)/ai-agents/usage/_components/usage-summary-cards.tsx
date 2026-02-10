'use client';

import { format } from 'date-fns';
import { Clock, Infinity as InfinityIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import type { UsageSummary } from '@/actions/ai/pricing/get-ai-pricing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { TIMESTAMP_REQUESTS_LIMIT_TEMPLATE } from '@/constants/common';
import { formatPrice } from '@/lib/format';
import { getFormatLocale } from '@/lib/locale';

const formatTokens = (count: number) => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;

  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;

  return count.toString();
};

type UsageSummaryCardsProps = {
  summary: UsageSummary;
};

export const UsageSummaryCards = ({ summary }: UsageSummaryCardsProps) => {
  const t = useTranslations('ai-agents.usage');
  const locale = useLocale();

  const formattedCost = formatPrice(summary.totalCostCents);
  const resetDate = summary.nextResetDate
    ? format(new Date(summary.nextResetDate), TIMESTAMP_REQUESTS_LIMIT_TEMPLATE, {
        locale: getFormatLocale(locale),
      })
    : null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('cards.costAndRequests')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-2xl font-semibold">{formattedCost}</div>
            <p className="text-xs text-muted-foreground">
              {t('cards.totalCost', { count: summary.requestCount })}
            </p>
          </div>
          <div className="border-t pt-3">
            {summary.hasSubscription ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <InfinityIcon className="h-4 w-4" />
                <span>{t('cards.unlimitedRequests')}</span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('cards.freeRequests')}</span>
                  <span className="font-medium">
                    {summary.freeRequestsUsed} / {summary.freeRequestsLimit}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.min((summary.freeRequestsUsed / summary.freeRequestsLimit) * 100, 100)}%`,
                    }}
                  />
                </div>
                {resetDate && (
                  <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{t('cards.resetsOn', { date: resetDate })}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('cards.tokenUsage')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-2xl font-semibold">{formatTokens(summary.totalTokens)}</div>
            <p className="text-xs text-muted-foreground">{t('cards.totalTokens')}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t pt-3">
            <div>
              <div className="text-lg font-semibold">{formatTokens(summary.totalInputTokens)}</div>
              <p className="text-xs text-muted-foreground">{t('cards.inputTokens')}</p>
            </div>
            <div>
              <div className="text-lg font-semibold">{formatTokens(summary.totalOutputTokens)}</div>
              <p className="text-xs text-muted-foreground">{t('cards.outputTokens')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
