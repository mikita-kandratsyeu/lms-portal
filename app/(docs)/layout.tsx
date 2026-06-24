import { getCurrentUser } from '@/actions/auth/get-current-user';
import { getGlobalProgress } from '@/actions/courses/get-global-progress';
import { getUserNotifications } from '@/actions/users/get-user-notifications';
import { NavBar } from '@/components/navbar/navbar';
import { SideBar } from '@/components/sidebar/sidebar';

type DocsLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const DocsLayout = async ({ children }: DocsLayoutProps) => {
  const user = await getCurrentUser();
  const globalProgress = await getGlobalProgress(user?.userId);
  const { notifications: userNotifications } = await getUserNotifications({
    userId: user?.userId,
    take: 5,
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 h-full">
        <div className="h-[80px] inset-y-0 w-full z-[50] fixed">
          <NavBar globalProgress={globalProgress} userNotifications={userNotifications} />
        </div>
        <div className="hidden md:flex h-full w-64 flex-col fixed inset-y-0 z-[48]">
          <SideBar />
        </div>
        <main className="md:pl-64 pt-[80px] h-full">{children}</main>
      </div>
    </div>
  );
};

export default DocsLayout;
