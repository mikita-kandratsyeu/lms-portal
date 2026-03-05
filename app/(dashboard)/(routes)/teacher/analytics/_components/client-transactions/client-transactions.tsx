'use client';

import { useTranslations } from 'next-intl';

import { getAnalytics } from '@/actions/analytics/get-analytics';
import { DataTable } from '@/components/data-table/data-table';

import { createColumns } from './columns';

type ClientTransactionsProps = {
  transactions: Awaited<ReturnType<typeof getAnalytics>>['transactions'];
};

export const ClientTransactions = ({ transactions }: ClientTransactionsProps) => {
  const t = useTranslations('teacher.analytics.transactions');
  const tColumns = useTranslations('teacher.analytics.transactions.columns');
  const columns = createColumns(tColumns);

  return (
    <div className="flex flex-col gap-4 mt-8">
      <div className="flex flex-col gap-1">
        <p className="font-medium text-xl">{t('title')}</p>
        <span className="text-xs text-muted-foreground">
          {t('subtitle', { count: transactions.length })}
        </span>
      </div>
      <DataTable
        columns={columns}
        data={transactions}
        isServerSidePagination={false}
        noLabel={t('noData')}
      />
    </div>
  );
};
