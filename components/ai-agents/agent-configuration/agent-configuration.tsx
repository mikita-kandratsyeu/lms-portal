'use client';

import { AiModelFeature } from '@prisma/client';
import { XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { Button } from '@/components/ui';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAiAgentStore } from '@/hooks/store/use-ai-agent-store';
import { useChatStore } from '@/hooks/store/use-chat-store';

import { AgentCard } from '../agent-card/agent-card';
import { AiAgentSwitcher } from './ai-agent-switcher';
import { AiModelSwitcher } from './ai-model-switcher';

type AgentConfigurationProps = {
  children: React.ReactNode;
};

export const AgentConfiguration = ({ children }: AgentConfigurationProps) => {
  const t = useTranslations('ai-agent.sheet');

  const { isFetching, setActiveFeature } = useChatStore((state) => ({
    isFetching: state.isFetching,
    setActiveFeature: state.setActiveFeature,
  }));

  const { connectedAgents, currentAgent, setCurrentAgent, setCurrentModel } = useAiAgentStore(
    (state) => ({
      connectedAgents: state.connectedAgents,
      currentAgent: state.currentAgent,
      setCurrentAgent: state.setCurrentAgent,
      setCurrentModel: state.setCurrentModel,
    }),
  );

  useEffect(() => {
    if (!currentAgent) {
      const defaultAgent = connectedAgents.find((agent) => agent.isDefault);

      if (defaultAgent) {
        setActiveFeature(AiModelFeature.text);
        setCurrentAgent(defaultAgent);
        setCurrentModel(defaultAgent?.aiModels[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full" side="rightCopilot">
        <SheetHeader>
          <SheetTitle>
            <div className="flex justify-between items-center">
              <h2>{t('general')}</h2>
              <SheetClose asChild>
                <Button variant="outline" disabled={isFetching}>
                  <XIcon className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100%-54px)] overflow-auto my-4">
          <div className="flex flex-col gap-y-6">
            <div className="flex flex-col gap-y-2">
              <h4 className="text-sm text-muted-foreground">{t('primaryLLM')}</h4>
              <AiModelSwitcher className="flex items-center w-full gap-x-2" />
            </div>
            <div className="flex flex-col gap-y-2">
              <div className="flex items-center gap-x-2">
                <h4 className="text-sm text-muted-foreground">AI Agent</h4>
              </div>
              <AiAgentSwitcher className="flex items-center w-full gap-x-2" />
            </div>
            <AgentCard agentId={currentAgent?.id} isConfigTab {...currentAgent} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
