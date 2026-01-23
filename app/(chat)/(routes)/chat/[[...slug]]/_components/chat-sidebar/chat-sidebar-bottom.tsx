'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { ConfirmModal } from '@/components/modals/confirm-modal';
import { Button } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { CONVERSATION_ACTION } from '@/constants/chat';
import { useChatStore } from '@/hooks/store/use-chat-store';
import { fetcher } from '@/lib/fetcher';

type ChatSideBarBottomProps = { amountOfConversations?: number };

export const ChatSideBarBottom = ({ amountOfConversations }: ChatSideBarBottomProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const t = useTranslations('chat.conversation');

  const { isFetching, setIsFetching, setConversationId, setChatMessages } = useChatStore(
    (state) => ({
      isFetching: state.isFetching,
      setChatMessages: state.setChatMessages,
      setConversationId: state.setConversationId,
      setIsFetching: state.setIsFetching,
    }),
  );

  const handleDeleteConversations = async () => {
    setIsFetching(true);

    try {
      await fetcher.post(`/api/chat/conversations?action=${CONVERSATION_ACTION.DELETE_ALL}`, {
        responseType: 'json',
      });
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsFetching(false);
      setConversationId('');
      setChatMessages({});
    }

    router.refresh();
  };

  return (
    <div className="w-full p-4 border-t">
      <ConfirmModal onConfirm={handleDeleteConversations}>
        <Button
          className="w-full"
          variant="secondary"
          disabled={isFetching || amountOfConversations === 1}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {t('delete-all')}
        </Button>
      </ConfirmModal>
    </div>
  );
};
