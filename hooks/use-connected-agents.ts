'use client';

import { useEffect } from 'react';

import { GetConnectedAgents } from '@/actions/ai/agent/get-connected-agents';

import { useAiAgentStore } from './store/use-ai-agent-store';

export const useConnectedAgents = (connectedAgents: GetConnectedAgents) => {
  const { setConnectedAgents } = useAiAgentStore((state) => ({
    setConnectedAgents: state.setConnectedAgents,
  }));

  useEffect(() => {
    setConnectedAgents(connectedAgents);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
