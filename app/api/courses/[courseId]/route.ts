import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { deleteFiles } from '@/actions/uploadthing/delete-files';
import db from '@/lib/db';

export const PATCH = async (req: NextRequest, props: { params: Promise<{ courseId: string }> }) => {
  const { courseId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const values = await req.json();

    const course = await db.course.update({
      where: { id: courseId, userId: user.userId },
      data: { ...values },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('[COURSE_ID]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

export const DELETE = async (_: NextRequest, props: { params: Promise<{ courseId: string }> }) => {
  const { courseId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const course = await db.course.findUnique({
      where: { id: courseId, userId: user.userId },
      include: { chapters: { include: { muxData: true } }, attachments: true },
    });

    if (!course) {
      return new NextResponse(ReasonPhrases.NOT_FOUND, { status: StatusCodes.NOT_FOUND });
    }

    const attachmentFiles = course.attachments.reduce<string[]>((urls, attachment) => {
      const fileName = attachment?.url?.split('/').pop();

      if (fileName) {
        urls.push(fileName);
      }
      return urls;
    }, []);

    const videoFiles = course.chapters.reduce<string[]>((urls, chapter) => {
      const fileName = chapter?.muxData?.videoUrl?.split('/').pop();

      if (fileName) {
        urls.push(fileName);
      }
      return urls;
    }, []);

    await deleteFiles([
      ...attachmentFiles,
      ...videoFiles,
      ...(course?.imageUrl ? [course.imageUrl.split('/').pop()!] : []),
    ]);

    const deletedCourse = await db.course.delete({ where: { id: courseId } });

    return NextResponse.json(deletedCourse);
  } catch (error) {
    console.error('[COURSE_ID_DELETE]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
