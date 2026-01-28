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
  const { balances, pageCount, payoutRequests, owner } = await getStripeDetails(searchParams);
  const analytics = await getStripeAnalytics();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-2xl font-medium">Business Dashboard</h1>
        <AiInsightsModal />
      </div>
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <p className="font-medium text-xl">Overview</p>
          <span className="text-xs text-muted-foreground">
            Key metrics and financial indicators for your platform
          </span>
        </div>
        <AnalyticsOverview analytics={analytics} />
      </div>
      <RevenueBreakdown analytics={analytics} />
      <StripeBalances balances={balances} owner={owner} />
      <PayoutRequests pageCount={pageCount} payoutRequests={payoutRequests} />
    </div>
  );
};

export default OwnerPage;
