'use client';

import { Download, FileText, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '../ui';

type FileDownloadProps = {
  compact?: boolean;
  fileName: string;
  isRemoveButtonDisabled?: boolean;
  onFileRemove?: () => void;
  showDownloadButton?: boolean;
  url: string;
};

export const FileDownload = ({
  compact = false,
  fileName,
  isRemoveButtonDisabled = false,
  onFileRemove,
  showDownloadButton = false,
  url,
}: FileDownloadProps) => {
  const t = useTranslations('file-download');

  const [name, extension] = fileName.split('.');

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
          <p className="text-muted-foreground text-xs">{`.${extension}`}</p>
        </div>
      </div>
      <div className="flex items-center gap-x-1.5 flex-shrink-0">
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
