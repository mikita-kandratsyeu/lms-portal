import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { deleteFiles } from '@/actions/uploadthing/delete-files';
import db from '@/lib/db';

export const DELETE = async (
  { nextUrl: { searchParams } }: NextRequest,
  props: { params: Promise<{ attachmentId: string; courseId: string }> },
) => {
  const { attachmentId, courseId } = await props.params;

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

    const attachmentName = searchParams.get('name');

    const attachment = await db.attachment.delete({
      where: { courseId, id: attachmentId },
    });

    if (attachmentName) {
      await deleteFiles([attachmentName]);
    }

    return NextResponse.json(attachment);
  } catch (error) {
    console.error('[ATTACHMENT_ID]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
