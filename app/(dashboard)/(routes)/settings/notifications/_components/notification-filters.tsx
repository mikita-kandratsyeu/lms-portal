'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type NotificationFiltersProps = {
  activeFilter: 'all' | 'unread' | 'read';
  counts: {
    all: number;
    unread: number;
    read: number;
  };
};

export const NotificationFilters = ({ activeFilter, counts }: NotificationFiltersProps) => {
  const t = useTranslations('notifications');
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('filter', filter);
    params.set('pageIndex', '0');
    router.push(`?${params.toString()}`);
  };

  return (
    <Tabs value={activeFilter} onValueChange={handleFilterChange}>
      <TabsList>
        <TabsTrigger value="all">
          {t('all')} {counts.all > 0 && <span className="ml-1 text-xs">({counts.all})</span>}
        </TabsTrigger>
        <TabsTrigger value="unread">
          {t('unread')}{' '}
          {counts.unread > 0 && <span className="ml-1 text-xs">({counts.unread})</span>}
        </TabsTrigger>
        <TabsTrigger value="read">
          {t('readFilter')}{' '}
          {counts.read > 0 && <span className="ml-1 text-xs">({counts.read})</span>}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
