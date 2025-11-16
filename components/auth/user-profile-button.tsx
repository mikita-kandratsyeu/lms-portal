'use client';

import { BookMarked, BriefcaseBusiness, LogIn, LogOut, Settings2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { UserRole } from '@/constants/auth';
import { useCurrentUser } from '@/hooks/use-current-user';
import { isBusinessOwner } from '@/lib/owner';
import { getFallbackName } from '@/lib/utils';

import { LanguageSwitcher } from '../common/language-switcher';
import { ProgressBar } from '../common/progress-bar';
import { TextBadge } from '../common/text-badge';
import { ThemeSwitcher } from '../common/theme-switcher';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui';
import { AuthRedirect } from './auth-redirect';
import { LogoutButton } from './logout-button';

type UserProfileButtonProps = {
  globalProgress?: {
    progressPercentage: number;
    total: number;
    value: number;
  } | null;
};

export const UserProfileButton = ({ globalProgress }: UserProfileButtonProps) => {
  const t = useTranslations('profileButton');

  const router = useRouter();

  const { user } = useCurrentUser();

  const handleSettings = () => router.push('/settings/general');

  const isAdmin = user?.role === UserRole.ADMIN;
  const isTeacher = user?.role === UserRole.TEACHER;

  return user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="relative block hover:cursor-pointer">
        <Avatar className="w-[40px] h-[40px] border dark:border-muted-foreground">
          <AvatarImage src={user.image ?? ''} />
          <AvatarFallback>{getFallbackName(user.name as string)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[260px] mr-4 mt-1">
        <DropdownMenuLabel className="font-normal p-2">
          <div className="flex flex-col space-y-1">
            <div className="flex gap-1 items-center">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <div className="ml-1">
                {user.hasSubscription && <TextBadge label={t('premium')} variant="lime" />}
              </div>
            </div>
            <p className="text-xs leading-none text-muted-foreground">{t(user.role)}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-muted" />
        {globalProgress && globalProgress.total > 0 && (
          <>
            <div className="p-2 flex flex-col space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <p>{t('progress')}</p>
                <p>
                  {globalProgress.value}/{globalProgress.total}
                </p>
              </div>
              <ProgressBar
                showText={false}
                variant="success"
                size="sm"
                value={globalProgress.progressPercentage}
              />
            </div>
            <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-muted" />
          </>
        )}
        {isBusinessOwner(user.userId) && (
          <DropdownMenuItem className="hover:cursor-pointer" onClick={() => router.push('/owner')}>
            <BriefcaseBusiness className="h-4 w-4 mr-2" />
            {t('owner')}
          </DropdownMenuItem>
        )}
        {(isAdmin || isTeacher) && (
          <DropdownMenuItem
            className="hover:cursor-pointer"
            onClick={() => router.push('/teacher/courses')}
          >
            <BookMarked className="h-4 w-4 mr-2" />
            {t('teacher')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="hover:cursor-pointer" onClick={handleSettings}>
          <Settings2 className="mr-2 h-4 w-4" />
          {t('settings')}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-muted" />
        <LanguageSwitcher isMenu />
        <ThemeSwitcher isMenu />
        <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-muted" />
        <LogoutButton>
          <DropdownMenuItem className="hover:cursor-pointer text-red-500">
            <LogOut className="mr-2 h-4 w-4" />
            {t('logOut')}
          </DropdownMenuItem>
        </LogoutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <AuthRedirect>
      <Button variant="outline">
        <LogIn className="h-4 w-4 mr-2" />
        {t('login')}
      </Button>
    </AuthRedirect>
  );
};
