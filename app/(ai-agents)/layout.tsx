import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { getGlobalProgress } from '@/actions/courses/get-global-progress';
import { getCsmCategories } from '@/actions/csm/get-csm-categories';
import { getUserNotifications } from '@/actions/users/get-user-notifications';
import { Footer } from '@/components/footer/footer';
import { SideBar } from '@/components/sidebar/sidebar';

import { ChatNavBar } from '../(chat)/(routes)/chat/[[...slug]]/_components/chat-navbar/chat-navbar';

export const metadata: Metadata = {
  title: 'AI Agents',
  description: 'AI Agents',
  icons: {
    icon: '/assets/copilot.ico',
  },
};

type AiAgentsLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const AiAgentsLayout = async ({ children }: AiAgentsLayoutProps) => {
  const user = await getCurrentUser();

  if (!user?.userId) {
    return redirect('/');
  }

  const globalProgress = await getGlobalProgress(user?.userId);
  const { notifications: userNotifications } = await getUserNotifications({
    userId: user?.userId,
    take: 5,
  });
  const categories = await getCsmCategories();

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <div className="h-[80px] inset-y-0 w-full z-[50] fixed">
          <ChatNavBar
            globalProgress={globalProgress}
            isAiAgents
            userNotifications={userNotifications}
          />
        </div>
        <div className="hidden md:flex h-full w-64 flex-col fixed inset-y-0 z-[48]">
          <SideBar />
        </div>
        <main className="md:pl-64 pt-[80px] h-full">{children}</main>
      </div>
      <Footer categories={categories} />
    </div>
  );
};

export default AiAgentsLayout;
