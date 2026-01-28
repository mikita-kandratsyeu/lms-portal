'use client';

import { AlertCircle, Calendar, CheckCircle2, Clock, FolderOpen, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { CsmStats } from '@/actions/csm/get-csm-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

type CsmOverviewProps = {
  stats: CsmStats;
};

export const CsmOverview = ({ stats }: CsmOverviewProps) => {
  const t = useTranslations('owner.csm.metrics');

  const {
    totalIssues,
    newIssues,
    inProgressIssues,
    resolvedIssues,
    issuesThisMonth,
    issuesByCategory,
  } = stats;

  const resolvedPercentage =
    totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(1) : '0';

  const categoryBreakdown =
    issuesByCategory.length > 0
      ? issuesByCategory
          .slice(0, 3)
          .map((cat) => `${cat.name}: ${cat.count}`)
          .join(', ')
      : t('descriptions.noCategories');

  const metrics = [
    {
      title: t('totalIssues'),
      value: totalIssues.toLocaleString(),
      icon: FolderOpen,
      description: t('descriptions.allTime'),
      color: 'text-blue-600',
    },
    {
      title: t('newIssues'),
      value: newIssues.toLocaleString(),
      icon: AlertCircle,
      description: t('descriptions.awaitingReview'),
      color: 'text-orange-600',
    },
    {
      title: t('inProgress'),
      value: inProgressIssues.toLocaleString(),
      icon: Clock,
      description: t('descriptions.beingProcessed'),
      color: 'text-yellow-600',
    },
    {
      title: t('resolved'),
      value: resolvedIssues.toLocaleString(),
      icon: CheckCircle2,
      description: `${resolvedPercentage}% ${t('descriptions.completed')}`,
      color: 'text-green-600',
    },
    {
      title: t('thisMonth'),
      value: issuesThisMonth.toLocaleString(),
      icon: Calendar,
      description: t('descriptions.recentActivity'),
      color: 'text-purple-600',
    },
    {
      title: t('topCategories'),
      value: issuesByCategory.length.toLocaleString(),
      icon: TrendingUp,
      description: categoryBreakdown,
      color: 'text-pink-600',
      detail: categoryBreakdown,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
