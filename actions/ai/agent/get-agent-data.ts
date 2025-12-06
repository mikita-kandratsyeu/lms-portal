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
  agentId: string;
  isPreviewPage?: boolean;
  userId?: string;
};

export const getAgentData = async ({
  agentId,
  isPreviewPage,
  userId,
}: GetAgentDataArgs): Promise<GetAgentDataResponse> => {
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

  if (!isPreviewPage) {
    models = await db.aiModel.findMany({
      orderBy: [{ isDefault: 'desc' }, { providerName: 'asc' }, { name: 'asc' }],
    });
  }

  return {
    agent,
    models,
  };
};
