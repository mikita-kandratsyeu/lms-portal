'use server';

import { AiAgent, AiModel, User } from '@prisma/client';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import db from '@/lib/db';

export type GetAgentData = {
  agent: (AiAgent & { aiModels: AiModel[]; user: Pick<User, 'id' | 'name'> | null }) | null;
  models: AiModel[];
};

export const getAgentData = async (agentId: string): Promise<GetAgentData> => {
  const user = await getCurrentUser();

  const agent = await db.aiAgent.findUnique({
    where: {
      id: agentId,
      userId: user!.userId,
    },
    include: {
      aiModels: { orderBy: [{ isDefault: 'desc' }, { providerName: 'asc' }, { name: 'asc' }] },
      user: { select: { id: true, name: true } },
    },
  });

  if (!agent) {
    return { agent: null, models: [] };
  }

  const models = await db.aiModel.findMany({
    orderBy: [{ isDefault: 'desc' }, { providerName: 'asc' }, { name: 'asc' }],
  });

  return {
    agent,
    models,
  };
};
