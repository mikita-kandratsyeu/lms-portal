'use client';

import type { Locale } from 'date-fns';
import { format } from 'date-fns';
import {
  Bot,
  CreditCard,
  DollarSign,
  GraduationCap,
  HardDrive,
  ShoppingCart,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getStripeAnalytics } from '@/actions/stripe/get-stripe-analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatBytes, formatCompactNumber, formatPrice, getConvertedPrice } from '@/lib/format';
import { getFormatLocale } from '@/lib/locale';

type AnalyticsData = Awaited<ReturnType<typeof getStripeAnalytics>>;
type S3Storage = { usedBytes: number; objectCount: number };
type AiUsageStats = { totalTokens: number; totalCostCents: number };
type CompletionRateStats = {
  averageCompletionRate: number;
  totalChapters: number;
  completedChapters: number;
};

type AnalyticsOverviewProps = {
  analytics: AnalyticsData;
  s3Storage: S3Storage;
  aiUsageStats: AiUsageStats;
  completionRateStats: CompletionRateStats;
};

const getSubscriptionDescription = (
  subs: {
    active: number;
    trialCount: number;
    payingCount: number;
    earliestTrialEnd: Date | null;
  },
  t: (key: string, values?: Record<string, string | number>) => string,
  dateLocale: Locale,
) => {
  if (subs.trialCount > 0 && subs.earliestTrialEnd) {
    return t('descriptions.subscriptionWithTrial', {
      active: subs.active,
      trialCount: subs.trialCount,
      date: format(subs.earliestTrialEnd, 'd MMM yyyy', { locale: dateLocale }),
    });
  }
  return `${subs.active} ${t('descriptions.active')}`;
};

export const AnalyticsOverview = ({
  analytics,
  s3Storage,
  aiUsageStats,
  completionRateStats,
}: AnalyticsOverviewProps) => {
  const t = useTranslations('owner.analytics');
  const locale = useLocale();
  const formatLocale = getFormatLocale(locale);

  const metrics = [
    {
      title: t('availableBalance'),
      value: formatPrice(getConvertedPrice(analytics.balances.available)),
      icon: DollarSign,
      description: t('descriptions.readyForPayout'),
      color: 'text-green-600',
    },
    {
      title: t('pendingBalance'),
      value: formatPrice(getConvertedPrice(analytics.balances.pending)),
      icon: TrendingUp,
      description: t('descriptions.processing'),
      color: 'text-yellow-600',
    },
    {
      title: t('totalCustomers'),
      value: analytics.customers.total.toLocaleString(),
      icon: Users,
      description: t('descriptions.activeUsers'),
      color: 'text-blue-600',
    },
    {
      title: t('totalInstructors'),
      value: analytics.instructors.total.toLocaleString(),
      icon: GraduationCap,
      description: t('descriptions.connectedViaStripe'),
      color: 'text-purple-600',
    },
    {
      title: t('subscriptionRevenue'),
      value: formatPrice(getConvertedPrice(analytics.revenue.subscriptions.amount)),
      icon: CreditCard,
      description: getSubscriptionDescription(analytics.revenue.subscriptions, t, formatLocale),
      color: 'text-indigo-600',
    },
    {
      title: t('courseSales'),
      value: formatPrice(getConvertedPrice(analytics.revenue.sales.amount)),
      icon: ShoppingCart,
      description: `${analytics.revenue.sales.count} ${t('descriptions.purchases')}`,
      color: 'text-pink-600',
    },
    {
      title: t('storageUsage'),
      value: formatBytes(s3Storage.usedBytes),
      icon: HardDrive,
      description: t('descriptions.storageUsage', { count: s3Storage.objectCount }),
      color: 'text-emerald-600',
    },
    {
      title: t('aiTokensUsage'),
      value: formatCompactNumber(aiUsageStats.totalTokens),
      icon: Bot,
      description: t('descriptions.aiTokensUsage'),
      color: 'text-cyan-600',
    },
    {
      title: t('aiSpending'),
      value: formatPrice(aiUsageStats.totalCostCents),
      icon: Sparkles,
      description: t('descriptions.aiSpending'),
      color: 'text-orange-600',
    },
    {
      title: t('averageCompletionRate'),
      value: `${completionRateStats.averageCompletionRate.toFixed(1)}%`,
      icon: Target,
      description: t('descriptions.averageCompletionRate', {
        completed: completionRateStats.completedChapters,
        total: completionRateStats.totalChapters,
      }),
      color: 'text-teal-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
