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
import { useToast } from '@/components/ui/use-toast';
import { useAiAgentStore } from '@/hooks/store/use-ai-agent-store';
import { useChatStore } from '@/hooks/store/use-chat-store';
import { fetcher } from '@/lib/fetcher';

type AiAgentSwitcherProps = {
  className?: string;
  isChat?: boolean;
};

export const AiAgentSwitcher = ({ isChat, className }: AiAgentSwitcherProps) => {
  const { toast } = useToast();

  const { connectedAgents, currentAgent, setCurrentAgent, setCurrentModel } = useAiAgentStore(
    (state) => ({
      connectedAgents: state.connectedAgents,
      currentAgent: state.currentAgent,
      setCurrentAgent: state.setCurrentAgent,
      setCurrentModel: state.setCurrentModel,
    }),
  );

  const { conversationId, isFetching, setIsFetching, setActiveFeature } = useChatStore((state) => ({
    conversationId: state.conversationId,
    isFetching: state.isFetching,
    setActiveFeature: state.setActiveFeature,
    setIsFetching: state.setIsFetching,
  }));

  const defaultAgent = useMemo(
    () => connectedAgents.find((agent) => agent.isDefault),
    [connectedAgents],
  );

  const handleValueChange = async (agentId: string) => {
    setIsFetching(true);

    try {
      const agent = connectedAgents.find((agent) => agent.id === agentId);

      if (agent) {
        setActiveFeature(AiModelFeature.text);
        setCurrentAgent(agent);
        setCurrentModel(agent.aiModels[0]);

        if (isChat) {
          await fetcher.patch(`/api/ai/agents/${agentId}`, {
            body: { chatConversationId: conversationId },
          });
        }
      }
    } catch (error) {
      toast({ isError: true });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className={className}>
      <Select defaultValue={currentAgent?.id || defaultAgent?.id} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full" disabled={isFetching}>
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
