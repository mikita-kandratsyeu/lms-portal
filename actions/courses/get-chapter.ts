'use server';

import { Attachment, Chapter } from '@prisma/client';

import db from '@/lib/db';
import { getImagePlaceHolder } from '@/lib/image';

type GetChapter = {
  chapterId: string;
  courseId: string;
  userId: string;
};

export const getChapter = async ({ chapterId, courseId, userId }: GetChapter) => {
  try {
    const purchase = await db.purchase.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    const course = await db.course.findUnique({
      where: { id: courseId, isPublished: true },
    });

    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        isPublished: true,
      },
    });

    let muxData = null;
    let attachments: Attachment[] = [];
    let nextChapter: Chapter | null = null;

    if (purchase) {
      attachments = await db.attachment.findMany({ where: { courseId } });
    }

    if (chapter?.isFree || purchase) {
      muxData = await db.muxData.findUnique({ where: { chapterId } });

      nextChapter = await db.chapter.findFirst({
        where: { courseId, isPublished: true, position: { gt: chapter?.position } },
        orderBy: { position: 'asc' },
      });
    }

    const userProgress = await db.userProgress.findUnique({
      where: {
        userId_chapterId: { userId, chapterId },
      },
    });

    const chapterImage = chapter?.imageUrl;
    let chapterImagePlaceholder = null;

    if (chapterImage) {
      chapterImagePlaceholder = await getImagePlaceHolder(chapterImage);
    }

    return {
      attachments,
      chapter,
      chapterImagePlaceholder: chapterImagePlaceholder?.base64 ?? '',
      course,
      language: course?.language,
      muxData,
      nextChapter,
      purchase,
      userProgress,
    };
  } catch (error) {
    console.error('[GET_CHAPTER_ACTION]', error);

    return {
      attachments: [],
      chapter: null,
      chapterImagePlaceholder: '',
      course: null,
      language: null,
      muxData: null,
      nextChapter: null,
      purchase: null,
      userProgress: null,
    };
  }
};
