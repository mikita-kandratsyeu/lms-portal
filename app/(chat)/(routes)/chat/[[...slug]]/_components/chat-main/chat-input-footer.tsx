'use client';

import { AiModelFeature } from '@prisma/client';
import { GlobeIcon, ImageIcon, Paperclip, SendHorizonal, StopCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { FileUploadModal } from '@/components/modals/file-upload-modal';
import { Badge, Button, Separator } from '@/components/ui';
import { useAiAgentStore } from '@/hooks/store/use-ai-agent-store';
import { useChatStore } from '@/hooks/store/use-chat-store';
import { cn } from '@/lib/utils';

type ChatInputFooterProps = {
  isDisabled?: boolean;
  isEmbed?: boolean;
  isSubmitting?: boolean;
  onSendMessage: () => void;
};

export const ChatInputFooter = ({
  isDisabled,
  isEmbed,
  isSubmitting,
  onSendMessage,
}: ChatInputFooterProps) => {
  const t = useTranslations('chat.input');

  const { activeFeature, attachedFile, setActiveFeature, setAttachedFile } = useChatStore(
    (state) => ({
      activeFeature: state.activeFeature,
      attachedFile: state.attachedFile,
      setActiveFeature: state.setActiveFeature,
      setAttachedFile: state.setAttachedFile,
    }),
  );

  const { currentAgent, currentModel } = useAiAgentStore((state) => ({
    currentAgent: state.currentAgent,
    currentModel: state.currentModel,
  }));

  const hasImageGeneration = currentAgent?.aiModels
    .flatMap((model) => model.features)
    ?.includes(AiModelFeature.image);
  const hasWebSearch = currentModel?.features.includes(AiModelFeature.search);
  const hasFileUploading = !isEmbed && currentModel?.features?.includes(AiModelFeature.file);

  const isImageGenerationActive = activeFeature === AiModelFeature.image;
  const isWebSearchActive = activeFeature === AiModelFeature.search;

  const showSeparator = hasImageGeneration || hasWebSearch || hasFileUploading;

  return (
    <div className="flex justify-between px-2 py-2 items-center">
      <div className="text-xs text-muted-foreground flex items-center gap-x-2 pr-2">
        {isImageGenerationActive && (
          <Badge variant="secondary" className="rounded-sm px-1 font-normal line-clamp-2">
            {t('image-generation-mode')}
          </Badge>
        )}
        {isWebSearchActive && (
          <Badge variant="secondary" className="rounded-sm px-1 font-normal line-clamp-2">
            {t('search')}
          </Badge>
        )}
      </div>
      <div className="flex items-center">
        {hasWebSearch && (
          <button
            type="button"
            className={cn(
              'mr-3',
              (isSubmitting || attachedFile) && 'cursor-not-allowed opacity-50',
            )}
            disabled={isSubmitting || Boolean(attachedFile)}
            onClick={() => {
              setActiveFeature(AiModelFeature.search);
            }}
          >
            <GlobeIcon
              className={cn(
                'w-4 h-4 text-muted-foreground transition-colors duration-300',
                isWebSearchActive && 'text-blue-500',
              )}
            />
          </button>
        )}
        {hasImageGeneration && (
          <button
            className={cn(
              'mr-3',
              (isSubmitting || attachedFile) && 'cursor-not-allowed opacity-50',
            )}
            disabled={isSubmitting || Boolean(attachedFile)}
            type="button"
            onClick={() => {
              setActiveFeature(AiModelFeature.image);
            }}
          >
            <ImageIcon
              className={cn(
                'w-4 h-4 text-muted-foreground transition-colors duration-300',
                isImageGenerationActive && 'text-purple-500',
              )}
            />
          </button>
        )}
        {hasFileUploading && (
          <FileUploadModal
            accept=".pdf,.csv,.doc,.docx,.xls,.xlsx"
            folder="chat-files"
            maxFiles={1}
            maxFileSize={4}
            onChange={(files) => {
              const file = files[0] ?? null;
              setAttachedFile(file);
              if (file && (isWebSearchActive || isImageGenerationActive)) {
                setActiveFeature(AiModelFeature.text);
              }
            }}
            onBegin={() => {}}
          >
            <button
              type="button"
              className={cn(
                'mr-3',
                (isSubmitting || attachedFile) && 'cursor-not-allowed opacity-50',
              )}
              disabled={isSubmitting || Boolean(attachedFile)}
            >
              <Paperclip
                className={'w-4 h-4 text-muted-foreground transition-colors duration-300'}
              />
            </button>
          </FileUploadModal>
        )}
        {showSeparator && <Separator orientation="vertical" className="mr-4 ml-2 h-6" />}
        <Button
          className={cn(
            'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:text-white font-medium z-10 px-2 text-sm',
            isSubmitting && 'w-12',
          )}
          disabled={isDisabled && !isSubmitting}
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
