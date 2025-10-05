import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import db from '@/lib/db';

export const PUT = async (
  req: NextRequest,
  props: { params: Promise<{ courseId: string; chapterId: string }> },
) => {
  const { chapterId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const { isCompleted } = await req.json();

    const userProgress = await db.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId: user.userId,
          chapterId,
        },
      },
      update: {
        isCompleted,
      },
      create: { userId: user.userId, chapterId, isCompleted },
    });

    return NextResponse.json(userProgress);
  } catch (error) {
    console.error('[COURSES_CHAPTER_ID_PUBLISH]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
