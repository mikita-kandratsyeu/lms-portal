import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { PLATFORM_DESCRIPTION } from '@/constants/common';
import { decrypt } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Restricted',
  description: PLATFORM_DESCRIPTION,
};

type RestrictedPageProps = {
  searchParams: Promise<{ code: string }>;
};

const RestrictedPage = async ({ searchParams }: RestrictedPageProps) => {
  const { code } = await searchParams;

  const t = await getTranslations('restricted');

  const userInfo = JSON.parse(
    decrypt(decodeURIComponent(code), process.env.NEXTAUTH_SECRET as string),
  );

  return (
    <div className="relative h-full flex gap-y-4 items-center w-full">
      <div className="flex items-center gap-y-4 flex-col w-full text-muted-foreground">
        <h1 className="text-xl md:text-3xl font-semibold">{t('title')}</h1>
        <p className="text-sm md:text-lg text-center">{t('body')}</p>
        {userInfo?.email && <p className="text-sm mb-4">{userInfo.email}</p>}
        <Link href="/">
          <Button variant="secondary">{t('goBackHome')}</Button>
        </Link>
      </div>
    </div>
  );
};

export default RestrictedPage;
