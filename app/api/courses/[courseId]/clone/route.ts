import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { sleep } from 'openai/core.mjs';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { DELAY_MS } from '@/constants/paginations';
import db from '@/lib/db';
import { getBatchedItems } from '@/lib/utils';

export const POST = async (_: NextRequest, props: { params: Promise<{ courseId: string }> }) => {
  const { courseId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }
    const course = await db.course.findUnique({
      where: { id: courseId, userId: user.userId },
      include: { attachments: true, chapters: true },
    });

    if (!course) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const clonedCourse = await db.course.create({
      data: {
        categoryId: course.categoryId,
        customRates: course.customRates,
        customTags: course.customTags,
        description: course.description,
        imageUrl: course.imageUrl,
        isPremium: course.isPremium,
        isPublished: false,
        language: course.language,
        price: course.price,
        title: `[CLONE] ${course.title}`,
        userId: user.userId,
      },
    });

    const batchedAttachments = getBatchedItems(course.attachments);
    const batchedChapters = getBatchedItems(course.chapters);

    await batchedAttachments.reduce(
      async (prevAttachmentsPromise: Promise<any[]>, batch: any[], batchIndex: number) => {
        const prevAttachments = await prevAttachmentsPromise;

        if (batchIndex > 0) {
          await sleep(DELAY_MS);
        }

        const currentAttachments = await Promise.all(
          batch.map(async (attachment) => {
            await db.attachment.create({
              data: { url: attachment.url, courseId: clonedCourse.id, name: attachment.name },
            });
          }),
        );

        return prevAttachments.concat(currentAttachments);
      },
      Promise.resolve([] as any[]),
    );

    await batchedChapters.reduce(
      async (prevChaptersPromise: Promise<any[]>, batch: any[], batchIndex: number) => {
        const prevChapters = await prevChaptersPromise;

        if (batchIndex > 0) {
          await sleep(DELAY_MS);
        }

        const currentChapters = await Promise.all(
          batch.map(async (chapter) => {
            const clonedChapter = await db.chapter.create({
              data: {
                courseId: clonedCourse.id,
                description: chapter.description,
                durationSec: chapter.durationSec,
                imageUrl: chapter.imageUrl,
                isFree: chapter.isFree,
                isPublished: false,
                position: chapter.position,
                title: chapter.title,
                videoUrl: chapter.videoUrl,
              },
            });

            await db.muxData.create({
              data: {
                chapterId: clonedChapter.id,
                videoUrl: chapter.videoUrl,
              },
            });
          }),
        );

        return prevChapters.concat(currentChapters);
      },
      Promise.resolve([] as any[]),
    );

    return NextResponse.json({ success: true, courseId: clonedCourse.id });
  } catch (error) {
    console.error('[COURSE_ID_CLONE]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
