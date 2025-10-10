'use client';

import { useTranslations } from 'next-intl';

import { DataTable } from '@/components/data-table/data-table';

import { getColumns } from './columns';

type CsmListProps = {
  pageCount: number;
  issues: any;
};

export const CsmList = ({ pageCount, issues }: CsmListProps) => {
  const t = useTranslations('csm-modal');

  const columns = getColumns(t);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="font-medium text-xl">Issues</p>
        <span className="text-xs text-muted-foreground">List of all CSM issues</span>
      </div>
      <DataTable
        columns={columns}
        data={issues}
        isCsmPage
        noLabel="No issues"
        pageCount={pageCount}
      />
    </div>
  );
};
