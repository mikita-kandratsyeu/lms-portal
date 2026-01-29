import { compareAsc } from 'date-fns/compareAsc';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { getAgentsAmount } from '@/actions/ai/agent/get-agents-amount';
import { getCurrentUser } from '@/actions/auth/get-current-user';
import { getChatConversations } from '@/actions/chat/get-chat-conversations';
import { getGlobalProgress } from '@/actions/courses/get-global-progress';
import { getUserNotifications } from '@/actions/users/get-user-notifications';
import db from '@/lib/db';
import { cn } from '@/lib/utils';

import { ChatNavBar } from './_components/chat-navbar/chat-navbar';
import { ChatSideBar } from './_components/chat-sidebar/chat-sidebar';

export const metadata: Metadata = {
  title: 'Nova Copilot',
  description: 'Nova Copilot',
  icons: {
    icon: '/assets/copilot.svg',
  },
};

type ChatLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ slug?: string[] }>;
}>;

const ChatLayout = async ({ children, params }: ChatLayoutProps) => {
  const { slug } = await params;

  const user = await getCurrentUser();

  const isEmbed = slug?.includes('embed');
  const isShared = slug?.includes('shared');

  if (!user?.userId && !isShared) {
    return redirect('/');
  }

  const globalProgress = await getGlobalProgress(user?.userId);
  const { notifications: userNotifications } = await getUserNotifications({
    userId: user?.userId,
    take: 5,
  });
  const conversations = isEmbed || isShared ? [] : await getChatConversations({});
  const agentsAmount = isEmbed || isShared ? 0 : await getAgentsAmount();

  if (slug?.length && !(isEmbed || isShared)) {
    notFound();
  }

  if (isShared) {
    const sharedConversation = await db.chatSharedConversation.findUnique({
      where: { id: slug?.[1] ?? '' },
      select: { isActive: true, isOnlyAuth: true, expireAt: true },
    });

    const isExpired = sharedConversation?.expireAt
      ? compareAsc(sharedConversation.expireAt, Date.now()) < 0
      : false;

    if (isExpired || !sharedConversation?.isActive || (sharedConversation?.isOnlyAuth && !user)) {
      notFound();
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 h-full">
        {!isEmbed && (
          <>
            <div className="h-[80px] inset-y-0 w-full z-[50] fixed">
              <ChatNavBar
                conversations={conversations}
                globalProgress={globalProgress}
                isShared={isShared}
                userNotifications={userNotifications}
              />
            </div>
            {!isShared && (
              <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-48">
                <ChatSideBar agentsAmount={agentsAmount} conversations={conversations} />
              </div>
            )}
          </>
        )}
        <main
          className={cn(
            isEmbed ? 'pt-[50px]' : 'pt-[80px]',
            !(isEmbed || isShared) && 'md:pl-80',
            'h-full',
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default ChatLayout;
