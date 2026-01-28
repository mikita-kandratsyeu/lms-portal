'use client';

import { CreditCard, ShoppingBag } from 'lucide-react';

import { getStripeAnalytics } from '@/actions/stripe/get-stripe-analytics';
import { Card, CardContent } from '@/components/ui';
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '@/constants/locale';
import { formatPrice, getConvertedPrice } from '@/lib/format';

type AnalyticsData = Awaited<ReturnType<typeof getStripeAnalytics>>;

type RevenueBreakdownProps = {
  analytics: AnalyticsData;
};

export const RevenueBreakdown = ({ analytics }: RevenueBreakdownProps) => {
  const defaultLocale = { locale: DEFAULT_LOCALE, currency: DEFAULT_CURRENCY };
  const totalRevenue = analytics.revenue.total;

  const subscriptionPercentage =
    totalRevenue > 0 ? (analytics.revenue.subscriptions.amount / totalRevenue) * 100 : 0;
  const salesPercentage =
    totalRevenue > 0 ? (analytics.revenue.sales.amount / totalRevenue) * 100 : 0;

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-col gap-1">
        <p className="font-medium text-xl">Revenue Breakdown</p>
        <span className="text-xs text-muted-foreground">
          Detailed analysis of your income sources
        </span>
      </div>
      <Card className="shadow-none">
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-md bg-indigo-500/10">
                <CreditCard className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">Subscription Revenue</h4>
                  <span className="text-sm font-semibold">
                    {formatPrice(
                      getConvertedPrice(analytics.revenue.subscriptions.amount),
                      defaultLocale,
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    {analytics.revenue.subscriptions.active} active •{' '}
                    {analytics.revenue.subscriptions.count} total
                  </span>
                  {subscriptionPercentage > 0 && (
                    <span>• {subscriptionPercentage.toFixed(1)}% of total revenue</span>
                  )}
                </div>
                {analytics.revenue.subscriptions.plans.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {analytics.revenue.subscriptions.plans.map((plan) => (
                      <div key={plan.name} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {plan.name} ({plan.period})
                        </span>
                        <span className="font-medium">
                          {plan.activeCount} active •{' '}
                          {formatPrice(getConvertedPrice(plan.revenue), defaultLocale)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-md bg-pink-500/10">
                <ShoppingBag className="h-5 w-5 text-pink-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">Course Sales</h4>
                  <span className="text-sm font-semibold">
                    {formatPrice(getConvertedPrice(analytics.revenue.sales.amount), defaultLocale)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {analytics.revenue.sales.count} purchases • {salesPercentage.toFixed(1)}% of total
                  revenue
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Platform Revenue</p>
                <p className="text-2xl font-bold mt-1">
                  {formatPrice(getConvertedPrice(totalRevenue), defaultLocale)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Paid Out</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {formatPrice(getConvertedPrice(analytics.payouts.total), defaultLocale)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
