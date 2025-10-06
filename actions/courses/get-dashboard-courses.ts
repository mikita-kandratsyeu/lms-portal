'use server';

import { Category, Chapter, Course, UserProgress } from '@prisma/client';

import { FilterStatus } from '@/constants/courses';
import db from '@/lib/db';
import { getImagePlaceHolder } from '@/lib/image';

import { getProgress } from './get-progress';

type CourseWithProgressAndCategory = Course & {
  _count: { chapters: number };
  category: Category;
  chapters: Chapter[];
  imagePlaceholder: string;
  price: number | null;
  progress: number | null;
  validChapters: UserProgress[];
};

type GetDashboardCourses = {
  filter?: string | null;
  includeChapter?: boolean;
  userId: string;
};

export const getDashboardCourses = async ({
  filter,
  userId,
  includeChapter,
}: GetDashboardCourses) => {
  const purchasedCourses = await db.purchase.findMany({
    where: { userId },
    select: {
      course: {
        include: {
          _count: { select: { chapters: { where: { isPublished: true } } } },
          category: true,
          chapters: includeChapter,
        },
      },
    },
    orderBy: { course: { updatedAt: 'desc' } },
  });

  if (!purchasedCourses) {
    return {
      completedCourses: [],
      coursesInProgress: [],
      filterCourses: [],
    };
  }

  const courses = purchasedCourses
    .map((purchase) => purchase.course)
    .filter((course) => course.isPublished) as CourseWithProgressAndCategory[];

  for (const course of courses) {
    const { progressPercentage: progress, validChapters } = await getProgress({
      userId,
      courseId: course.id,
      includeValidChapters: includeChapter,
    });
    const imagePlaceholder = await getImagePlaceHolder(course.imageUrl!);

    course['imagePlaceholder'] = imagePlaceholder.base64;
    course['progress'] = progress;
    course['validChapters'] = validChapters;
  }

  const completedCourses = courses.filter((course) => course.progress === 100);
  const coursesInProgress = courses.filter((course) => (course.progress ?? 0) < 100);

  const filterCourses = (() => {
    if (filter === FilterStatus.PROGRESS) {
      return coursesInProgress;
    }

    if (filter === FilterStatus.COMPLETED) {
      return completedCourses;
    }

    return [...coursesInProgress, ...completedCourses];
  })();

  return {
    completedCourses,
    coursesInProgress,
    filterCourses,
  };
};
