import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { getUserFiles } from '@/actions/storage/get-user-files';
import { CommonLoader } from '@/components/loaders/common-loader';

import { StoragePageClient } from './_components/storage-page-client';

type StoragePageProps = {
  searchParams: Promise<{ pageIndex?: string; pageSize?: string }>;
};

const StoragePage = async (props: StoragePageProps) => {
  const searchParams = await props.searchParams;
  const t = await getTranslations('settings.storage');

  const user = await getCurrentUser();

  if (!user?.userId) {
    redirect('/login');
  }

  const { files, pageCount, totalCount } = await getUserFiles({
    userId: user.userId,
    pageIndex: searchParams.pageIndex,
    pageSize: searchParams.pageSize,
  });

  return (
    <div className="p-4 sm:p-6 flex flex-col mb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-medium">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>
      <div className="w-full">
        <Suspense fallback={<CommonLoader />}>
          <StoragePageClient
            files={files}
            pageCount={pageCount}
            totalCount={totalCount}
            currentPage={Number(searchParams.pageIndex || 0)}
            pageSize={Number(searchParams.pageSize || 10)}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default StoragePage;
