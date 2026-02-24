import { getAiPricing } from '@/actions/ai/pricing/get-ai-pricing';
import { getIsEmailConfirmedForCurrentUser } from '@/actions/auth/get-is-email-confirmed';
import { Period } from '@/constants/ai/analytics';

import { UsagePageClient } from './_components/usage-page-client';

const PERIOD_TO_DAYS: Record<string, number | null> = {
  [Period['7D']]: 7,
  [Period['30D']]: 30,
  [Period['90D']]: 90,
  [Period.ALL]: null,
};

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PERIOD = Period['7D'];

type UsagePageProps = {
  searchParams: Promise<{
    pageIndex?: string;
    pageSize?: string;
    period?: string;
  }>;
};

const UsagePage = async (props: UsagePageProps) => {
  const searchParams = await props.searchParams;

  const period = searchParams.period || DEFAULT_PERIOD;
  const pageIndex = Number(searchParams.pageIndex || 0);
  const pageSize = Number(searchParams.pageSize || DEFAULT_PAGE_SIZE);
  const periodDays = period === Period.ALL ? null : PERIOD_TO_DAYS[period] ?? 7;

  const [data, isEmailConfirmed] = await Promise.all([
    getAiPricing({ periodDays, page: pageIndex, pageSize }),
    getIsEmailConfirmedForCurrentUser(),
  ]);

  return (
    <UsagePageClient
      currentPage={pageIndex}
      data={data}
      isEmailConfirmed={isEmailConfirmed}
      pageSize={pageSize}
      period={period}
    />
  );
};

export default UsagePage;
