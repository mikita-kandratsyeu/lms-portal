import { getSideBarRoutes } from '@/actions/routes/get-sidebar-routes';

import { SideBarRoutes } from './sidebar-routes';

export const SideBar = async () => {
  const routes = await getSideBarRoutes();

  return (
    <div className="h-full md:pt-[80px] flex flex-col justify-between bg-white dark:bg-neutral-900 md:border-r">
      <SideBarRoutes routes={routes} />
    </div>
  );
};
