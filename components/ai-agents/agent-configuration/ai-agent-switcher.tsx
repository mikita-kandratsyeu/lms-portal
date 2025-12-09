'use client';

import { AiModelFeature } from '@prisma/client';
import { useMemo } from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { useAiAgentStore } from '@/hooks/store/use-ai-agent-store';
import { useChatStore } from '@/hooks/store/use-chat-store';

type AiAgentSwitcherProps = {
  className?: string;
};

export const AiAgentSwitcher = ({ className }: AiAgentSwitcherProps) => {
  const { connectedAgents, currentAgent, setCurrentAgent, setCurrentModel } = useAiAgentStore(
    (state) => ({
      connectedAgents: state.connectedAgents,
      currentAgent: state.currentAgent,
      setCurrentAgent: state.setCurrentAgent,
      setCurrentModel: state.setCurrentModel,
    }),
  );

  const { setActiveFeature } = useChatStore((state) => ({
    setActiveFeature: state.setActiveFeature,
  }));

  const defaultAgent = useMemo(
    () => connectedAgents.find((agent) => agent.isDefault),
    [connectedAgents],
  );

  const handleValueChange = (agentId: string) => {
    const agent = connectedAgents.find((agent) => agent.id === agentId);

    if (agent) {
      setActiveFeature(AiModelFeature.text);
      setCurrentAgent(agent);
      setCurrentModel(agent.aiModels[0]);
    }
  };

  return (
    <div className={className}>
      <Select onValueChange={handleValueChange} defaultValue={currentAgent?.id || defaultAgent?.id}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an agent" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {connectedAgents.map((agent) => (
              <SelectItem
                key={agent.id}
                className="text-sm hover:bg-muted transition-colors duration-200 ease-in-out hover:cursor-pointer line-clamp-1"
                value={agent.id}
              >
                <p>{agent.name}</p>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
