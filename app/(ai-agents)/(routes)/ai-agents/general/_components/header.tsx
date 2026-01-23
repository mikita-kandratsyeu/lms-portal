'use client';

import { PlusCircle, SearchIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button, Input } from '@/components/ui';
import { useDebounce } from '@/hooks/use-debounce';
import { useSearchLineParams } from '@/hooks/use-search-params';

export const Header = () => {
  const t = useTranslations('ai-agents.general.header');
  const [value, setValue] = useState('');

  const debouncedValue = useDebounce(value);

  useSearchLineParams({ search: debouncedValue });

  return (
    <div className="flex items-center pb-4 justify-between space-x-2 flex-row gap-y-4">
      <div className="relative w-full">
        <SearchIcon className="h-4 w-4 absolute top-3 left-3 text-primary" />
        {Boolean(value) && (
          <span className="hover:cursor-pointer" onClick={() => setValue('')}>
            <XIcon className="h-4 w-4 absolute top-3 right-3 text-primary" />
          </span>
        )}
        <Input
          className="w-full md:w-[264px] pl-9 pr-9 rounded-lg bg-neutral-100 dark:bg-neutral-900 focus-visible:ring-neutral-200 dark:focus-visible:ring-neutral-900/40 sm:max-w-sm"
          placeholder={t('searchPlaceholder')}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </div>
      <Link href="/ai-agents/create">
        <Button>
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:flex sm:ml-2">{t('createAgent')}</span>
        </Button>
      </Link>
    </div>
  );
};
