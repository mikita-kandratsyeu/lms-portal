'use client';

import { Notification } from '@prisma/client';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';

import { UserProfileButton } from '@/components/auth/user-profile-button';
import { SearchInput } from '@/components/common/search-input';
import { Button, Skeleton } from '@/components/ui';
import { AuthStatus } from '@/constants/auth';
import { useCurrentUser } from '@/hooks/use-current-user';

import { Chat } from '../chat/chat';
import { Notifications } from '../notifications/notifications';

type NavBarRoutesProps = {
  globalProgress?: {
    progressPercentage: number;
    total: number;
    value: number;
  } | null;
  userNotifications?: Omit<Notification, 'userId'>[];
};

export const NavBarRoutes = ({ globalProgress, userNotifications }: NavBarRoutesProps) => {
  const t = useTranslations('navbar');

  const pathname = usePathname();
  const { user, status } = useCurrentUser();

  const isChatPage = pathname?.startsWith('/chat');
  const isCoursePage = pathname?.startsWith('/courses');
  const isOwnerPage = pathname?.startsWith('/owner');
  const isSearchPage = pathname === '/';
  const isSettingsPage = pathname?.startsWith('/settings');
  const isStudentPage = pathname?.includes('/chapter') && !pathname?.includes('/teacher');
  const isTeacherPage = pathname?.startsWith('/teacher');
  const isDocsPage = pathname?.startsWith('/docs');
  const isAiAgentsPage = pathname?.startsWith('/ai-agents');

  const isLoading = status === AuthStatus.LOADING;

  const showGoBackButton =
    isCoursePage ||
    isStudentPage ||
    isTeacherPage ||
    isChatPage ||
    isSettingsPage ||
    isDocsPage ||
    isOwnerPage ||
    isAiAgentsPage;

  return (
    <>
      {isLoading && (
        <div className="flex items-center space-x-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-[100px]" />
            <Skeleton className="h-3 w-[75px]" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      )}
      {!isLoading && (
        <div className="flex gap-x-2 items-center">
          {isSearchPage && (
            <Suspense>
              <div className="hidden md:block">
                <SearchInput />
              </div>
            </Suspense>
          )}
          {user?.userId && (
            <>
              {showGoBackButton && (
                <Link href="/">
                  <Button size="sm" variant="ghost">
                    <LogOut className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">
                      {t(
                        isTeacherPage || isOwnerPage || isChatPage || isDocsPage || isAiAgentsPage
                          ? 'exit'
                          : 'backTo',
                      )}
                    </span>
                  </Button>
                </Link>
              )}
              {!isChatPage && !isAiAgentsPage && <Chat />}
              <Notifications userNotifications={userNotifications} />
            </>
          )}
          <UserProfileButton globalProgress={globalProgress} />
        </div>
      )}
    </>
  );
};
