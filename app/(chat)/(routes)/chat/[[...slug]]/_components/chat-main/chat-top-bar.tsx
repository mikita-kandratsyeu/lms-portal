'use client';

import { Eraser, Info, PanelRight, Share } from 'lucide-react';
import { memo } from 'react';

import { AgentConfiguration } from '@/components/ai/agent-configuration';
import { Button, Separator } from '@/components/ui';
import { useChatStore } from '@/hooks/store/use-chat-store';
import { cn } from '@/lib/utils';

type ChatTopBarProps = {
  isEmbed?: boolean;
};

const ChatTopBarComponent = ({ isEmbed = false }: ChatTopBarProps) => {
  const { chatMessages, conversationId } = useChatStore((state) => ({
    chatMessages: state.chatMessages,
    conversationId: state.conversationId,
  }));

  const messages = chatMessages[conversationId] ?? [];

  return (
    <div className={cn('w-full h-[75px]', !messages.length && 'h-full')}>
      {!isEmbed && (
        <div className="flex flex-1 text-base pt-4 px-4 items-center justify-between gap-x-4">
          <div className="flex flex-col  justify-center">
            <p className="line-clamp-1 font-semibold text-sm">Nova Copilot</p>
            <p className="text-muted-foreground text-xs">deepseek-chat</p>
          </div>
          <div className="flex gap-x-2 items-center">
            <Button variant="outline" title="Info">
              <Info className="h-4 w-4" />
            </Button>
            <Button variant="outline" title="Share">
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="outline" title="Clear">
              <Eraser className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="mx-2 h-8" />
            <AgentConfiguration>
              <Button variant="outline" title="Configuration">
                <PanelRight className="h-4 w-4" />
              </Button>
            </AgentConfiguration>
          </div>
        </div>
      )}
    </div>
  );
};

ChatTopBarComponent.displayName = 'ChatTopBar';

export const ChatTopBar = memo(ChatTopBarComponent);
