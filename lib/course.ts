import { differenceInSeconds } from 'date-fns/differenceInSeconds';

import { getCourses } from '@/actions/courses/get-courses';
import { ONE_WEEK_SEC } from '@/constants/common';
import { CourseLevel } from '@/constants/courses';

type Course = Awaited<ReturnType<typeof getCourses>>[0];

export const getGroupedCourseList = (courses: Course[], specificFilter = false) => {
  const topCourseIds: string[] = [];
  const newCourseIds: string[] = [];

  if (specificFilter) {
    const topPurchaseAmount = Math.max(
      ...courses.map((course) => course._count?.allPurchases ?? 0),
    );

    topCourseIds.push(
      ...courses
        .filter((course) => course._count?.allPurchases === topPurchaseAmount)
        .map((course) => course.id)
        .slice(0, 3),
    );

    newCourseIds.push(
      ...courses
        .filter((course) => {
          const difference = differenceInSeconds(course.updatedAt, Date.now());

          return Math.abs(difference) <= ONE_WEEK_SEC;
        })
        .map((course) => course.id),
    );
  }

  const groupedCourseList = courses.reduce<Record<string, Course[]>>((grouped, course) => {
    const categoryId =
      (specificFilter && course.isPremium ? CourseLevel.PREMIUM : course.categoryId) ?? '';

    if (!grouped[categoryId]) {
      grouped[categoryId] = [];
    }

    grouped[categoryId].push(course);

    return grouped;
  }, {});

  return { topCourseIds, newCourseIds, groupedCourseList };
};
