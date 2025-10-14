'use client';

import { Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCurrentUser } from '@/hooks/use-current-user';
import { fetcher } from '@/lib/fetcher';
import { UploadButton } from '@/lib/uploadthing';

// import { blobUrlToBase64 } from '@/lib/utils';
// import { ImageCrop } from '../image/image-crop';
import { Button } from '../ui';
import { useToast } from '../ui/use-toast';

type UpdateProfileImageModalProps = {
  children: React.ReactNode;
};

export const UpdateProfileImageModal = ({ children }: UpdateProfileImageModalProps) => {
  const t = useTranslations('profile-image-modal');

  const { user } = useCurrentUser();

  const { toast } = useToast();
  const { update } = useSession();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const handleSubmit = async (values: Record<string, string | null>) => {
    setIsFetching(true);

    try {
      const response = await fetcher.patch(`/api/users/${user?.userId}`, {
        body: values,
        responseType: 'json',
      });

      await update(response);

      toast({ title: t('accInfoUpdated') });
      router.refresh();
    } catch (error) {
      toast({ isError: true });
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
          <DialogDescription>{t('body')}</DialogDescription>
        </DialogHeader>
        <div className="w-full flex flex-col gap-y-2 my-4">
          {/* FIXME: Big size of images */}
          {/* <ImageCrop
            isFetching={isFetching}
            buttonLabel={t('upload')}
            uploadLabel={t('upload')}
            callback={async ({ blob, error }) => {
              if (error) {
                toast({ title: error });
                return;
              }

              if (blob) {
                const base64 = await blobUrlToBase64(blob);
                handleSubmit({ base64 });
              }
            }}
          /> */}
          <UploadButton
            disabled={isFetching}
            endpoint="profilePicture"
            onClientUploadComplete={(res) => {
              handleSubmit({ pictureUrl: res?.[0]?.url ?? null });
            }}
            onUploadError={(error: Error) => {
              toast({ title: String(error?.message) });
            }}
          />
          <Button
            variant="outline"
            onClick={() => handleSubmit({ pictureUrl: null })}
            disabled={isFetching}
          >
            {t('delete')}
          </Button>
        </div>
        <DialogFooter>
          <div className="flex gap-x-2">
            <Info className="w-4-h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t('footer')}</p>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
