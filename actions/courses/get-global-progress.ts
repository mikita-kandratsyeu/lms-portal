'use server';

import { CHAPTER_XP } from '@/constants/courses';
import db from '@/lib/db';

export const getGlobalProgress = async (userId?: string) => {
  if (!userId) {
    return null;
  }

  try {
    const purchasedCourses = await db.purchase.findMany({
      where: {
        userId,
      },
      select: {
        course: {
          select: {
            chapters: { where: { isPublished: true }, select: { id: true } },
            isPublished: true,
          },
        },
      },
    });

    const publishedChapterIds = purchasedCourses
      .filter(({ course }) => course.isPublished)
      .flatMap((purchase) => purchase.course.chapters.map((chapter) => chapter.id));

    const validCompletedChapters = await db.userProgress.count({
      where: { userId, chapterId: { in: publishedChapterIds }, isCompleted: true },
    });

    const total = publishedChapterIds.length * CHAPTER_XP;
    const value = validCompletedChapters * CHAPTER_XP;

    return {
      progressPercentage: (value / total) * 100,
      total,
      value,
    };
  } catch (error) {
    console.error('[GET_GLOBAL_PROGRESS_ACTION]', error);

    return null;
  }
};
