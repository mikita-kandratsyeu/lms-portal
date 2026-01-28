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

        const uploadResponse = await fetch('/api/s3/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Upload failed');
        }

        const data = await uploadResponse.json();
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
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t(type === 'profile' ? 'body' : 'agentBody')}</DialogDescription>
        </DialogHeader>
        <div className="w-full flex flex-col gap-y-2 my-4">
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
          <Button
            variant="outline"
            onClick={() => handleSubmit({ blob: null })}
            disabled={isFetching}
          >
            {t('delete')}
          </Button>
        </div>
        <div className="flex gap-x-2 items-center justify-center">
          <Info className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t('footer')}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
