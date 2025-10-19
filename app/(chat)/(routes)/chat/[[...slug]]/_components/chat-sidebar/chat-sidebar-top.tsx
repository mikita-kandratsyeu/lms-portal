'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ChatConversationModal } from '@/components/modals/chat-conversation-modal';
import { Button } from '@/components/ui';
import { Spinner } from '@/components/ui/spinner';
import { useChatStore } from '@/hooks/store/use-chat-store';

export const ChatSideBarTop = () => {
  const t = useTranslations('chat.conversation');

  const isFetching = useChatStore((state) => state.isFetching);

  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <ChatConversationModal open={open} setOpen={setOpen} />}
      <div className="w-full px-4 pb-2 pt-4 border-b">
        <Button
          className="w-full"
          disabled={isFetching}
          onClick={() => setOpen(true)}
          variant="secondary"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('add')}
        </Button>
        <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
          <div className="flex gap-x-1 items-center">
            <span>{t('conversations')}</span>
            {isFetching && <Spinner className="h-3 w-3 text-primary" />}
          </div>
        </div>
      </div>
    </>
  );
};
