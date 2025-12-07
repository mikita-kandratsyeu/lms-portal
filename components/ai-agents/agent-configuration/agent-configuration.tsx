'use client';

import { XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

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

import { AgentCard } from '../agent-card/agent-card';
import { AiAgentSwitcher } from './ai-agent-switcher';
import { AiModelSwitcher } from './ai-model-switcher';

type AgentConfigurationProps = {
  children: React.ReactNode;
};

export const AgentConfiguration = ({ children }: AgentConfigurationProps) => {
  const t = useTranslations('ai-agent.sheet');

  const { currentAgent } = useAiAgentStore((state) => ({
    currentAgent: state.currentAgent,
  }));

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full" side="rightCopilot">
        <SheetHeader>
          <SheetTitle>
            <div className="flex justify-between items-center">
              <h2>{t('general')}</h2>
              <SheetClose asChild>
                <Button variant="outline">
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
              <h4 className="text-sm text-muted-foreground">AI Agent</h4>
              <AiAgentSwitcher className="flex items-center w-full gap-x-2" />
            </div>
            <AgentCard agentId={currentAgent?.id} isConfigTab {...currentAgent} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
