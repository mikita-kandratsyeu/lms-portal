import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

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
  const user = await getCurrentUser();

  if (!user) {
    return redirect('/');
  }

  const tSidebar = await getTranslations('sidebar');
  const tLeaderboard = await getTranslations('leaderboard');

  const { leaders, currentUserLeader, currentUserRank, totalUsersCount } = await getLeaders(
    user?.userId,
  );

  return (
    <Suspense fallback={<LeaderBoardSkeleton />}>
      <div className="p-6 flex flex-col mb-6">
        <div className="mb-8">
          <h1 className="text-2xl font-medium">{tSidebar('leaderboard')}</h1>
          <p className="text-muted-foreground mt-2">{tLeaderboard('description')}</p>
        </div>
        <LeadersTable
          leaders={leaders}
          userId={user?.userId}
          currentUserLeader={currentUserLeader ?? null}
          currentUserRank={currentUserRank}
          totalUsersCount={totalUsersCount}
        />
      </div>
    </Suspense>
  );
};

export default LeaderBoard;
