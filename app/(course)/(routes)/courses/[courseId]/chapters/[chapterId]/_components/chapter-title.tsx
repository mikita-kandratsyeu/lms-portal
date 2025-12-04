'use client';

import { Chapter, Course } from '@prisma/client';
import { Clock9 } from 'lucide-react';

import { CourseEnrollButton } from '@/components/common/course-enroll-button';
import { formatTimeInSeconds } from '@/lib/date';
import { cn } from '@/lib/utils';

import { CourseProgressButton } from './course-progress-button';

type ChapterTitleProps = {
  chapter: Chapter;
  chapterId: string;
  course: Course;
  courseId: string;
  durationInSec: number;
  hasPurchase: boolean;
  isCompleted?: boolean;
  nextChapterId?: string;
};

export const ChapterTitle = ({
  chapter,
  chapterId,
  course,
  courseId,
  durationInSec,
  hasPurchase,
  isCompleted,
  nextChapterId,
}: ChapterTitleProps) => {
  return (
    <div className="p-4 flex flex-col md:flex-row items-center justify-between">
      <div className="flex flex-col justify-center">
        <h2 className={cn('text-2xl font-semibold md:mb-0', durationInSec > 0 ? 'mb-2' : 'mb-4')}>
          {chapter.title}
        </h2>
        {durationInSec > 0 && (
          <div className="flex items-center gap-x-1 text-muted-foreground md:my-1 mb-6 justify-center md:justify-start">
            <Clock9 className="h-4 w-4" />
            <span className="text-xs">{formatTimeInSeconds(durationInSec)}</span>
          </div>
        )}
      </div>
      {hasPurchase ? (
        <CourseProgressButton
          chapterId={chapterId}
          courseId={courseId}
          isCompleted={isCompleted}
          nextChapterId={nextChapterId}
        />
      ) : (
        <div className="w-full md:w-auto">
          <CourseEnrollButton
            courseId={courseId}
            customRates={course.customRates}
            price={course.price}
          />
        </div>
      )}
    </div>
  );
};
