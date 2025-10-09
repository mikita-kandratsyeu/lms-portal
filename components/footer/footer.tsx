'use client';

import { CsmCategory } from '@prisma/client';
import { Copyright } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { AuthStatus } from '@/constants/auth';
import { OWNER_EMAIL } from '@/constants/common';
import { useCurrentUser } from '@/hooks/use-current-user';

import { LanguageSwitcher } from '../common/language-switcher';
import { LegalMenu } from '../common/legal-menu';
import { MadeWithLove } from '../common/made-with-love';
import { ThemeSwitcher } from '../common/theme-switcher';
import { CsmModal } from '../modals/csm/csm-modal';

type FooterProps = {
  categories: CsmCategory[];
};

export const Footer = ({ categories }: FooterProps) => {
  const t = useTranslations('footer');

  const { user, status } = useCurrentUser();

  const [open, setOpen] = useState(false);

  const showLanguageSwitcher = !user?.userId && status !== AuthStatus.LOADING;

  return (
    <>
      {open && <CsmModal categories={categories} open={open} setOpen={setOpen} />}
      <footer className="md:p-4 p-2 w-full border-t bg-white dark:bg-neutral-950">
        <div className="text-xs text-muted-foreground py-2 px-2 flex flex-col md:items-end md:ml-[255px]">
          {showLanguageSwitcher && (
            <div className="mb-4 flex gap-x-2">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
          )}
          <div className="flex flex-col mb-4 md:items-end">
            <div className="flex items-center">
              <Copyright className="h-3 w-3" />
              <span>&nbsp;{new Date().getFullYear()}&nbsp;</span>
              <span>{t('copyright')}</span>
            </div>
            <MadeWithLove className="mt-2" />
          </div>
          <div className="gap-1 md:gap-3 font-semibold flex flex-col md:flex-row">
            <button className="hover:cursor-pointer" onClick={() => setOpen(true)}>
              {t('reportIssue')}
            </button>
            <Link href={`mailto:${OWNER_EMAIL}`} target="_blank">
              {t('contact')}
            </Link>
            <LegalMenu />
          </div>
        </div>
      </footer>
    </>
  );
};
