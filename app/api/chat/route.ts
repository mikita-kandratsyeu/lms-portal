import { addMilliseconds } from 'date-fns';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { ChatCompletionRole as ChatRole } from 'openai/resources/index.mjs';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { ChatCompletionRole } from '@/constants/ai';
import db from '@/lib/db';

export const POST = async (req: NextRequest) => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const { conversationId, messages, model, image } = await req.json();

    if (!messages?.length || !conversationId) {
      return new NextResponse(ReasonPhrases.BAD_REQUEST, { status: StatusCodes.BAD_REQUEST });
    }

    await db.chatMessage.createManyAndReturn({
      data: messages.map(
        ({ id, content, role }: { id: string; content: string; role: ChatRole }) => ({
          id,
          content,
          conversationId,
          model,
          role,
          // Necessary for the correct order of messages in DB
          createdAt: new Date(
            role === ChatCompletionRole.USER ? Date.now() : addMilliseconds(Date.now(), 10),
          ),
        }),
      ),
    });

    if (image?.url) {
      await db.chatImageGenerationMessage.create({
        data: {
          messageId: image.messageId,
          model: image.model,
          revisedPrompt: image.revisedPrompt,
          url: image.url,
        },
      });
    }

    const messageIds = messages.map(({ id }: { id: string }) => id);

    const chatMessages = await db.chatMessage.findMany({
      where: { id: { in: messageIds } },
      orderBy: { createdAt: 'asc' },
      include: { imageGeneration: true },
    });

    return NextResponse.json({ messages: chatMessages });
  } catch (error) {
    console.error('[POST_CHAT]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
