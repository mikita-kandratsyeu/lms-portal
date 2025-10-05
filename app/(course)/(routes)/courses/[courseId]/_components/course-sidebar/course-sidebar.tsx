import { Chapter, Course, UserProgress } from '@prisma/client';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { ProgressBar } from '@/components/common/progress-bar';
import db from '@/lib/db';

import { CourseSideBarItem } from './course-sidebar-item';

type CourseSideBarProps = {
  course: Course & { chapters: (Chapter & { userProgress: UserProgress[] | null })[] };
  progressCount: number;
};

export const CourseSideBar = async ({ course, progressCount }: CourseSideBarProps) => {
  const user = await getCurrentUser();

  const purchase = await db.purchase.findUnique({
    where: { userId_courseId: { userId: user!.userId, courseId: course.id } },
  });

  return (
    <div className="h-full border-r flex flex-col shadow-sm bg-white dark:bg-neutral-900">
      <div className="flex flex-col px-4 py-8 border-b">
        <h1 className="font-semibold">{course.title}</h1>
        {purchase && (
          <div className="mt-4">
            <ProgressBar showText variant="success" value={progressCount} />
          </div>
        )}
      </div>
      <div className="flex flex-col w-full overflow-y-auto">
        {course.chapters.map((chapter) => (
          <CourseSideBarItem
            key={chapter.id}
            courseId={course.id}
            id={chapter.id}
            isCompleted={Boolean(chapter.userProgress?.[0]?.isCompleted)}
            isLocked={!chapter.isFree && !purchase}
            label={chapter.title}
          />
        ))}
      </div>
    </div>
  );
};
