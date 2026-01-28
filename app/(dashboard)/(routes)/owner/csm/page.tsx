import { getTranslations } from 'next-intl/server';

import { getCsmIssue } from '@/actions/csm/get-csm-issues';
import { getCsmStats } from '@/actions/csm/get-csm-stats';

import { CsmList } from './_components/csm-list';
import { CsmOverview } from './_components/csm-overview';

type CsmPageProps = {
  searchParams: Promise<{ pageIndex: string; pageSize: string; search?: string; issueId?: string }>;
};

const CsmPage = async (props: CsmPageProps) => {
  const searchParams = await props.searchParams;
  const { pageCount, issues } = await getCsmIssue(searchParams);
  const stats = await getCsmStats({ search: searchParams.search });
  const t = await getTranslations('owner.csm');

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-medium">{t('page.title')}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{t('page.description')}</p>
        </div>
      </div>
      <div className="flex flex-col gap-4 mb-6 sm:mb-8">
        <div className="flex flex-col gap-1">
          <p className="font-medium text-lg sm:text-xl">{t('sections.overview.title')}</p>
          <span className="text-xs text-muted-foreground">
            {t('sections.overview.description')}
          </span>
        </div>
        <CsmOverview stats={stats} />
      </div>
      <CsmList pageCount={pageCount} issues={issues} />
    </div>
  );
};

export default CsmPage;
