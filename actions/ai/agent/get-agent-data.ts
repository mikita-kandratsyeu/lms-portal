'use server';

import {
  AiAgent,
  AiAgentConnection,
  AiModel,
  ChatConversationStarters,
  User,
} from '@prisma/client';

import db from '@/lib/db';

export type GetAgentDataResponse = {
  agent:
    | (AiAgent & {
        aiModels: AiModel[];
        chatConversationStarters: ChatConversationStarters[];
        user: Pick<User, 'id' | 'name'> | null;
        connectedUsers: Pick<AiAgentConnection, 'userId'>[];
      })
    | null;
  models: AiModel[];
};

type GetAgentDataArgs = {
  agentId?: string;
  includeAllModels?: boolean;
  userId?: string;
};

export const getAgentData = async ({
  agentId,
  includeAllModels,
  userId,
}: GetAgentDataArgs): Promise<GetAgentDataResponse> => {
  if (!agentId) {
    const agent = await db.aiAgent.findFirst({
      where: {
        isDefault: true,
      },
      include: {
        aiModels: { orderBy: [{ isDefault: 'desc' }, { providerName: 'asc' }, { name: 'asc' }] },
        chatConversationStarters: true,
        connectedUsers: { select: { userId: true } },
        user: { select: { id: true, name: true } },
      },
    });

    return { agent, models: [] };
  }

  const agent = await db.aiAgent.findUnique({
    where: {
      id: agentId,
      userId,
    },
    include: {
      aiModels: { orderBy: [{ isDefault: 'desc' }, { providerName: 'asc' }, { name: 'asc' }] },
      chatConversationStarters: true,
      connectedUsers: { select: { userId: true } },
      user: { select: { id: true, name: true } },
    },
  });

  if (!agent) {
    return { agent: null, models: [] };
  }

  let models: AiModel[] = [];

  if (includeAllModels) {
    models = await db.aiModel.findMany({
      orderBy: [{ isDefault: 'desc' }, { providerName: 'asc' }, { name: 'asc' }],
    });
  }

  return {
    agent,
    models,
  };
};
