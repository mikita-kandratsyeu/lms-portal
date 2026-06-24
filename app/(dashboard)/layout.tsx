import { getCurrentUser } from '@/actions/auth/get-current-user';
import { getGlobalProgress } from '@/actions/courses/get-global-progress';
import { getCsmCategories } from '@/actions/csm/get-csm-categories';
import { getUserNotifications } from '@/actions/users/get-user-notifications';
import { Footer } from '@/components/footer/footer';

import { NavBar } from '../../components/navbar/navbar';
import { SideBar } from '../../components/sidebar/sidebar';

type DashboardLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const DashboardLayout = async ({ children }: DashboardLayoutProps) => {
  const user = await getCurrentUser();
  const globalProgress = await getGlobalProgress(user?.userId);
  const { notifications: userNotifications } = await getUserNotifications({
    userId: user?.userId,
    take: 5,
  });
  const categories = await getCsmCategories();

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <div className="h-[80px] top-[var(--promo-banner-height)] w-full z-[50] fixed">
          <NavBar globalProgress={globalProgress} userNotifications={userNotifications} />
        </div>
        <div className="hidden md:flex h-full w-64 flex-col fixed top-[var(--promo-banner-height)] bottom-0 z-[48]">
          <SideBar />
        </div>
        <main className="md:pl-64 pt-[calc(80px+var(--promo-banner-height))] h-full">
          {children}
        </main>
      </div>
      <Footer categories={categories} />
    </div>
  );
};

export default DashboardLayout;
