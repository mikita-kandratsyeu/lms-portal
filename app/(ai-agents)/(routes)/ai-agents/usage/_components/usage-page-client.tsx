'use client';

import { useTranslations } from 'next-intl';

import type { UsagePageData } from '@/actions/ai/pricing/get-ai-pricing';

import { UsageHeader } from './usage-header';
import { UsagePagination } from './usage-pagination';
import { UsageSummaryCards } from './usage-summary-cards';
import { UsageTable } from './usage-table';

type UsagePageClientProps = {
  data: UsagePageData;
  period: string;
  currentPage: number;
  pageSize: number;
  isEmailConfirmed: boolean;
};

export const UsagePageClient = ({
  data,
  period,
  currentPage,
  pageSize,
  isEmailConfirmed,
}: UsagePageClientProps) => {
  const t = useTranslations('ai-agents.usage');

  const pageCount = Math.ceil(data.totalCount / pageSize);

  return (
    <div className="w-full space-y-6 p-4 sm:space-y-8 sm:p-6">
      <UsageHeader
        isEmailConfirmed={isEmailConfirmed}
        title={t('title')}
        subtitle={t('subtitle')}
        period={period}
      />
      <UsageSummaryCards summary={data.summary} />
      <UsageTable rows={data.rows} />
      <UsagePagination currentPage={currentPage} pageSize={pageSize} pageCount={pageCount} />
    </div>
  );
};
