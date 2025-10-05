'use server';

import db from '@/lib/db';

type GetProgress = { userId: string; courseId: string; includeValidChapters?: boolean };

export const getProgress = async ({ userId, courseId, includeValidChapters }: GetProgress) => {
  const publishedChapters = await db.chapter.findMany({
    where: { courseId, isPublished: true },
    select: { id: true },
  });

  const publishedChapterIds = publishedChapters.map(({ id }) => id);

  const validChapters = includeValidChapters
    ? await db.userProgress.findMany({
        where: { userId, chapterId: { in: publishedChapterIds }, isCompleted: true },
      })
    : [];

  const validCompletedChapters = await db.userProgress.count({
    where: { userId, chapterId: { in: publishedChapterIds }, isCompleted: true },
  });

  const progressPercentage = (validCompletedChapters / publishedChapterIds.length) * 100;

  return { progressPercentage, validChapters };
};
