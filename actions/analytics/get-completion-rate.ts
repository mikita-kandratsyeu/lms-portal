'use server';

import db from '@/lib/db';

export type CompletionRateStats = {
  averageCompletionRate: number;
  totalChapters: number;
  completedChapters: number;
};

export const getCompletionRateStats = async (): Promise<CompletionRateStats> => {
  try {
    const purchases = await db.purchase.findMany({
      select: {
        userId: true,
        course: {
          select: {
            chapters: {
              where: { isPublished: true },
              select: { id: true },
            },
          },
        },
      },
    });

    const slotKeys = new Set<string>();
    const chapterIds = new Set<string>();
    for (const purchase of purchases) {
      for (const chapter of purchase.course.chapters) {
        slotKeys.add(`${purchase.userId}:${chapter.id}`);
        chapterIds.add(chapter.id);
      }
    }
    const totalChapters = slotKeys.size;

    if (totalChapters === 0) {
      return {
        averageCompletionRate: 0,
        totalChapters: 0,
        completedChapters: 0,
      };
    }

    const completedProgress = await db.userProgress.findMany({
      where: {
        chapterId: { in: [...chapterIds] },
        isCompleted: true,
      },
      select: {
        userId: true,
        chapterId: true,
      },
    });

    const completedChapters = completedProgress.filter((p) =>
      slotKeys.has(`${p.userId}:${p.chapterId}`),
    ).length;

    const averageCompletionRate = (completedChapters / totalChapters) * 100;

    return {
      averageCompletionRate,
      totalChapters,
      completedChapters,
    };
  } catch (error) {
    console.error('[GET_COMPLETION_RATE_STATS_ACTION]', error);
    return {
      averageCompletionRate: 0,
      totalChapters: 0,
      completedChapters: 0,
    };
  }
};
