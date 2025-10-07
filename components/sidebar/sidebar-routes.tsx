'use client';

import {
  BarChart4,
  Compass,
  Crown,
  Landmark,
  Layout,
  List,
  Logs,
  LucideIcon,
  Rss,
  Settings2,
  Tags,
  Users,
  Wallet2,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { AuthStatus } from '@/constants/auth';
import { useCurrentUser } from '@/hooks/use-current-user';

import { SubscriptionBanner } from '../common/subscription-banner';
import { SideBarItem } from './sidebar-item';

type RouteItem = {
  href: string;
  icon?: LucideIcon;
  isProtected: boolean;
  label: string;
};

const studentRoutes = [
  {
    href: '/',
    icon: Compass,
    isProtected: false,
    label: 'browse',
  },
  {
    href: '/dashboard',
    icon: Layout,
    isProtected: true,
    label: 'dashboard',
  },
  {
    href: '/leaderboard',
    icon: Crown,
    isProtected: true,
    label: 'leaderboard',
  },
];

const teacherRoutes = [
  {
    href: '/teacher/courses',
    icon: List,
    isProtected: true,
    label: 'courses',
  },
  {
    href: '/teacher/analytics',
    isProtected: true,
    icon: BarChart4,
    label: 'analytics',
  },
];

const settingsRoutes = [
  {
    href: '/settings/general',
    icon: Settings2,
    isProtected: true,
    label: 'general',
  },
  {
    href: '/settings/billing',
    icon: Wallet2,
    isProtected: true,
    label: 'billingAndSubscription',
  },
  {
    href: '/settings/notifications',
    icon: Rss,
    isProtected: true,
    label: 'notifications',
  },
];

const paymentsRoutes = [
  {
    href: '/owner',
    icon: Landmark,
    isProtected: true,
    label: 'payments',
  },
  {
    href: '/owner/promo',
    isProtected: true,
    label: 'promo',
    icon: Tags,
  },
  {
    href: '/owner/users',
    isProtected: true,
    label: 'users',
    icon: Users,
  },
  {
    href: '/owner/csm',
    isProtected: true,
    label: 'csm',
    icon: Logs,
  },
];

const docsRoutes = [
  {
    href: '/docs/cookies-policy',
    isProtected: false,
    label: 'cookies-policy',
  },
  {
    href: '/docs/terms',
    isProtected: false,
    label: 'terms',
  },
  {
    href: '/docs/privacy-policy',
    isProtected: false,
    label: 'privacy-policy',
  },
  {
    href: '/docs/releases',
    isProtected: false,
    label: 'releases',
  },
];

export const SideBarRoutes = () => {
  const { user, status } = useCurrentUser();
  const pathname = usePathname();

  const isSettingsPage = pathname?.includes('/settings');
  const isTeacherPage = pathname?.includes('/teacher');
  const isPaymentsPage = pathname?.includes('/owner');
  const isDocsPage = pathname?.includes('/docs');

  const isLoading = status === AuthStatus.LOADING;

  const routes: RouteItem[] = useMemo(() => {
    if (isSettingsPage) {
      return settingsRoutes;
    }

    if (isPaymentsPage) {
      return paymentsRoutes;
    }

    if (isDocsPage) {
      return docsRoutes;
    }

    return isTeacherPage ? teacherRoutes : studentRoutes;
  }, [isDocsPage, isPaymentsPage, isSettingsPage, isTeacherPage]);

  return (
    <div className="flex flex-col w-full h-full p-3 justify-between">
      <div className="flex flex-col w-full space-y-1.5">
        {routes.map((route) => (
          <SideBarItem
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
