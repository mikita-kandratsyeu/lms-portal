'use client';

import { CpuIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { IoChatboxEllipsesOutline as IoChatboxEllipsesOutlineIcon } from 'react-icons/io5';

import { absoluteUrl } from '@/lib/utils';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui';

type ChatContextMenuProps = { children: React.ReactNode };

export const ChatContextMenu = ({ children }: ChatContextMenuProps) => {
  const t = useTranslations('chat.conversation');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Link href={absoluteUrl('/chat')}>
          <DropdownMenuItem className="hover:cursor-pointer">
            <IoChatboxEllipsesOutlineIcon className="h-4 w-4 mr-2" />
            <span>{t('view')}</span>
          </DropdownMenuItem>
        </Link>
        <Link href={absoluteUrl('/ai-agents/general')}>
          <DropdownMenuItem className="hover:cursor-pointer">
            <CpuIcon className="h-4 w-4 mr-2" />
            <span>{t('ai-agents')}</span>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
