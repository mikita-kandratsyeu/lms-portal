'use client';

import { getAnalytics } from '@/actions/analytics/get-analytics';
import { DataTable } from '@/components/data-table/data-table';

import { columns } from './columns';

type ClientTransactionsProps = {
  transactions: Awaited<ReturnType<typeof getAnalytics>>['transactions'];
};

export const ClientTransactions = ({ transactions }: ClientTransactionsProps) => {
  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex flex-col gap-1">
        <p className="font-medium text-xl">History</p>
      </div>
      <DataTable
        columns={columns}
        data={transactions}
        isServerSidePagination={false}
        noLabel="No client transactions"
      />
    </div>
  );
};
