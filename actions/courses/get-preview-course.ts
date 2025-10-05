'use server';

import db from '@/lib/db';
import { getImagePlaceHolder } from '@/lib/image';

type GetPreviewCourse = {
  courseId?: string;
  userId?: string;
};

export const getPreviewCourse = async ({ courseId, userId }: GetPreviewCourse) => {
  const purchase = await db.purchase.findUnique({
    where: { userId_courseId: { userId: userId ?? '', courseId: courseId ?? '' } },
    select: { id: true },
  });

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      _count: {
        select: {
          chapters: { where: { isPublished: true } },
        },
      },
      chapters: {
        orderBy: { position: 'asc' },
        take: 1,
      },
      user: {
        select: {
          name: true,
        },
      },
      category: true,
    },
  });

  const chapters = await db.chapter.findMany({
    where: { courseId: course?.id },
    select: { durationSec: true },
  });

  const fees = await db.fee.findMany({ orderBy: { name: 'asc' } });

  const chapterImage = course?.chapters[0]?.imageUrl;
  let chapterImagePlaceholder = null;

  if (chapterImage) {
    chapterImagePlaceholder = await getImagePlaceHolder(chapterImage);
  }

  return {
    chapterImagePlaceholder: chapterImagePlaceholder?.base64 ?? '',
    course,
    durationInSec: chapters.reduce((acc, current) => acc + (current.durationSec ?? 0), 0),
    fees,
    hasPurchase: Boolean(purchase?.id),
  };
};
