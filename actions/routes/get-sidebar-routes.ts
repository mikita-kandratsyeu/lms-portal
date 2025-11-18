'use server';

import { IconName } from 'lucide-react/dynamic';
import { headers } from 'next/headers';

import db from '@/lib/db';

export type RouteItem = {
  customLabel?: string;
  href: string;
  icon?: IconName;
  isProtected: boolean;
  label: string;
};

export const getSideBarRoutes = async (): Promise<Record<string, RouteItem[]>> => {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname');

  const isPaymentsPage = pathname?.includes('/owner');

  let users = 0;
  let csmIssues = 0;

  if (isPaymentsPage) {
    csmIssues = await db.csmIssue.count();
    users = await db.user.count();
  }

  const studentRoutes = [
    {
      href: '/',
      icon: 'compass',
      isProtected: false,
      label: 'browse',
    },
    {
      href: '/dashboard',
      icon: 'layout',
      isProtected: true,
      label: 'dashboard',
    },
    {
      href: '/leaderboard',
      icon: 'crown',
      isProtected: true,
      label: 'leaderboard',
    },
  ] as RouteItem[];

  const teacherRoutes = [
    {
      href: '/teacher/courses',
      icon: 'list',
      isProtected: true,
      label: 'courses',
    },
    {
      href: '/teacher/analytics',
      isProtected: true,
      icon: 'bar-chart-4',
      label: 'analytics',
    },
  ] as RouteItem[];

  const settingsRoutes = [
    {
      href: '/settings/general',
      icon: 'settings-2',
      isProtected: true,
      label: 'general',
    },
    {
      href: '/settings/billing',
      icon: 'wallet-2',
      isProtected: true,
      label: 'billingAndSubscription',
    },
    {
      href: '/settings/notifications',
      icon: 'rss',
      isProtected: true,
      label: 'notifications',
    },
  ] as RouteItem[];

  const businessOwnerRoutes = [
    {
      href: '/owner',
      icon: 'landmark',
      isProtected: true,
      label: 'payments',
    },
    {
      href: '/owner/promo',
      icon: 'tags',
      isProtected: true,
      label: 'promo',
    },
    {
      customLabel: users > 0 ? users.toString() : '',
      href: '/owner/users',
      icon: 'users',
      isProtected: true,
      label: 'users',
    },
    {
      customLabel: csmIssues > 0 ? csmIssues.toString() : '',
      href: '/owner/csm',
      icon: 'logs',
      isProtected: true,
      label: 'csm',
    },
  ] as RouteItem[];

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

  return {
    businessOwnerRoutes,
    docsRoutes,
    settingsRoutes,
    studentRoutes,
    teacherRoutes,
  };
};
