import { AgentAnalytic } from '@/actions/ai/agent/get-agents-data';

export const getTotalUses = (analytics: AgentAnalytic[], agentId: string) =>
  analytics.find((analytic) => analytic.agentId === agentId)?.totalUses ?? 0;
