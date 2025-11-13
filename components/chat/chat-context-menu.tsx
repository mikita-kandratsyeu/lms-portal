'use client';

import { Cpu, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { IoChatboxEllipsesOutline } from 'react-icons/io5';

import { absoluteUrl } from '@/lib/utils';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui';

export const ChatContextMenu = () => {
  const t = useTranslations('chat.conversation');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-full" variant="outline">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Link href={absoluteUrl('/chat')} target="_blank">
          <DropdownMenuItem className="hover:cursor-pointer">
            <IoChatboxEllipsesOutline className="h-4 w-4 mr-2" />
            <span>{t('view')}</span>
          </DropdownMenuItem>
        </Link>
        <Link href={absoluteUrl('/ai-agents/general')} target="_blank">
          <DropdownMenuItem className="hover:cursor-pointer">
            <Cpu className="h-4 w-4 mr-2" />
            <span>{t('ai-agents')}</span>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
