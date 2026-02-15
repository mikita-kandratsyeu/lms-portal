'use client';

import { Download, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { CopyClipboard } from '@/components/common/copy-clipboard';
import { FileDownload } from '@/components/common/file-download';
import { MarkdownText } from '@/components/common/markdown-text';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { ChatCompletionRole } from '@/constants/ai/general';
import { getFallbackName } from '@/lib/utils';

type AttachedFile = { key: string; name: string; url: string };

type ChatBubbleProps = {
  isShared?: boolean;
  isSubmitting?: boolean;
  message: {
    role: string;
    content: string;
    model?: string;
    id?: string;
    attachedFile?: AttachedFile;
    attachedFileKey?: string | null;
    attachedFileName?: string | null;
    attachedFileUrl?: string | null;
    imageGeneration?: {
      model: string;
      revisedPrompt: string;
      url: string;
    } | null;
  };
  name: string;
  picture?: string | null;
  streamImage?: string;
  streamMessage?: string;
};

export const ChatBubble = ({
  isShared,
  isSubmitting,
  message,
  name,
  picture,
  streamImage,
  streamMessage,
}: ChatBubbleProps) => {
  const isAssistant = message.role === ChatCompletionRole.ASSISTANT;

  const attachedFile: AttachedFile | undefined =
    message.attachedFile ??
    (message.attachedFileUrl && message.attachedFileName
      ? {
          key: message.attachedFileKey ?? '',
          name: message.attachedFileName,
          url: message.attachedFileUrl,
        }
      : undefined);

  const text = streamMessage ?? message.content;
  const image = streamImage ?? message?.imageGeneration?.url;
  const model = message?.imageGeneration ? message.imageGeneration.model : message.model;

  return (
    <div className="pb-4 pt-2">
      <div className="flex gap-x-4">
        <Avatar className="border dark:border-muted-foreground">
          <AvatarImage src={picture ?? '/assets/copilot.svg'} />
          <AvatarFallback>{getFallbackName(name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="text-medium font-bold">{name}</span>
            {Boolean(isAssistant && isSubmitting) && (
              <MoreHorizontal className="w-6 h-6 animate-pulse" />
            )}
            {isAssistant && isShared && (
              <div className="text-xs text-muted-foreground">{model}</div>
            )}
          </div>
          {!isAssistant && attachedFile && (
            <div className="my-2">
              <FileDownload
                fileName={attachedFile.name}
                showDownloadButton
                url={attachedFile.url}
              />
            </div>
          )}
          {image && (
            <div className="relative aspect-w-16 aspect-h-14 border my-4">
              <Image alt="Image" fill src={image} className="rounded-sm" />
            </div>
          )}
          <MarkdownText text={text} />
          {isAssistant && !isSubmitting && (
            <div className="flex gap-x-3 mt-4 items-center">
              <CopyClipboard textToCopy={text} />
              {image && (
                <Link href={image} target="_blank">
                  <button className="flex items-center">
                    <Download className="h-4 w-4" />
                  </button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
