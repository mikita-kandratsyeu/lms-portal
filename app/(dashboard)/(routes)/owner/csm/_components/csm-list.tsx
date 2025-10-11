'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { CsmIssueType } from '@/actions/csm/get-csm-issues';
import { DataTable } from '@/components/data-table/data-table';
import { CsmModal } from '@/components/modals/csm/csm-modal';

import { getColumns } from './columns';

type CsmListProps = {
  pageCount: number;
  issues: CsmIssueType[];
};

export const CsmList = ({ pageCount, issues }: CsmListProps) => {
  const t = useTranslations('csm-modal');

  const searchParams = useSearchParams();

  const [openModal, setOpenModal] = useState(false);
  const [csmIssue, setCsmIssue] = useState<CsmIssueType | null>(null);

  useEffect(() => {
    const issueId = searchParams.get('issueId');

    if (issueId) {
      setCsmIssue(issues.find((issue) => issue.id === issueId) ?? null);
      setOpenModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = getColumns(t);

  return (
    <>
      {openModal && <CsmModal open={openModal} setOpen={setOpenModal} editIssue={csmIssue} />}
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
    </>
  );
};
