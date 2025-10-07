import { getCsmIssue } from '@/actions/csm/get-csm-issues';

import { CsmList } from './_components/csm-list';

type CsmPageProps = {
  searchParams: Promise<{ pageIndex: string; pageSize: string; search?: string }>;
};

const CsmPage = async (props: CsmPageProps) => {
  const searchParams = await props.searchParams;
  const { pageCount, issues } = await getCsmIssue(searchParams);

  return (
    <div className="p-6 flex flex-col mb-6">
      <h1 className="text-2xl font-medium mb-12">Client Service Management</h1>
      <CsmList pageCount={pageCount} issues={issues} />
    </div>
  );
};

export default CsmPage;
