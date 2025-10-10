'use client';

import { DynamicIcon, IconName } from 'lucide-react/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useCurrentUser } from '@/hooks/use-current-user';
import { cn } from '@/lib/utils';

import { AuthRedirect } from '../auth/auth-redirect';
import { TextBadge } from '../common/text-badge';

type SideBarItemProps = {
  customLabel?: string;
  href: string;
  icon?: IconName;
  isProtected?: boolean;
  label: string;
};

export const SideBarItem = ({ customLabel, href, icon, isProtected, label }: SideBarItemProps) => {
  const t = useTranslations('sidebar');

  const { user } = useCurrentUser();

  const pathname = usePathname();
  const router = useRouter();

  const isActive = useMemo(() => {
    if (pathname.startsWith('/settings') || pathname.startsWith('/owner')) {
      return pathname === href;
    }

    return (
      (pathname === '/' && href === '/') ||
      pathname === href ||
      pathname?.startsWith(`${href}/`) ||
      (pathname?.includes('/preview-course') && href == '/')
    );
  }, [href, pathname]);

  const ignoreLogin = Boolean(user?.userId || !isProtected);

  const handleClick = () => (ignoreLogin ? router.push(href) : null);

  return (
    <AuthRedirect ignore={ignoreLogin}>
      <button
        onClick={handleClick}
        type="button"
        className={cn(
          'flex w-full text-sm text-muted-foreground items-center py-3.5 px-3 hover:bg-muted rounded-lg transition-background group duration-300 ease-in-out',
          isActive && 'bg-muted text-primary font-medium',
        )}
      >
        <div className="flex justify-between items-center w-full text-left">
          <div className="flex justify-between items-center gap-x-2 flex-1">
            <p className="flex items-center gap-x-2 flex-1">
              {icon && (
                <DynamicIcon
                  name={icon}
                  size={20}
                  className={cn(
                    'h-5 w-5 font-medium',
                    isActive && 'text-primary font-medium animate-spin-once',
                  )}
                />
              )}
              {t(label)}
            </p>
            {customLabel && <TextBadge label={customLabel} />}
          </div>
        </div>
      </button>
    </AuthRedirect>
  );
};
