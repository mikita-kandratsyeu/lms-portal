'use server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import db from '@/lib/db';

export type GetConnectedAgents = Awaited<ReturnType<typeof getConnectedAgents>>;

export const getConnectedAgents = async () => {
  const user = await getCurrentUser();

  const connectedAgents = await db.aiAgent.findMany({
    where: { connectedUsers: { some: { userId: user?.userId } } },
    include: {
      chatConversationStarters: true,
      aiModels: { orderBy: [{ isDefault: 'desc' }, { providerName: 'asc' }, { name: 'asc' }] },
    },
    orderBy: [{ isDefault: 'desc' }, { isDraft: 'desc' }, { updatedAt: 'desc' }],
  });

  const defaultAgent = await db.aiAgent.findFirst({
    where: { isDefault: true },
    include: {
      chatConversationStarters: true,
      aiModels: { orderBy: [{ isDefault: 'desc' }, { providerName: 'asc' }, { name: 'asc' }] },
    },
  });

  return defaultAgent ? [defaultAgent, ...connectedAgents] : connectedAgents;
};
