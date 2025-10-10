'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { RouteItem } from '@/actions/routes/get-sidebar-routes';
import { AuthStatus } from '@/constants/auth';
import { useCurrentUser } from '@/hooks/use-current-user';

import { SubscriptionBanner } from '../common/subscription-banner';
import { SideBarItem } from './sidebar-item';

type SideBarRoutesProps = {
  routes: Record<string, RouteItem[]>;
};

export const SideBarRoutes = ({ routes }: SideBarRoutesProps) => {
  const { user, status } = useCurrentUser();
  const pathname = usePathname();

  const isSettingsPage = pathname?.includes('/settings');
  const isTeacherPage = pathname?.includes('/teacher');
  const isPaymentsPage = pathname?.includes('/owner');
  const isDocsPage = pathname?.includes('/docs');

  const isLoading = status === AuthStatus.LOADING;

  const mapRoutes = useMemo(() => {
    if (isSettingsPage) {
      return routes.settingsRoutes;
    }

    if (isPaymentsPage) {
      return routes.paymentsRoutes;
    }

    if (isDocsPage) {
      return routes.docsRoutes;
    }

    return isTeacherPage ? routes.teacherRoutes : routes.studentRoutes;
  }, [
    isDocsPage,
    isPaymentsPage,
    isSettingsPage,
    isTeacherPage,
    routes.docsRoutes,
    routes.paymentsRoutes,
    routes.settingsRoutes,
    routes.studentRoutes,
    routes.teacherRoutes,
  ]);

  return (
    <div className="flex flex-col w-full h-full p-3 justify-between">
      <div className="flex flex-col w-full space-y-1.5">
        {mapRoutes.map((route) => (
          <SideBarItem
            customLabel={route?.customLabel}
            href={route.href}
            icon={route?.icon}
            isProtected={route.isProtected}
            key={route.href}
            label={route.label}
          />
        ))}
      </div>
      {!isLoading && !user?.hasSubscription && <SubscriptionBanner />}
    </div>
  );
};
