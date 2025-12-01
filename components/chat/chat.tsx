'use client';

import { MoreHorizontalIcon, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { useChatStore } from '@/hooks/store/use-chat-store';
import { useUserSettingsStore } from '@/hooks/store/use-user-settings.store';
import { absoluteUrl, cn } from '@/lib/utils';

import { PrettyLoader } from '../loaders/pretty-loader';
import { Button, ButtonGroup, Sheet, SheetClose, SheetContent, SheetTrigger } from '../ui';
import { ChatContextMenu } from './chat-context-menu';

export const Chat = () => {
  const [open, setOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const { currentModelLabel } = useChatStore((state) => ({
    currentModelLabel: state.currentModelLabel,
  }));
  const { isCopilotInNewTab } = useUserSettingsStore((state) => ({
    isCopilotInNewTab: state.isCopilotInNewTab,
  }));

  const handleOpenChange = isCopilotInNewTab
    ? () => window.open(absoluteUrl('/chat'), '_blank')
    : setOpen;

  const buttonStyles = cn(
    'flex text-sm text-muted-foreground items-center py-2 px-3 hover:bg-muted rounded-lg transition-background group duration-300 ease-in-out border hover:text-primary dark:border-muted-foreground',
    open && 'bg-muted text-primary font-medium',
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger className="hover:opacity-75 transition duration-300">
        <ButtonGroup>
          <button className={buttonStyles} aria-label="Copilot">
            <div className="h-5 flex justify-center items-center gap-x-2 group">
              <Image
                alt="Copilot Logo"
                className="group-hover:animate-spin-once"
                height={18}
                priority
                src="/assets/copilot.svg"
                width={18}
              />
              <span className="font-semibold">Copilot</span>
            </div>
          </button>
          <ChatContextMenu>
            <button className={cn(buttonStyles, 'px-2')} aria-label="More Options">
              <MoreHorizontalIcon className="w-4 h-4" />
            </button>
          </ChatContextMenu>
        </ButtonGroup>
      </SheetTrigger>
      <SheetContent className="p-0 w-full" side="rightCopilot">
        <div className="relative h-full">
          {!isReady && <PrettyLoader isCopilot />}
          {isReady && (
            <div className="fixed py-2 px-4 flex gap-x-1 justify-between sm:max-w-md w-full items-center">
              <div>
                <p className={'font-semibold text-base text-neutral-700 dark:text-neutral-300'}>
                  Nova Copilot
                </p>
                <p className={'text-muted-foreground text-xs'}>{currentModelLabel}</p>
              </div>
              <div className="flex gap-x-2">
                <ChatContextMenu isNewTab>
                  <Button className="w-full" variant="outline">
                    <MoreHorizontalIcon className="h-4 w-4" />
                  </Button>
                </ChatContextMenu>
                <SheetClose asChild>
                  <Button className="w-full" variant="outline">
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>
            </div>
          )}
          <iframe
            onLoad={() => setIsReady(true)}
            src={absoluteUrl('/chat/embed')}
            style={{ width: '100%', height: '100%', border: 'none' }}
            height="100%"
            width="100%"
            title="Nova Copilot"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
