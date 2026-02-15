import { getAiAnalytics } from '@/actions/ai/analytics/get-ai-analytics';
import { getTokenUsageLeaderboardByPeriod } from '@/actions/ai/analytics/get-token-usage-leaderboard';
import { getCurrentUser } from '@/actions/auth/get-current-user';

import { AnalyticsPageClient } from './_components/analytics-page-client';

const AnalyticPage = async () => {
  const user = await getCurrentUser();
  const [analytics, tokenLeaderboard] = await Promise.all([
    getAiAnalytics({ userId: user?.userId }),
    getTokenUsageLeaderboardByPeriod(),
  ]);

  return <AnalyticsPageClient analytics={analytics} tokenLeaderboard={tokenLeaderboard} />;
};

export default AnalyticPage;
