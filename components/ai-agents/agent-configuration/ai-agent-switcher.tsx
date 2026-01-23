'use client';

import { AiModelFeature } from '@prisma/client';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('ai-agents.switchers');
  const { connectedAgents, currentAgent, setCurrentAgent, setCurrentModel } = useAiAgentStore(
    (state) => ({
      connectedAgents: state.connectedAgents,
      currentAgent: state.currentAgent,
      setCurrentAgent: state.setCurrentAgent,
      setCurrentModel: state.setCurrentModel,
    }),
  );

  const { isFetching, setActiveFeature } = useChatStore((state) => ({
    isFetching: state.isFetching,
    setActiveFeature: state.setActiveFeature,
  }));

  const defaultAgent = useMemo(
    () => connectedAgents.find((agent) => agent.isDefault),
    [connectedAgents],
  );

  const selectedAgentId =
    currentAgent?.id && connectedAgents.some((agent) => agent.id === currentAgent.id)
      ? currentAgent.id
      : defaultAgent?.id ?? connectedAgents[0]?.id;

  const handleValueChange = (agentId: string) => {
    const agent = connectedAgents.find((item) => item.id === agentId);

    if (!agent) {
      return;
    }

    const model =
      agent.aiModels.find((item) => item.isDefault) ??
      agent.aiModels.find((item) => !item.features.includes('image')) ??
      agent.aiModels[0];

    if (model) {
      setCurrentModel(model);
    }

    setActiveFeature(AiModelFeature.text);
    setCurrentAgent(agent);
  };

  return (
    <div className={className}>
      <Select defaultValue={selectedAgentId} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full" disabled={isFetching}>
          <SelectValue placeholder={t('agentPlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {connectedAgents.map((agent) => (
              <SelectItem
                key={agent.id}
                className="text-sm hover:bg-muted transition-colors duration-200 ease-in-out hover:cursor-pointer line-clamp-2"
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
