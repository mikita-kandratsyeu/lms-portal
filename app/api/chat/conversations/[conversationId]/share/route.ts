import { addMonths } from 'date-fns';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import db from '@/lib/db';

export const POST = async (
  _: NextRequest,
  props: { params: Promise<{ conversationId: string }> },
) => {
  const { conversationId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    if (!conversationId) {
      return new NextResponse(ReasonPhrases.BAD_REQUEST, { status: StatusCodes.BAD_REQUEST });
    }

    const newSharedConversation = await db.chatSharedConversation.create({
      data: {
        conversationId,
        expireAt: addMonths(Date.now(), 1),
        userId: user.userId,
      },
      select: { id: true, isActive: true, expireAt: true, isOnlyAuth: true },
    });

    return NextResponse.json(newSharedConversation);
  } catch (error) {
    console.error('[POST_CONVERSATION_SHARE]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

export const PATCH = async (
  req: NextRequest,
  props: { params: Promise<{ conversationId: string }> },
) => {
  const { conversationId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!user?.hasSubscription) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    if (!conversationId) {
      return new NextResponse(ReasonPhrases.BAD_REQUEST, { status: StatusCodes.BAD_REQUEST });
    }

    const { isActive, isOnlyAuth } = await req.json();

    const updatedSharedConversation = await db.chatSharedConversation.update({
      where: { conversationId },
      data: {
        expireAt: addMonths(Date.now(), 1),
        isActive: isActive ?? false,
        isOnlyAuth: isOnlyAuth ?? false,
      },
      select: { isActive: true, expireAt: true, isOnlyAuth: true },
    });

    return NextResponse.json(updatedSharedConversation);
  } catch (error) {
    console.error('[PATCH_CONVERSATION_SHARE]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

export const DELETE = async (
  _: NextRequest,
  props: { params: Promise<{ conversationId: string }> },
) => {
  const { conversationId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!user?.hasSubscription) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    if (!conversationId) {
      return new NextResponse(ReasonPhrases.BAD_REQUEST, { status: StatusCodes.BAD_REQUEST });
    }

    await db.chatSharedConversation.delete({ where: { conversationId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE_CONVERSATION_SHARE]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
