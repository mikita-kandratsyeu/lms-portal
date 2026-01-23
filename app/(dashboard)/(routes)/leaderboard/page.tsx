import { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { getLeaders } from '@/actions/courses/get-leaders';
import { LeaderBoardSkeleton } from '@/components/loaders/leaderboard-skeleton';
import { PLATFORM_DESCRIPTION } from '@/constants/common';

import { LeadersTable } from './_components/leaders-table';

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: PLATFORM_DESCRIPTION,
};

const LeaderBoard = async () => {
  const t = await getTranslations('sidebar');
  const user = await getCurrentUser();
  const leaders = await getLeaders();

  return (
    <Suspense fallback={<LeaderBoardSkeleton />}>
      <div className="px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <h1 className="text-2xl font-medium">{t('leaderboard')}</h1>
          <LeadersTable leaders={leaders} userId={user?.userId} />
        </div>
      </div>
    </Suspense>
  );
};

export default LeaderBoard;
