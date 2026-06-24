'use client';

import { useEffect } from 'react';

import { Conversation } from '@/actions/chat/get-chat-conversations';
import { SubscriptionBanner } from '@/components/common/subscription-banner';
import { VoiceInboxPromoBanner } from '@/components/common/voice-inbox-promo-banner';
import { AuthStatus } from '@/constants/auth';
import { useChatStore } from '@/hooks/store/use-chat-store';
import { useCurrentUser } from '@/hooks/use-current-user';

import { ChatSideBarBottom } from './chat-sidebar-bottom';
import { ChatSideBarItems } from './chat-sidebar-items';
import { ChatSideBarTop } from './chat-sidebar-top';

type ChatSideBarProps = {
  agentsAmount?: number;
  conversations: Conversation[];
};

export const ChatSideBar = ({ agentsAmount, conversations }: ChatSideBarProps) => {
  const { user, status } = useCurrentUser();

  const { setConversations, storeConversations } = useChatStore((state) => ({
    setConversations: state.setConversations,
    storeConversations: state.conversations,
  }));

  useEffect(() => {
    setConversations(conversations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations]);

  const displayConversations = storeConversations.length > 0 ? storeConversations : conversations;
  const isLoading = status === AuthStatus.LOADING;

  return (
    <div className="h-full border-r flex flex-col justify-between shadow-sm bg-white dark:bg-neutral-900 md:pt-[80px]">
      <ChatSideBarTop agentsAmount={agentsAmount} />
      <div className="flex flex-col w-full overflow-y-auto h-full">
        <ChatSideBarItems conversations={displayConversations} />
      </div>
      {!isLoading && (
        <div className="flex flex-col gap-y-2 m-4 mb-0">
          <VoiceInboxPromoBanner />
          {!user?.hasSubscription && <SubscriptionBanner />}
        </div>
      )}
      <ChatSideBarBottom amountOfConversations={displayConversations.length} />
    </div>
  );
};
