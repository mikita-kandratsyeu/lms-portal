import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import db from '@/lib/db';

export const POST = async (req: NextRequest) => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const { messageId, feedback } = await req.json();

    if (!messageId) {
      return new NextResponse(ReasonPhrases.BAD_REQUEST, { status: StatusCodes.BAD_REQUEST });
    }

    const updatedFeedback = await db.chatMessageFeedback.upsert({
      where: { messageId },
      update: { feedback },
      create: {
        messageId,
        feedback,
      },
      include: { message: true },
    });

    return NextResponse.json(updatedFeedback);
  } catch (error) {
    console.error('[POST_CHAT_MESSAGE_FEEDBACK]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
