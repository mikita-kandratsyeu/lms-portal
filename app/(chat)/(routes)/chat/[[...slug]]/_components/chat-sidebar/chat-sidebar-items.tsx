'use client';

import { EllipsisVertical, Globe, GlobeLock, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SyntheticEvent, useEffect, useState } from 'react';

import { Conversation } from '@/actions/chat/get-chat-conversations';
import { ChatConversationModal } from '@/components/modals/chat-conversation-modal';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { useChatStore } from '@/hooks/store/use-chat-store';
import { getChatMessages } from '@/lib/chat/chat';
import { fetcher } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

type ChatSideBarItemsProps = {
  conversations: Conversation[];
};

export const ChatSideBarItems = ({ conversations }: ChatSideBarItemsProps) => {
  const { toast } = useToast();

  const t = useTranslations('chat.conversation');

  const router = useRouter();

  const {
    chatMessages,
    conversationId,
    isFetching,
    setChatMessages,
    setConversationId,
    setIsFetching,
  } = useChatStore();

  const [clientConversations, setClientConversations] = useState(conversations);
  const [editTitleId, setEditTitleId] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const currentConversation = conversations.find(
    (conversation) => conversation.id === conversationId,
  );

  useEffect(() => {
    setClientConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    document.body.style.removeProperty('pointer-events');
  }, [open]);

  useEffect(() => {
    if (Object.keys(chatMessages).length !== conversations.length) {
      setConversationId(conversations[0].id);
      setChatMessages(getChatMessages(conversations));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations.length]);

  const handleOnClick = (event: SyntheticEvent, id: string) => {
    event.stopPropagation();

    setConversationId(id);

    if (editTitleId.length && id !== editTitleId) {
      setEditTitleId('');
    }

    router.replace('/chat');
  };

  const handleRemoveConversation = async (id: string) => {
    setIsFetching(true);

    try {
      fetcher.delete(`/api/chat/conversations/${id}`);

      toast({
        title: t('removed-conversation', {
          conversation: conversations.find((conversation) => conversation.id === id)?.title ?? '',
        }),
      });

      router.refresh();
    } catch (error) {
      console.error('[CHAT-SIDEBAR-ITEMS]', error);

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
          isEdit
          open={open}
          setOpen={setOpen}
        />
      )}
      <div>
        {clientConversations.map((conversation) => {
          const isActive = conversationId === conversation.id;
          const isShared = conversation.shared.isShared;

          return (
            <div key={conversation.id}>
              <div
                aria-hidden="true"
                className={cn(
                  'flex justify-between items-center transition-all duration-300 hover:bg-muted pr-2 hover:cursor-pointer text-sm text-muted-foreground font-[500] px-4 py-6',
                  isActive && 'text-primary bg-muted',
                  isFetching && 'cursor-not-allowed pointer-events-none',
                )}
                onClick={(event) => handleOnClick(event, conversation.id)}
              >
                <div className="flex items-center gap-x-2">
                  {isShared && (
                    <Globe
                      className={cn('w-4 h-4', isActive && 'text-primary animate-spin-once')}
                    />
                  )}
                  {!isShared && (
                    <GlobeLock
                      className={cn('w-4 h-4', isActive && 'text-primary animate-spin-once')}
                    />
                  )}
                  <div className="line-clamp-1 flex-1">{conversation.title}</div>
                </div>
                <div className="ml-auto flex items-center gap-x-2">
                  {isActive && (
                    <DropdownMenu open={actionMenuOpen} onOpenChange={setActionMenuOpen}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="h-4 w-4 p-0 outline-none"
                          variant="ghost"
                          disabled={isFetching}
                        >
                          <EllipsisVertical className="w-4 h-4 cursor-pointer hover:opacity-75 transition duration-300" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="hover:cursor-pointer"
                          disabled={isFetching}
                          onClick={() => setOpen(true)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          {t('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="hover:cursor-pointer text-red-500"
                          disabled={isFetching || conversations.length === 1}
                          onClick={() => handleRemoveConversation(conversation.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('remove')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
