'use client';

import { Blocks, Plus } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { TextBadge } from '@/components/common/text-badge';
import { ChatConversationModal } from '@/components/modals/chat-conversation-modal';
import { Button } from '@/components/ui';
import { Spinner } from '@/components/ui/spinner';
import { useChatStore } from '@/hooks/store/use-chat-store';

type ChatSideBarTopProps = {
  agentsAmount?: number;
};

export const ChatSideBarTop = ({ agentsAmount }: ChatSideBarTopProps) => {
  const t = useTranslations('chat.conversation');

  const isFetching = useChatStore((state) => state.isFetching);

  const [openConversationModal, setOpenConversationModal] = useState(false);

  const handleConversationModal = () => setOpenConversationModal(true);

  return (
    <>
      {openConversationModal && (
        <ChatConversationModal open={openConversationModal} setOpen={setOpenConversationModal} />
      )}
      <div className="w-full px-4 pb-2 pt-4 border-b">
        <Button
          className="w-full"
          disabled={isFetching}
          onClick={handleConversationModal}
          title="Add"
          variant="secondary"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('add')}
        </Button>
        <Link
          className="w-full flex items-center mt-8 justify-between gap-x-2"
          href="/ai-agents/general"
          target="_blank"
          title={t('explore-ai-agents')}
        >
          <div className="w-full flex gap-x-2 items-center">
            <Blocks className="w-4 h-4" />
            <span className="text-sm font-semibold line-clamp-1">{t('explore-ai-agents')}</span>
          </div>
          {Boolean(agentsAmount) && <TextBadge label={String(agentsAmount)} />}
        </Link>
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
