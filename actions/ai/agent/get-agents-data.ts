'use server';

import { AiAgent, AiModel, User } from '@prisma/client';

import db from '@/lib/db';

type AgentWithRelations = AiAgent & {
  aiModels: AiModel[];
  user: Pick<User, 'id' | 'name'> | null;
};

export const getAgentsData = async (): Promise<{
  connectedAgents: AgentWithRelations[];
  defaultAgent: AgentWithRelations | null;
  privateOrDraftAgents: AgentWithRelations[];
  publicAgents: AgentWithRelations[];
}> => {
  const agents = await db.aiAgent.findMany({
    include: {
      aiModels: {
        orderBy: [{ isDefault: 'desc' }, { providerName: 'asc' }, { name: 'asc' }],
      },
      user: { select: { id: true, name: true } },
    },
    orderBy: [{ isDefault: 'desc' }, { isDraft: 'desc' }, { updatedAt: 'desc' }],
  });

  const publicAgents = agents.filter(
    (agent) => agent.isPublic && !agent.isDefault,
  ) as AgentWithRelations[];
  const privateOrDraftAgents = agents.filter(
    (agent) => !agent.isPublic || agent.isDraft,
  ) as AgentWithRelations[];
  const defaultAgent = (agents.find((agent) => agent.isDefault) ??
    null) as AgentWithRelations | null;
  const connectedAgents: AgentWithRelations[] = [];

  return {
    connectedAgents,
    defaultAgent,
    privateOrDraftAgents,
    publicAgents,
  };
};
