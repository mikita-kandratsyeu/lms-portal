import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import React from 'react';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { getGlobalProgress } from '@/actions/courses/get-global-progress';
import { getProgress } from '@/actions/courses/get-progress';
import { getUserNotifications } from '@/actions/users/get-user-notifications';
import { PLATFORM_DESCRIPTION } from '@/constants/common';
import db from '@/lib/db';

import { CourseNavBar } from './_components/course-navbar/course-navbar';
import { CourseSideBar } from './_components/course-sidebar/course-sidebar';

type CourseLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}>;

export async function generateMetadata({ params }: CourseLayoutProps): Promise<Metadata> {
  const { courseId } = await params;

  const course = await db.course.findUnique({
    where: { id: courseId },
  });

  return {
    title: course?.title || 'Nova Academy',
    description: course?.description || PLATFORM_DESCRIPTION,
  };
}

const CourseLayout = async ({ children, params }: CourseLayoutProps) => {
  const { courseId } = await params;

  const user = await getCurrentUser();
  const globalProgress = await getGlobalProgress(user?.userId);

  if (!user) {
    redirect('/');
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        where: { isPublished: true },
        include: { userProgress: { where: { userId: user.userId } } },
        orderBy: { position: 'asc' },
      },
    },
  });

  if (!course) {
    redirect('/');
  }

  const { progressPercentage: progressCount } = await getProgress({
    userId: user.userId,
    courseId: course.id,
  });

  const { notifications: userNotifications } = await getUserNotifications({
    userId: user?.userId,
    take: 5,
  });

  const commonCourseProps = { course, progressCount };

  return (
    <div className="h-full">
      <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
        <CourseNavBar
          {...commonCourseProps}
          globalProgress={globalProgress}
          userNotifications={userNotifications}
        />
      </div>
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
        <CourseSideBar {...commonCourseProps} />
      </div>
      <main className="md:pl-80 pt-[80px] h-full">{children}</main>
    </div>
  );
};

export default CourseLayout;
