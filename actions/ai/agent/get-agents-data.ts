'use server';

import { AiAgent, AiModel, User } from '@prisma/client';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import db from '@/lib/db';

export type AgentWithRelations = AiAgent & {
  aiModels: AiModel[];
  user: Pick<User, 'id' | 'name'> | null;
};

export type AgentAnalytic = { agentId: string; totalUses: number };

type GetAgentsData = {
  analytics: AgentAnalytic[];
  connectedAgents: AgentWithRelations[];
  defaultAgent: AgentWithRelations | null;
  privateOrDraftAgents: AgentWithRelations[];
  publicAgents: AgentWithRelations[];
};

export const getAgentsData = async (search?: string): Promise<GetAgentsData> => {
  const user = await getCurrentUser();

  const publicAgents = await db.aiAgent.findMany({
    where: {
      isDefault: false,
      isPublic: true,
      name: { contains: search, mode: 'insensitive' },
    },
    include: {
      aiModels: {
        orderBy: [{ isDefault: 'desc' }, { providerName: 'asc' }, { name: 'asc' }],
      },
      connectedUsers: { select: { userId: true } },
      user: { select: { id: true, name: true } },
    },
    orderBy: [{ isDefault: 'desc' }, { isDraft: 'desc' }, { updatedAt: 'desc' }],
  });

  const defaultAgent = await db.aiAgent.findFirst({
    where: { isDefault: true },
    include: {
      aiModels: {
        orderBy: [{ isDefault: 'desc' }, { providerName: 'asc' }, { name: 'asc' }],
      },
      connectedUsers: { select: { userId: true } },
      user: { select: { id: true, name: true } },
    },
  });

  const privateOrDraftsAgents = await db.aiAgent.findMany({
    where: {
      isDefault: false,
      isPublic: false,
      name: { contains: search, mode: 'insensitive' },
      userId: user?.userId,
    },
    include: {
      aiModels: {
        orderBy: [{ isDefault: 'desc' }, { providerName: 'asc' }, { name: 'asc' }],
      },
      connectedUsers: { select: { userId: true } },
      user: { select: { id: true, name: true } },
    },
    orderBy: [{ isDefault: 'desc' }, { isDraft: 'desc' }, { updatedAt: 'desc' }],
  });

  const usersPlatformAmount = await db.user.count();

  const allAgents = [...publicAgents, ...privateOrDraftsAgents];

  if (defaultAgent) {
    allAgents.push(defaultAgent);
  }

  const connectedAgents = allAgents.filter((agent) =>
    agent.connectedUsers
      .map((connectedUser) => connectedUser.userId)
      .includes(String(user?.userId)),
  );
  const connectedAgentIds = connectedAgents.map((agent) => agent.id);

  return {
    analytics: allAgents.map((agent) => ({
      agentId: agent.id,
      totalUses: agent.isDefault ? usersPlatformAmount : agent.connectedUsers.length,
    })),
    connectedAgents,
    defaultAgent: defaultAgent ?? null,
    privateOrDraftAgents: privateOrDraftsAgents.filter(
      (agent) => agent.isDraft && !connectedAgentIds.includes(agent.id),
    ),
    publicAgents: publicAgents.filter((agent) => !connectedAgentIds.includes(agent.id)),
  };
};
