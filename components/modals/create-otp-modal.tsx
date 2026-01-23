'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SyntheticEvent, useEffect, useState } from 'react';

import { OtpInput } from '@/components/common/otp-input';
import { Button, Skeleton } from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { OTP_LENGTH } from '@/constants/otp';
import { fetcher } from '@/lib/fetcher';

type CreateOtpModalProps = {
  children: React.ReactNode;
  qrCode: string;
  secret: string;
};

export const CreateOtpModal = ({ children, qrCode, secret }: CreateOtpModalProps) => {
  const t = useTranslations('otp-modal');

  const { toast } = useToast();
  const router = useRouter();

  const [token, setToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (errorMessage.length > 0) {
      setErrorMessage('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleEnableOtp = async (event: SyntheticEvent) => {
    event.preventDefault();

    try {
      setIsFetching(true);

      const response = await fetcher.post('/api/otp/verify', {
        responseType: 'json',
        body: { token, secret },
      });

      if (response.verified) {
        setOpen(false);

        toast({ title: t('success') });
        router.refresh();
      } else {
        setErrorMessage(t('errors.invalidOtp'));
      }
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleEnableOtp}>
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('body')}</DialogDescription>
          </DialogHeader>
          <div className="w-full my-4 flex flex-col items-center">
            <div className="w-40 h-40 my-6">
              {qrCode && <Image src={qrCode} alt="QR" width={500} height={500} priority />}
              {!qrCode && <Skeleton className="w-full h-full rounded" />}
            </div>
            <OtpInput
              disabled={isFetching || !qrCode}
              errorMessage={errorMessage}
              setToken={setToken}
            />
          </div>
          <DialogFooter>
            <Button
              disabled={Boolean(errorMessage) || isFetching || token.length !== OTP_LENGTH}
              isLoading={isFetching}
              type="submit"
            >
              {t('enable')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
