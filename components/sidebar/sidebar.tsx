import { headers } from 'next/headers';

import { getSideBarRoutes } from '@/actions/routes/get-sidebar-routes';

import { SideBarRoutes } from './sidebar-routes';

export const SideBar = async () => {
  const headersList = await headers();
  const referer = headersList.get('referer') ?? '';

  const routes = await getSideBarRoutes(referer);

  return (
    <div className="h-full md:pt-[calc(80px+var(--promo-banner-height))] flex flex-col justify-between bg-white dark:bg-neutral-900 md:border-r">
      <SideBarRoutes routes={routes} />
    </div>
  );
};
