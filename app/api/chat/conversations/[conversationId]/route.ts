import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { CONVERSATION_ACTION } from '@/constants/chat';
import { generateConversationTitle } from '@/lib/chat/chat';
import db from '@/lib/db';

export const PATCH = async (
  req: NextRequest,
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

    const action = req.nextUrl.searchParams.get('action');

    if (action === CONVERSATION_ACTION.EMPTY_MESSAGES) {
      await db.chatMessage.deleteMany({ where: { conversationId } });
    }

    if (action === CONVERSATION_ACTION.EDIT) {
      const { title } = await req.json();

      const updatedConversation = await db.chatConversation.update({
        where: { id: conversationId },
        data: { title: title || generateConversationTitle() },
        select: { id: true, title: true },
      });

      return NextResponse.json(updatedConversation);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PATCH_CHAT_CONVERSATION]', error);

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

    await db.chatConversation.delete({ where: { id: conversationId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE_CHAT_CONVERSATION]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
