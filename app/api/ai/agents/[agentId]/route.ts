import { ChatConversationStarters } from '@prisma/client';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import db from '@/lib/db';
import { isBusinessOwner } from '@/lib/owner';

export const PATCH = async (req: NextRequest, props: { params: Promise<{ agentId: string }> }) => {
  const { agentId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    if (!user.hasSubscription || !isBusinessOwner(user.userId)) {
      return new NextResponse(ReasonPhrases.FORBIDDEN, { status: StatusCodes.FORBIDDEN });
    }

    const {
      chatConversationStarters,
      description,
      modelIds,
      name,
      pictureUrl,
      systemInstruction,
      temperature,
    } = await req.json();

    const defaultModel = await db.aiModel.findFirst({ where: { isDefault: true } });

    const aiModelsData = Boolean(modelIds?.length) && {
      aiModels: {
        set: [
          ...modelIds.map((id: string) => ({ id })),
          ...(defaultModel ? [{ id: defaultModel.id }] : []),
        ],
      },
    };

    const chatConversationStartersData = Boolean(chatConversationStarters?.length) && {
      chatConversationStarters: {
        deleteMany: {},
        createMany: {
          data: chatConversationStarters.map((starter: ChatConversationStarters) => ({
            language: starter.language,
            text: starter.text,
          })),
        },
      },
    };

    const updatedAgent = await db.aiAgent.update({
      where: { id: agentId, userId: user.userId },
      data: {
        ...aiModelsData,
        ...chatConversationStartersData,
        description,
        name,
        pictureUrl,
        systemInstruction,
        temperature,
      },
      select: {
        aiModels: { select: { id: true, value: true } },
        chatConversationStarters: { select: { id: true, text: true, language: true } },
        id: true,
        name: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedAgent);
  } catch (error) {
    console.error('[AGENT_ID_PATCH]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

export const DELETE = async (_: NextRequest, props: { params: Promise<{ agentId: string }> }) => {
  const { agentId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    if (!user.hasSubscription || !isBusinessOwner(user.userId)) {
      return new NextResponse(ReasonPhrases.FORBIDDEN, { status: StatusCodes.FORBIDDEN });
    }

    const deletedAgent = await db.aiAgent.delete({ where: { id: agentId }, select: { id: true } });

    return NextResponse.json({ ...deletedAgent, success: true });
  } catch (error) {
    console.error('[AGENT_ID_DELETE]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
