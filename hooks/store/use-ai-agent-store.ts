import { AiModel } from '@prisma/client';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { GetConnectedAgents } from '@/actions/ai/agent/get-connected-agents';

type AiAgentStore = {
  connectedAgents: GetConnectedAgents;
  currentAgent: GetConnectedAgents[0] | null;
  currentModel: AiModel | null;
  setConnectedAgents: (agents: GetConnectedAgents) => void;
  setCurrentAgent: (agent: GetConnectedAgents[0]) => void;
  setCurrentModel: (model: AiModel) => void;
};

export const useAiAgentStore = create<AiAgentStore, any>(
  persist(
    (set) => ({
      connectedAgents: [],
      currentAgent: null,
      currentModel: null,
      setConnectedAgents: (agents) => set({ connectedAgents: agents }),
      setCurrentAgent: (agent) => set({ currentAgent: agent }),
      setCurrentModel: (model) => set({ currentModel: model }),
    }),
    {
      name: 'ai-agent-store',
      partialize: (state) => ({
        currentAgent: state.currentAgent,
        currentModel: state.currentModel,
      }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
