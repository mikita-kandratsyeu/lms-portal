import { AiAgent } from '@prisma/client';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AiAgentStore = {
  currentAgent: AiAgent | null;
  currentModel: string | null;
  setCurrentAgent: (agent: AiAgent) => void;
  setCurrentModel: (model: string) => void;
};

export const useAiAgentStore = create<AiAgentStore, any>(
  persist(
    (set) => ({
      currentAgent: null,
      currentModel: null,
      setCurrentAgent: (agent) => set({ currentAgent: agent }),
      setCurrentModel: (model) => set({ currentModel: model }),
    }),
    {
      name: 'ai-agent-store',
      partialize: (state) => ({
        currentAgentId: state.currentAgent,
        currentModel: state.currentModel,
      }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
