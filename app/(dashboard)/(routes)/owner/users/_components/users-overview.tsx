'use client';

import { BadgeCheck, Calendar, CreditCard, TrendingUp, UserCheck, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { UsersStats } from '@/actions/users/get-users-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

type UsersOverviewProps = {
  stats: UsersStats;
};

export const UsersOverview = ({ stats }: UsersOverviewProps) => {
  const t = useTranslations('owner.users.metrics');

  const {
    totalUsers,
    verifiedUsers,
    premiumUsers,
    publicProfiles,
    usersWithCourses,
    newUsersThisMonth,
    subscriptionsByType,
  } = stats;

  const verifiedPercentage = totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) : '0';
  const premiumPercentage = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : '0';

  const subscriptionBreakdown =
    subscriptionsByType.length > 0
      ? subscriptionsByType.map((sub) => `${sub.name}: ${sub.count}`).join(', ')
      : t('descriptions.noSubscriptions');

  const metrics = [
    {
      title: t('totalUsers'),
      value: totalUsers.toLocaleString(),
      icon: Users,
      description: t('descriptions.registered'),
      color: 'text-blue-600',
    },
    {
      title: t('verifiedUsers'),
      value: verifiedUsers.toLocaleString(),
      icon: BadgeCheck,
      description: `${verifiedPercentage}% ${t('descriptions.verified')}`,
      color: 'text-green-600',
    },
    {
      title: t('premiumUsers'),
      value: premiumUsers.toLocaleString(),
      icon: CreditCard,
      description: `${premiumPercentage}% ${t('descriptions.premium')}`,
      color: 'text-indigo-600',
      detail: subscriptionBreakdown,
    },
    {
      title: t('publicProfiles'),
      value: publicProfiles.toLocaleString(),
      icon: UserCheck,
      description: t('descriptions.visibleProfiles'),
      color: 'text-cyan-600',
    },
    {
      title: t('usersWithCourses'),
      value: usersWithCourses.toLocaleString(),
      icon: TrendingUp,
      description: t('descriptions.enrolled'),
      color: 'text-pink-600',
    },
    {
      title: t('newThisMonth'),
      value: newUsersThisMonth.toLocaleString(),
      icon: Calendar,
      description: t('descriptions.joinedRecently'),
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                {metric.detail && (
                  <p className="text-xs text-muted-foreground mt-1 pt-1 border-t">
                    {metric.detail}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
