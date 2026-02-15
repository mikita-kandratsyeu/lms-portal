'use client';

import { AiModelFeature } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { memo, SyntheticEvent, useState } from 'react';

import { AiAgentSwitcher } from '@/components/ai-agents/agent-configuration/ai-agent-switcher';
import { AiModelSwitcher } from '@/components/ai-agents/agent-configuration/ai-model-switcher';
import { FileDownload } from '@/components/common/file-download';
import { Textarea } from '@/components/ui';
import { LIMIT_CHAT_INPUT } from '@/constants/ai/general';
import { useChatStore } from '@/hooks/store/use-chat-store';
import { cn } from '@/lib/utils';

import { ChatInputFooter } from './chat-input-footer';

type ChatInputProps = {
  currenMessage: string;
  isEmbed?: boolean;
  isSubmitting?: boolean;
  onAbortGenerating: () => void;
  onSubmit: (event: SyntheticEvent) => void;
  setCurrentMessage: (value: string) => void;
};

const ChatInputComponent = ({
  currenMessage,
  isEmbed = false,
  isSubmitting = false,
  onAbortGenerating,
  onSubmit,
  setCurrentMessage,
}: ChatInputProps) => {
  const t = useTranslations('chat.input');

  const { activeFeature, attachedFile, setAttachedFile } = useChatStore((state) => ({
    activeFeature: state.activeFeature,
    attachedFile: state.attachedFile,
    setAttachedFile: state.setAttachedFile,
  }));

  const [inputLength, setInputLength] = useState(0);

  const isImageGenerationActive = activeFeature === AiModelFeature.image;
  const isWebSearchActive = activeFeature === AiModelFeature.search;
  const canSend = currenMessage.trim().length > 0 || Boolean(attachedFile);

  return (
    <div className="w-full flex-shrink-0 relative flex items-end">
      <div className="flex flex-1 w-full flex-shrink-0">
        <div className="flex w-full h-full flex-col px-4 pb-2 relative z-10">
          {isEmbed && (
            <div className="mb-3">
              <div className="grid grid-cols-2 gap-2 rounded-xl border bg-background/80 p-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <AiModelSwitcher className="w-full" />
                <AiAgentSwitcher className="w-full" />
              </div>
            </div>
          )}
          <form
            className={cn(
              'bg-background mx-auto flex flex-col lg:max-w-2xl xl:max-w-4xl w-full h-[160px] border rounded-sm z-10 focus-within:border-b-indigo-500 focus-within:border-b-2 transition-colors duration-200 ease-in-out',
              inputLength >= LIMIT_CHAT_INPUT && 'focus-within:border-b-red-600',
              isImageGenerationActive &&
                'border-b-purple-500 border-b-2 focus-within:border-b-purple-500 ',
              isWebSearchActive &&
                'border-b-indigo-500 border-b-2 focus-within:border-b-indigo-500 ',
            )}
            onSubmit={onSubmit}
          >
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
              {attachedFile && (
                <div className="flex-shrink-0 px-3 pt-2">
                  <FileDownload
                    compact
                    fileName={attachedFile.name}
                    isRemoveButtonDisabled={isSubmitting}
                    onFileRemove={() => setAttachedFile(null)}
                    showDownloadButton
                    url={attachedFile.url}
                  />
                </div>
              )}
              <Textarea
                className="resize-none overflow-auto z-10 border-none"
                disabled={isSubmitting}
                maxLength={LIMIT_CHAT_INPUT}
                placeholder={t(isImageGenerationActive ? 'enterImageMessage' : 'enterMessage')}
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
            </div>
            <div className="flex-shrink-0">
              <ChatInputFooter
                isDisabled={!canSend}
                isEmbed={isEmbed}
                isSubmitting={isSubmitting}
                onSendMessage={isSubmitting ? onAbortGenerating : () => {}}
              />
            </div>
          </form>
          <p className="text-center text-xs text-muted-foreground select-none mt-2">
            {t('footer')}
          </p>
        </div>
      </div>
      <div className="h-[calc(100%+20px)] w-full bg-gradient-to-t from-neutral-50 dark:from-neutral-900 to-transparent absolute bottom-0 z-0 pointer-events-none"></div>
    </div>
  );
};

ChatInputComponent.displayName = 'ChatInput';

export const ChatInput = memo(ChatInputComponent);
