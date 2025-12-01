'use server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import db from '@/lib/db';

export const getAgentData = async (agentId: string) => {
  const user = await getCurrentUser();

  const agent = await db.aiAgent.findUnique({
    where: {
      id: agentId,
      userId: user!.userId,
    },
    include: {
      aiModels: { orderBy: [{ isDefault: 'desc' }, { providerName: 'asc' }, { name: 'asc' }] },
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
