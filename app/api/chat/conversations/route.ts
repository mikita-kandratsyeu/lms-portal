import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { CONVERSATION_ACTION, LIMIT_CONVERSATION_TITLE } from '@/constants/chat';
import { generateConversationTitle } from '@/lib/chat';
import db from '@/lib/db';

export const POST = async (req: NextRequest) => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const action = req.nextUrl.searchParams.get('action');

    if (action === CONVERSATION_ACTION.DELETE_ALL) {
      await db.chatConversation.deleteMany({
        where: { userId: user.userId },
      });
    }

    if (action === CONVERSATION_ACTION.NEW) {
      const { title } = await req.json();

      await db.chatConversation.updateMany({
        where: { userId: user?.userId },
        data: {
          position: {
            increment: 1,
          },
        },
      });

      const newChatConversation = await db.chatConversation.create({
        data: {
          position: 0,
          title: title?.slice(0, LIMIT_CONVERSATION_TITLE) || generateConversationTitle(),
          userId: user?.userId,
        },
        select: {
          id: true,
          title: true,
        },
      });

      return NextResponse.json({
        id: newChatConversation.id,
        title: newChatConversation.title,
        messages: [],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST_CHAT_CONVERSATION]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
