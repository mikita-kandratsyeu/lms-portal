import { getAiAnalytics } from '@/actions/ai/analytics/get-ai-analytics';
import { getCurrentUser } from '@/actions/auth/get-current-user';

import { AnalyticsPageClient } from './_components/analytics-page-client';

const AnalyticPage = async () => {
  const user = await getCurrentUser();
  const analytics = await getAiAnalytics({ userId: user?.userId });

  return <AnalyticsPageClient analytics={analytics} />;
};

export default AnalyticPage;
