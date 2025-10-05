import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import db from '@/lib/db';

export const PATCH = async (
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

    const unpublishedChapter = await db.chapter.update({
      where: { id: chapterId, courseId },
      data: { isPublished: false },
    });

    const publishedChapterInCourse = await db.chapter.findMany({
      where: { courseId, isPublished: true },
    });

    if (!publishedChapterInCourse.length) {
      await db.course.update({ where: { id: courseId }, data: { isPublished: false } });
    }

    return NextResponse.json(unpublishedChapter);
  } catch (error) {
    console.error('[COURSES_CHAPTER_ID_UNPUBLISH]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
