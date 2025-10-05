import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import db from '@/lib/db';

export const PATCH = async (_: NextRequest, props: { params: Promise<{ courseId: string }> }) => {
  const { courseId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const course = await db.course.findUnique({
      where: { id: courseId, userId: user.userId },
      include: { chapters: { include: { muxData: true } } },
    });

    if (!course) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const t = await getTranslations('courses.publish');

    const hasPublishedChapter = course.chapters.some((chapter) => chapter.isPublished);

    if (
      !course.categoryId ||
      !course.description ||
      !course.imageUrl ||
      !course.title ||
      !hasPublishedChapter
    ) {
      return new NextResponse(t('errors.missingRequiredFields'), {
        status: StatusCodes.BAD_REQUEST,
      });
    }

    const publishedCourse = await db.course.update({
      where: { id: courseId, userId: user.userId },
      data: { isPublished: true },
    });

    return NextResponse.json(publishedCourse);
  } catch (error) {
    console.error('[COURSES_ID_PUBLISH]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
