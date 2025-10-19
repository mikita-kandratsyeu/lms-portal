'use client';

import { Conversation } from '@/actions/chat/get-chat-conversations';
import { SubscriptionBanner } from '@/components/common/subscription-banner';
import { AuthStatus } from '@/constants/auth';
import { useCurrentUser } from '@/hooks/use-current-user';

import { ChatSideBarBottom } from './chat-sidebar-bottom';
import { ChatSideBarItems } from './chat-sidebar-items';
import { ChatSideBarTop } from './chat-sidebar-top';

type ChatSideBarProps = {
  conversations: Conversation[];
};

export const ChatSideBar = ({ conversations }: ChatSideBarProps) => {
  const { user, status } = useCurrentUser();

  const isLoading = status === AuthStatus.LOADING;

  return (
    <div className="h-full border-r flex flex-col justify-between shadow-sm bg-white dark:bg-neutral-900 md:pt-[80px]">
      <ChatSideBarTop />
      <div className="flex flex-col w-full overflow-y-auto h-full">
        <ChatSideBarItems conversations={conversations} />
      </div>
      {!isLoading && !user?.hasSubscription && <SubscriptionBanner className="m-4" />}
      <ChatSideBarBottom amountOfConversations={conversations.length} />
    </div>
  );
};
