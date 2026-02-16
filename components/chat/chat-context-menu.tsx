'use client';

import { CpuIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { IoChatboxEllipsesOutline as IoChatboxEllipsesOutlineIcon } from 'react-icons/io5';

import { absoluteUrl } from '@/lib/utils';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui';

type ChatContextMenuProps = { children: React.ReactNode };

export const ChatContextMenu = ({ children }: ChatContextMenuProps) => {
  const t = useTranslations('chat.conversation');
  const router = useRouter();

  const handleViewChat = () => {
    router.push(absoluteUrl('/chat'));
    setTimeout(() => router.refresh(), 100);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="hover:cursor-pointer" onClick={handleViewChat}>
          <IoChatboxEllipsesOutlineIcon className="h-4 w-4 mr-2" />
          <span>{t('view')}</span>
        </DropdownMenuItem>
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
