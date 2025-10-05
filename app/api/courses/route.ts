import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { TEN_MINUTE_SEC } from '@/constants/common';
import { fetchCachedData } from '@/lib/cache';
import db from '@/lib/db';
import { isOwner } from '@/lib/owner';

export const GET = async (req: NextRequest) => {
  try {
    const user = await getCurrentUser();

    if (!isOwner(user?.userId)) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const searchParams = req.nextUrl.searchParams;

    const cid = searchParams.get('cid');
    const courseId = searchParams.get('courseId');

    const data = await fetchCachedData(
      `${cid}`,
      async () => {
        const course = courseId
          ? await db.course.findUnique({
              where: { id: courseId },
              include: { chapters: true },
            })
          : await db.course.findMany({ include: { chapters: true } });

        return course;
      },
      TEN_MINUTE_SEC,
    );

    if (!data) {
      return new NextResponse(ReasonPhrases.NOT_FOUND, { status: StatusCodes.NOT_FOUND });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[GET_COURSES_INFO]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const values = await req.json();

    const course = await db.course.create({ data: { userId: user.userId, ...values } });

    return NextResponse.json(course);
  } catch (error) {
    console.error('[POST_COURSES]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
