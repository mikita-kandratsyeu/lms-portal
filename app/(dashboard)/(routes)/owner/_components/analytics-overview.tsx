'use client';

import {
  CreditCard,
  DollarSign,
  GraduationCap,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { getStripeAnalytics } from '@/actions/stripe/get-stripe-analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '@/constants/locale';
import { formatPrice, getConvertedPrice } from '@/lib/format';

type AnalyticsData = Awaited<ReturnType<typeof getStripeAnalytics>>;

type AnalyticsOverviewProps = {
  analytics: AnalyticsData;
};

export const AnalyticsOverview = ({ analytics }: AnalyticsOverviewProps) => {
  const t = useTranslations('owner.analytics');
  const defaultLocale = { locale: DEFAULT_LOCALE, currency: DEFAULT_CURRENCY };

  const metrics = [
    {
      title: t('availableBalance'),
      value: formatPrice(getConvertedPrice(analytics.balances.available), defaultLocale),
      icon: DollarSign,
      description: t('descriptions.readyForPayout'),
      color: 'text-green-600',
    },
    {
      title: t('pendingBalance'),
      value: formatPrice(getConvertedPrice(analytics.balances.pending), defaultLocale),
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
      value: formatPrice(getConvertedPrice(analytics.revenue.subscriptions.amount), defaultLocale),
      icon: CreditCard,
      description: `${analytics.revenue.subscriptions.active} ${t('descriptions.active')}`,
      color: 'text-indigo-600',
    },
    {
      title: t('courseSales'),
      value: formatPrice(getConvertedPrice(analytics.revenue.sales.amount), defaultLocale),
      icon: ShoppingCart,
      description: `${analytics.revenue.sales.count} ${t('descriptions.purchases')}`,
      color: 'text-pink-600',
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
