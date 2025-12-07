'use client';

import { useTranslations } from 'next-intl';
import { memo, SyntheticEvent, useState } from 'react';

import { Textarea } from '@/components/ui';
import { LIMIT_CHAT_INPUT } from '@/constants/ai/general';
import { useChatStore } from '@/hooks/store/use-chat-store';
import { cn } from '@/lib/utils';

import { ChatInputFooter } from './chat-input-footer';

type ChatInputProps = {
  currenMessage: string;
  isSubmitting?: boolean;
  onAbortGenerating: () => void;
  onSubmit: (event: SyntheticEvent) => void;
  setCurrentMessage: (value: string) => void;
};

const ChatInputComponent = ({
  currenMessage,
  isSubmitting = false,
  onAbortGenerating,
  onSubmit,
  setCurrentMessage,
}: ChatInputProps) => {
  const t = useTranslations('chat.input');

  const [inputLength, setInputLength] = useState(0);

  const isImageGeneration = false;

  return (
    <div className="w-full h-full relative flex items-end">
      <div className="flex flex-1 w-full flex-shrink-0">
        <div className="flex w-full h-full flex-col pb-2 px-4">
          <form
            className={cn(
              'bg-background mx-auto flex flex-col lg:max-w-2xl xl:max-w-4xl w-full h-full border rounded-sm z-10 focus-within:border-b-indigo-500 focus-within:border-b-2 transition-colors duration-200 ease-in-out',
              inputLength >= LIMIT_CHAT_INPUT && 'focus-within:border-b-red-600',
              isImageGeneration &&
                'border-b-purple-500 border-b-2 focus-within:border-b-purple-500 ',
            )}
            onSubmit={onSubmit}
          >
            <Textarea
              className="resize-none overflow-auto z-10 border-none"
              disabled={isSubmitting}
              maxLength={LIMIT_CHAT_INPUT}
              placeholder={t(isImageGeneration ? 'enterImageMessage' : 'enterMessage')}
              value={currenMessage}
              onChange={(event) => {
                setCurrentMessage(event.target.value);
                setInputLength(event.target.value.length);
              }}
              onKeyDown={(event) => {
                if (event.key == 'Enter' && !event.shiftKey && !isSubmitting) {
                  event.preventDefault();
                  onSubmit(event);
                }
              }}
            />
            <ChatInputFooter
              isDisabled={!currenMessage && !isSubmitting}
              isSubmitting={isSubmitting}
              onSendMessage={isSubmitting ? onAbortGenerating : () => {}}
            />
          </form>
          <div className="p-2 text-center text-xs text-muted-foreground z-10 select-none">
            {t('footer')}
          </div>
        </div>
      </div>
      <div className="h-[calc(100%+20px)] w-full bg-gradient-to-t from-neutral-50 dark:from-neutral-900 to-transparent absolute bottom-0 z-0"></div>
    </div>
  );
};

ChatInputComponent.displayName = 'ChatInput';

export const ChatInput = memo(ChatInputComponent);
