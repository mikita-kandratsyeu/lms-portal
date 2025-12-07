'use client';

import { Paperclip, SendHorizonal, StopCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { FileUploadModal } from '@/components/modals/file-upload-modal';
import { Badge, Button, Separator } from '@/components/ui';
import { cn } from '@/lib/utils';

type ChatInputFooterProps = {
  isDisabled?: boolean;
  isSubmitting?: boolean;
  onSendMessage: () => void;
};

export const ChatInputFooter = ({
  isDisabled,
  isSubmitting,
  onSendMessage,
}: ChatInputFooterProps) => {
  const t = useTranslations('chat.input');

  const isImageGeneration = false;
  const isWebSearchGeneration = false;

  return (
    <div className="flex justify-between px-2 py-2 items-center">
      <div className="text-xs text-muted-foreground flex items-center gap-x-2 pr-2">
        {isImageGeneration && (
          <Badge variant="secondary" className="rounded-sm px-1 font-normal line-clamp-2">
            {t('image-generation-mode')}
          </Badge>
        )}
        {isWebSearchGeneration && (
          <Badge variant="secondary" className="rounded-sm px-1 font-normal line-clamp-2">
            {t('search')}
          </Badge>
        )}
      </div>
      <div className="flex items-center">
        {/* {hasSearch && (
          <button
            type="button"
            className="mr-3"
            disabled={isSubmitting}
            onClick={() => {
              setIsSearchMode(!isSearchMode);
              setIsImageGeneration(false);
            }}
          >
            <Globe
              className={cn(
                'w-4 h-4 text-muted-foreground transition-colors duration-300',
                isSearchMode && 'text-blue-500',
              )}
            />
          </button>
        )} */}
        {/* <button
          type="button"
          className="mr-3"
          disabled={isSubmitting}
          onClick={() => {
            setIsImageGeneration(!isImageGeneration);
            setIsSearchMode(false);
          }}
        >
          <ImageIcon
            className={cn(
              'w-4 h-4 text-muted-foreground transition-colors duration-300',
              isImageGeneration && 'text-purple-500',
            )}
          />
        </button> */}
        <FileUploadModal endpoint="chatAttachments" onChange={() => {}} onBegin={() => {}}>
          <button type="button" className="mr-3" disabled={isSubmitting}>
            <Paperclip className={'w-4 h-4 text-muted-foreground transition-colors duration-300'} />
          </button>
        </FileUploadModal>
        <Separator orientation="vertical" className="mr-4 ml-2 h-6" />
        <Button
          className={cn(
            'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:text-white font-medium z-10 px-2 text-sm',
            isSubmitting && 'w-12',
          )}
          disabled={isDisabled || (isSubmitting && isImageGeneration)}
          type={isSubmitting ? 'button' : 'submit'}
          variant="outline"
          onClick={onSendMessage}
        >
          {isSubmitting && <StopCircle className="w-4 h-4 mx-2" />}
          {!isSubmitting && <SendHorizonal className="w-4 h-4 mx-2" />}
        </Button>
      </div>
    </div>
  );
};
