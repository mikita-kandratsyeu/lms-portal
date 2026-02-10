'use client';

import { Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCurrentUser } from '@/hooks/use-current-user';
import { fetcher } from '@/lib/fetcher';

import { ImageCrop } from '../image/image-crop';
import { Button } from '../ui';
import { useToast } from '../ui/use-toast';

type PhotoType = 'profile' | 'ai-agent';

type UpdatePhotoModalProps = {
  callback?: (pictureUrl: string | null) => void;
  children: React.ReactNode;
  type: PhotoType;
};

export const UpdatePhotoModal = ({ callback, children, type }: UpdatePhotoModalProps) => {
  const t = useTranslations('profile-image-modal');

  const { user } = useCurrentUser();

  const { toast } = useToast();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const handleSubmit = async ({ blob }: Record<string, string | null>) => {
    setIsFetching(true);

    try {
      let pictureUrl = null;

      const folder = type === 'profile' ? 'profile-images' : 'ai-agent-images';

      if (blob) {
        const response = await fetch(blob);
        const blobData = await response.blob();

        const formData = new FormData();
        const fileName = `${user?.userId}_${Date.now()}_${folder}.png`;

        formData.append('file', blobData, fileName);
        formData.append('name', fileName);
        formData.append('folder', folder);

        const data = await fetcher.post('/api/s3/upload', {
          body: formData,
          responseType: 'json',
        });

        pictureUrl = data?.pictureUrl;
      }

      callback?.(pictureUrl);

      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsFetching(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px] sm:max-h-[625px] overflow-auto max-w-max sm:h-auto h-full sm:w-auto w-full flex flex-col justify-start pt-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t('title')}</DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
            {t(type === 'profile' ? 'body' : 'agentBody')}
          </DialogDescription>
        </DialogHeader>
        <div className="w-full space-y-4 my-4">
          <ImageCrop
            isFetching={isFetching}
            buttonLabel={t('upload')}
            uploadLabel={t('upload')}
            callback={async ({ blob, error }) => {
              if (error) {
                toast({ title: error });
                return;
              }

              if (blob) {
                handleSubmit({ blob });
              }
            }}
          />
          <div className="pt-2 border-gray-200 dark:border-gray-800">
            <Button
              variant="outline"
              onClick={() => handleSubmit({ blob: null })}
              disabled={isFetching}
              className="w-full transition-colors hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:border-red-800 dark:hover:text-red-400"
            >
              {t('delete')}
            </Button>
          </div>
        </div>
        <div className="flex gap-x-2 items-center justify-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300">{t('footer')}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
