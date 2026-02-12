import { getTranslations } from 'next-intl/server';

import { getAiUsageStats } from '@/actions/ai/analytics/get-ai-usage-stats';
import { getCompletionRateStats } from '@/actions/analytics/get-completion-rate';
import { getS3StorageUsageAction } from '@/actions/s3/get-s3-storage-usage';
import { getStripeAnalytics } from '@/actions/stripe/get-stripe-analytics';
import { getStripeDetails } from '@/actions/stripe/get-stripe-details';

import { AiInsightsModal } from './_components/ai-insights-modal';
import { AnalyticsOverview } from './_components/analytics-overview';
import { PayoutRequests } from './_components/payout-requests/payout-requests';
import { RevenueBreakdown } from './_components/revenue-breakdown';
import { StripeBalances } from './_components/stripe-balances';

type OwnerPageProps = {
  searchParams: Promise<{ pageIndex: string; pageSize: string }>;
};

const OwnerPage = async (props: OwnerPageProps) => {
  const searchParams = await props.searchParams;
  const t = await getTranslations('owner.page');

  const [
    { pageCount, payoutRequests, owner },
    analytics,
    s3Storage,
    aiUsageStats,
    completionRateStats,
  ] = await Promise.all([
    getStripeDetails(searchParams),
    getStripeAnalytics(),
    getS3StorageUsageAction(),
    getAiUsageStats(),
    getCompletionRateStats(),
  ]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-medium">{owner?.dashboard?.display_name ?? t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
        </div>
        <AiInsightsModal />
      </div>
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <p className="font-medium text-xl">{t('sections.overview.title')}</p>
          <span className="text-xs text-muted-foreground">
            {t('sections.overview.description')}
          </span>
        </div>
        <AnalyticsOverview
          analytics={analytics}
          s3Storage={s3Storage}
          aiUsageStats={aiUsageStats}
          completionRateStats={completionRateStats}
        />
      </div>
      <RevenueBreakdown analytics={analytics} />
      <StripeBalances />
      <PayoutRequests pageCount={pageCount} payoutRequests={payoutRequests} />
    </div>
  );
};

export default OwnerPage;
