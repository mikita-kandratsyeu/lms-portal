import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { getDashboardCourses } from '@/actions/courses/get-dashboard-courses';
import { getNovaPulse } from '@/actions/nova-pulse/get-nova-pulse';
import { PLATFORM_DESCRIPTION } from '@/constants/common';
import { FilterStatus } from '@/constants/courses';

import { CoursesList } from '../../_components/courses/courses-list';
import { InfoCard } from './_components/info-card';
import { NovaPulse } from './_components/nova-pulse';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: PLATFORM_DESCRIPTION,
};

const DashboardPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return redirect('/');
  }

  const { completedCourses, coursesInProgress, filterCourses } = await getDashboardCourses({
    userId: user.userId,
  });

  const novaPulseInfo = await getNovaPulse(user.userId);

  return (
    <div className="p-6 space-y-4">
      <NovaPulse info={novaPulseInfo} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard courseStatus={FilterStatus.PROGRESS} numberOfItems={coursesInProgress.length} />
        <InfoCard courseStatus={FilterStatus.COMPLETED} numberOfItems={completedCourses.length} />
      </div>
      <CoursesList items={filterCourses} />
    </div>
  );
};

export default DashboardPage;
