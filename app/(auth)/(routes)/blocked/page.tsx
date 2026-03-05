import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { PLATFORM_DESCRIPTION } from '@/constants/common';
import withCompanyLabel from '@/hoc/with-company-label';

export const metadata: Metadata = {
  title: 'Account Suspended',
  description: PLATFORM_DESCRIPTION,
};

type BlockedPageProps = {
  searchParams: Promise<{ reason?: string; until?: string }>;
};

const BlockedPage = async ({ searchParams }: BlockedPageProps) => {
  const { reason, until } = await searchParams;
  const t = await getTranslations('blocked');

  return (
    <div className="relative h-full flex gap-y-4 items-center w-full">
      <div className="flex items-center gap-y-4 flex-col w-full text-muted-foreground">
        <h1 className="text-xl md:text-3xl font-semibold">{t('title')}</h1>
        <p className="text-sm md:text-lg text-center px-4">{t('body')}</p>
        {reason && (
          <div className="flex flex-col items-center gap-1 mt-2">
            <p className="text-xs font-semibold uppercase tracking-wide">{t('reasonLabel')}</p>
            <p className="text-sm md:text-base text-center px-4 max-w-lg">
              {decodeURIComponent(reason)}
            </p>
          </div>
        )}
        {until ? (
          <p className="text-xs text-muted-foreground">
            {t('blockedUntilLabel')}: {new Date(decodeURIComponent(until)).toLocaleDateString()}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">{t('permanent')}</p>
        )}
        <Link href="/">
          <Button variant="secondary">{t('goBackHome')}</Button>
        </Link>
      </div>
    </div>
  );
};

export default withCompanyLabel(BlockedPage);
