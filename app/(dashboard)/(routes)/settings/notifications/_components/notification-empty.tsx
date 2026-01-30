'use client';

import { Bell, BellOff, Inbox } from 'lucide-react';
import { useTranslations } from 'next-intl';

type NotificationEmptyProps = {
  filter: 'all' | 'unread' | 'read';
};

export const NotificationEmpty = ({ filter }: NotificationEmptyProps) => {
  const t = useTranslations('notifications');

  const config = {
    all: {
      icon: Inbox,
      title: t('notFound'),
      description: t('emptyAllDescription'),
    },
    unread: {
      icon: Bell,
      title: t('upToDate'),
      description: t('notFoundAtTheMoment'),
    },
    read: {
      icon: BellOff,
      title: t('emptyReadTitle'),
      description: t('emptyReadDescription'),
    },
  };

  const { icon: Icon, title, description } = config[filter];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
};
