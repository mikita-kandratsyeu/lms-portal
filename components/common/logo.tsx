'use client';

import { Baloo_2 } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { useAppConfigStore } from '@/hooks/store/use-app-config-store';
import { cn } from '@/lib/utils';

const baloo2 = Baloo_2({ subsets: ['latin'], weight: ['400', '500'] });

type LogoProps = {
  isCopilot?: boolean;
  isLoader?: boolean;
  onlyDarkMode?: boolean;
  onlyLogoIcon?: boolean;
};

export const Logo = ({
  isCopilot = false,
  isLoader = false,
  onlyDarkMode = false,
  onlyLogoIcon = false,
}: LogoProps) => {
  const t = useTranslations('app');

  const { config } = useAppConfigStore((state) => ({
    config: state.config,
  }));

  const Logo = () => (
    <div
      className={cn(
        'items-center gap-x-3 md:flex group',
        !isLoader && 'hidden',
        !onlyLogoIcon && 'hover:opacity-75 transition-opacity',
      )}
    >
      <Image
        alt={`${isCopilot ? 'Copilot' : t('name')} Logo`}
        className={cn(
          isCopilot && isLoader && 'animate-spin',
          isCopilot && 'group-hover:animate-spin-once',
        )}
        height={40}
        src={`/assets/${isCopilot ? 'copilot' : 'logo'}.svg`}
        width={40}
      />
      {!onlyLogoIcon && (
        <div className={cn(baloo2.className, isLoader && 'hidden md:block')}>
          <p
            className={cn(
              'font-semibold text-base flex items-center gap-1.5',
              onlyDarkMode ? 'text-neutral-300' : 'text-neutral-700 dark:text-neutral-300',
            )}
          >
            {isCopilot ? 'Nova Copilot' : t('name')}
            {config?.features?.testMode && (
              <span
                className={cn(
                  'rounded px-1 py-px text-xs font-medium uppercase tracking-wider',
                  onlyDarkMode
                    ? 'bg-neutral-600 text-neutral-200'
                    : 'bg-primary/15 text-primary dark:bg-primary/20',
                )}
              >
                Beta
              </span>
            )}
          </p>
          <p className={cn(onlyDarkMode ? 'text-neutral-400' : 'text-muted-foreground', 'text-xs')}>
            {t(isCopilot ? 'description-ai' : 'description')}
          </p>
        </div>
      )}
    </div>
  );

  return onlyLogoIcon ? (
    <Logo />
  ) : (
    <Link href="/">
      <Logo />
    </Link>
  );
};
