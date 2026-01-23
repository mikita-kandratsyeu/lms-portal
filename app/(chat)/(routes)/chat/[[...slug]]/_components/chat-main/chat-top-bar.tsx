'use client';

import { Eraser, PanelRight, Share } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useState } from 'react';

import { AgentConfiguration } from '@/components/ai-agents/agent-configuration/agent-configuration';
import { ChatConversationModal } from '@/components/modals/chat-conversation-modal';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { Button, Separator } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { CONVERSATION_ACTION } from '@/constants/chat';
import { useAiAgentStore } from '@/hooks/store/use-ai-agent-store';
import { useChatStore } from '@/hooks/store/use-chat-store';
import { fetcher } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

type ChatTopBarProps = {
  isEmbed?: boolean;
};

const ChatTopBarComponent = ({ isEmbed = false }: ChatTopBarProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const { chatMessages, conversationId, conversations, setChatMessages } = useChatStore(
    (state) => ({
      chatMessages: state.chatMessages,
      conversationId: state.conversationId,
      conversations: state.conversations,
      setChatMessages: state.setChatMessages,
    }),
  );

  const { isFetching, setIsFetching } = useChatStore((state) => ({
    isFetching: state.isFetching,
    setIsFetching: state.setIsFetching,
  }));
  const { currentAgent, currentModel } = useAiAgentStore((state) => ({
    currentAgent: state.currentAgent,
    currentModel: state.currentModel,
  }));

  const [open, setOpen] = useState(false);

  const messages = chatMessages[conversationId] ?? [];
  const currentConversation = conversations.find(
    (conversation) => conversation.id === conversationId,
  );

  const hasAgent = currentAgent?.name && currentModel?.name;

  const handleChatAction = async (action: 'clear' | 'share') => {
    setIsFetching(true);
    try {
      if (action === 'clear' && conversationId) {
        const updatedChatMessages = {
          ...chatMessages,
          [conversationId]: [],
        };

        await fetcher.patch(
          `/api/chat/conversations/${conversationId}?action=${CONVERSATION_ACTION.EMPTY_MESSAGES}`,
        );

        setChatMessages(updatedChatMessages);
      }

      router.refresh();
    } catch (error) {
      console.error('[CHAT_TOP_BAR_ACTION]', error);
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <>
      {open && (
        <ChatConversationModal
          initialData={currentConversation}
          isShare
          open={open}
          setOpen={setOpen}
        />
      )}
      <div className={cn('w-full h-[75px]', !messages.length && 'h-full')}>
        {!isEmbed && (
          <div
            className={cn(
              'flex flex-1 text-base pt-4 px-4 items-center gap-x-4',
              hasAgent ? 'justify-between' : 'justify-end',
            )}
          >
            {hasAgent && (
              <div className="flex flex-col justify-center">
                <p className="line-clamp-1 font-semibold text-sm">{currentAgent.name}</p>
                <p className="text-muted-foreground text-xs">{currentModel.name}</p>
              </div>
            )}
            <div className="flex gap-x-2 items-center">
              <Button
                disabled={isFetching}
                onClick={() => setOpen(true)}
                title="Share"
                variant="outline"
              >
                <Share className="h-4 w-4" />
              </Button>
              <ConfirmModal onConfirm={() => handleChatAction('clear')}>
                <Button variant="outline" title="Clear" disabled={isFetching}>
                  <Eraser className="h-4 w-4" />
                </Button>
              </ConfirmModal>
              <Separator orientation="vertical" className="mx-2 h-8" />
              <AgentConfiguration>
                <Button variant="outline" title="Configuration" disabled={isFetching}>
                  <PanelRight className="h-4 w-4" />
                </Button>
              </AgentConfiguration>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

ChatTopBarComponent.displayName = 'ChatTopBar';

export const ChatTopBar = memo(ChatTopBarComponent);
