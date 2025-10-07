'use server';

import { format, parseISO } from 'date-fns';

import { CHAPTER_XP } from '@/constants/courses';
import { isString } from '@/lib/guard';

import { getDashboardCourses } from '../courses/get-dashboard-courses';

export const getTimeMetric = async (userId: string) => {
  try {
    const courses = await getDashboardCourses({ userId, includeChapter: true });

    const allChapters = courses.filterCourses.flatMap((course) => course.chapters);
    const finishedChapters = courses.filterCourses
      .flatMap((course) => course.validChapters)
      .map((chapter) => ({
        ...chapter,
        durationSec: allChapters.find(({ id }) => chapter.chapterId === id)?.durationSec ?? 0,
      }));

    const groupedChapters = finishedChapters.reduce(
      (acc, progress) => {
        const chapter = allChapters.find((c) => c.id === progress.chapterId);
        if (!chapter) return acc;

        const course = courses.filterCourses.find((course) => course.id === chapter.courseId);

        const date = isString(progress.updatedAt)
          ? parseISO(progress.updatedAt)
          : progress.updatedAt;
        const dateKey = format(date, 'yyyy-MM');

        if (!acc[dateKey]) {
          acc[dateKey] = {
            amountOfChapters: 0,
            chapters: [],
            totalSpentTimeInSec: 0,
            courses: [],
            date,
            xp: 0,
          };
        }

        acc[dateKey].amountOfChapters += 1;
        acc[dateKey].totalSpentTimeInSec += chapter.durationSec ?? 0;
        acc[dateKey].xp += CHAPTER_XP;
        acc[dateKey].chapters.push({
          id: chapter.id,
          title: chapter.title,
        });
        acc[dateKey].courses = [
          ...acc[dateKey].courses,
          {
            chapterIds: course?.chapters.map((item) => item.id) ?? [],
            description: course?.description ?? '',
            id: course?.id ?? '',
            title: course?.title ?? '',
          },
        ].filter((course, index, self) => self.findIndex((c) => c.id === course.id) === index);

        return acc;
      },
      {} as Record<
        string,
        {
          amountOfChapters: number;
          chapters: { id: string; title: string }[];
          totalSpentTimeInSec: number;
          courses: { id: string; chapterIds: string[]; description: string; title: string }[];
          date: Date;
          xp: number;
        }
      >,
    );

    const totalSpentTimeInSec = Object.values(groupedChapters).reduce(
      (acc, current) => acc + current.totalSpentTimeInSec,
      0,
    );

    return { totalSpentTimeInSec, heatMap: groupedChapters };
  } catch (error) {
    console.error('[GET_TIME_METRIC]', error);

    return { totalSpentTimeInSec: 0, heatMap: {} };
  }
};
