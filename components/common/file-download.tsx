'use client';

import { Download, FileText, ImageIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '../ui';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];

const isImageFile = (fileName: string): boolean => {
  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
  return IMAGE_EXTENSIONS.includes(ext);
};

type FileDownloadProps = {
  compact?: boolean;
  fileName: string;
  folder?: string;
  isRemoveButtonDisabled?: boolean;
  onFilePreview?: () => void;
  onFileRemove?: () => void;
  showDownloadButton?: boolean;
  url: string;
};

export const FileDownload = ({
  compact = false,
  fileName,
  folder,
  isRemoveButtonDisabled = false,
  onFilePreview,
  onFileRemove,
  showDownloadButton = false,
  url,
}: FileDownloadProps) => {
  const t = useTranslations('file-download');
  const canPreview = isImageFile(fileName) && Boolean(onFilePreview);

  const lastDot = fileName.lastIndexOf('.');
  const name = lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
  const extension = lastDot > 0 ? fileName.slice(lastDot) : '';

  return (
    <div
      className={
        compact
          ? 'flex items-center justify-between p-2 w-full rounded border mb-1 gap-x-1.5'
          : 'flex items-center justify-between p-3 w-full rounded-md border mb-2 gap-x-2'
      }
    >
      <div className="flex items-center min-w-0">
        <FileText
          className={
            compact
              ? 'h-3.5 w-3.5 mr-2 flex-shrink-0 text-red-500'
              : 'h-4 w-4 mr-3 flex-shrink-0 text-red-500'
          }
        />
        <div className="flex flex-col min-w-0">
          <p
            className={
              compact
                ? 'text-primary font-medium text-xs line-clamp-1 truncate'
                : 'text-primary font-medium text-sm line-clamp-2'
            }
          >
            {name}
          </p>
          <div className="flex flex-col text-muted-foreground text-xs">
            {folder && (
              <span className="truncate" title={folder}>
                {folder}
              </span>
            )}
            {extension && <span>{extension}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-x-1.5 flex-shrink-0">
        {canPreview && (
          <Button
            className={compact ? 'h-7 w-7 p-0' : undefined}
            variant="outline"
            title={t('preview')}
            onClick={onFilePreview}
          >
            <ImageIcon className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
          </Button>
        )}
        {showDownloadButton && (
          <Link href={url} target="_blank">
            <Button
              className={compact ? 'h-7 w-7 p-0' : undefined}
              variant="outline"
              title={t('download')}
            >
              <Download className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
            </Button>
          </Link>
        )}
        {Boolean(onFileRemove) && (
          <Button
            className={compact ? 'h-7 w-7 p-0' : undefined}
            disabled={isRemoveButtonDisabled}
            variant="outline"
            onClick={onFileRemove!}
            title="Remove"
          >
            <Trash2 className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
          </Button>
        )}
      </div>
    </div>
  );
};
