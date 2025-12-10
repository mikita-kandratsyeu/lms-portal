import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { LIMIT_CONNECTED_AI_AGENTS } from '@/constants/ai/general';
import db from '@/lib/db';

export const POST = async (_: NextRequest, props: { params: Promise<{ agentId: string }> }) => {
  try {
    const { agentId } = await props.params;
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const ownAgentsAmount = !user.hasSubscription
      ? await db.aiAgent.count({ where: { userId: user.userId } })
      : -1;

    if (ownAgentsAmount >= LIMIT_CONNECTED_AI_AGENTS) {
      return new NextResponse('The maximum number of agents created has been reached.', {
        status: StatusCodes.FORBIDDEN,
      });
    }

    const agent = await db.aiAgent.findUnique({
      where: { id: agentId },
      include: { aiModels: true, chatConversationStarters: true },
    });

    if (!agent) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const clonedAgent = await db.aiAgent.create({
      data: {
        description: agent.description,
        isDefault: false,
        isDraft: true,
        isPublic: false,
        isSystem: false,
        language: agent.language,
        name: `[CLONE] ${agent.name}`,
        pictureUrl: agent.pictureUrl,
        systemInstruction: agent.systemInstruction,
        systemTag: '',
        temperature: agent.temperature,
        userId: user.userId,
      },
    });

    if (agent.aiModels?.length) {
      const defaultModel = await db.aiModel.findFirst({ where: { isDefault: true } });

      await db.aiAgent.update({
        where: { id: clonedAgent.id },
        data: {
          aiModels: {
            set: [
              ...agent.aiModels.map((agent) => ({ id: agent.id })),
              ...(defaultModel ? [{ id: defaultModel.id }] : []),
            ],
          },
        },
      });
    }

    if (agent.chatConversationStarters?.length) {
      await db.chatConversationStarters.createMany({
        data: agent.chatConversationStarters.map((starter) => ({
          aiAgentId: clonedAgent.id,
          language: starter.language,
          text: starter.text,
        })),
      });
    }

    return NextResponse.json({ id: clonedAgent.id });
  } catch (error) {
    console.error('[POST_CLONE_AI_AGENT]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
