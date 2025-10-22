'use client';

import { Eraser, PanelRight, Share } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useState } from 'react';

import { AgentConfiguration } from '@/components/ai/agent-configuration';
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

  const { currentModel } = useAiAgentStore((state) => ({ currentModel: state.currentModel }));

  const [isFetching, setIsFetching] = useState(false);
  const [open, setOpen] = useState(false);

  const messages = chatMessages[conversationId] ?? [];
  const currentConversation = conversations.find(
    (conversation) => conversation.id === conversationId,
  );

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
      toast({ isError: true });
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
          <div className="flex flex-1 text-base pt-4 px-4 items-center justify-between gap-x-4">
            <div className="flex flex-col  justify-center">
              <p className="line-clamp-1 font-semibold text-sm">Nova Copilot</p>
              <p className="text-muted-foreground text-xs">{currentModel}</p>
            </div>
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
