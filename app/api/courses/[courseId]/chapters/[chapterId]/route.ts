import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import db from '@/lib/db';

export const DELETE = async (
  _: NextRequest,
  props: { params: Promise<{ courseId: string; chapterId: string }> },
) => {
  const { chapterId, courseId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const courseOwner = await db.course.findUnique({
      where: { id: courseId, userId: user.userId },
    });

    if (!courseOwner) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const chapter = await db.chapter.findUnique({
      where: { id: chapterId, courseId },
    });

    if (!chapter) {
      return new NextResponse(ReasonPhrases.NOT_FOUND, { status: StatusCodes.NOT_FOUND });
    }

    const url = chapter.videoUrl ?? chapter.imageUrl;

    if (url) {
      const existingMuxData = await db.muxData.findFirst({
        where: { chapterId },
      });

      if (existingMuxData) {
        await db.muxData.delete({ where: { id: existingMuxData.id } });
      }
    }

    const deletedChapter = await db.chapter.delete({ where: { id: chapterId } });

    const publishedChaptersInCourse = await db.chapter.findMany({
      where: { courseId, isPublished: true },
    });

    if (!publishedChaptersInCourse.length) {
      await db.course.update({ where: { id: courseId }, data: { isPublished: false } });
    }

    return NextResponse.json(deletedChapter);
  } catch (error) {
    console.error('[COURSES_CHAPTER_ID_DELETE]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

export const PATCH = async (
  req: NextRequest,
  props: { params: Promise<{ courseId: string; chapterId: string }> },
) => {
  const { chapterId, courseId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const courseOwner = await db.course.findUnique({
      where: { id: courseId, userId: user.userId },
    });

    if (!courseOwner) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const values = await req.json();

    const chapter = await db.chapter.update({
      where: { id: chapterId, courseId },
      data: {
        ...values,
        ...(values.imageUrl && { imageUrl: values.imageUrl, videoUrl: '' }),
        ...(values.videoUrl && { videoUrl: values.videoUrl, imageUrl: '' }),
        ...(Number(values.durationSec) > 0 && { durationSec: Number(values.durationSec) }),
      },
    });

    const url = values.videoUrl ?? values.imageUrl;

    if (url) {
      const existingMuxData = await db.muxData.findFirst({
        where: { chapterId },
      });

      if (existingMuxData) {
        await db.muxData.delete({ where: { id: existingMuxData.id } });
      }

      await db.muxData.create({
        data: {
          chapterId,
          videoUrl: url,
        },
      });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.error('[COURSES_CHAPTER_ID]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
