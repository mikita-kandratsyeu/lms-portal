'use client';

import { User } from '@prisma/client';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { TextBadge } from '@/components/common/text-badge';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { CreateOtpModal } from '@/components/modals/create-otp-modal';
import { Button } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { TIMESTAMP_TEMPLATE } from '@/constants/common';
import { fetcher } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

type OtpFormProps = {
  initialData: User;
};

export const OtpForm = ({ initialData }: OtpFormProps) => {
  const t = useTranslations('settings.otpForm');

  const { toast } = useToast();
  const router = useRouter();

  const isOtpEnabled = initialData?.otpSecret;
  const otpCreatedAt = initialData?.otpCreatedAt;

  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  const handleGenerate = async () => {
    try {
      setIsFetching(true);

      const otp = await fetcher.post('/api/otp/generate', {
        responseType: 'json',
        body: { email: initialData.email },
      });

      setQrCode(otp.qr);
      setSecret(otp.secret);
    } catch (error) {
      toast({ isError: true });
    } finally {
      setIsFetching(false);
    }
  };

  const handleDisable = async () => {
    try {
      setIsFetching(true);

      await fetcher.patch('/api/otp/delete', {
        responseType: 'json',
        body: { email: initialData.email },
      });

      toast({ title: t('otpDisabled') });
      router.refresh();
    } catch (error) {
      toast({ isError: true });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
      <div className="space-y-0.5">
        <div className="flex items-center space-x-2 mb-1.5">
          <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {t('title')}
          </div>
          <TextBadge
            label={t(isOtpEnabled ? 'enabled' : 'disabled')}
            variant={isOtpEnabled ? 'green' : 'red'}
          />
        </div>
        <div className="text-muted-foreground text-xs">
          <p className={cn(isOtpEnabled && 'mb-2')}>{t('body')}</p>
          {isOtpEnabled && otpCreatedAt && (
            <p>{t('addedAt', { date: format(otpCreatedAt, TIMESTAMP_TEMPLATE) })}</p>
          )}
        </div>
      </div>
      {isOtpEnabled && (
        <ConfirmModal onConfirm={handleDisable}>
          <Button variant="secondary" disabled={isFetching}>
            {t('disable')}
          </Button>
        </ConfirmModal>
      )}
      {!isOtpEnabled && (
        <CreateOtpModal qrCode={qrCode} secret={secret}>
          <Button variant="outline" onClick={handleGenerate} disabled={isFetching}>
            {t('enable')}
          </Button>
        </CreateOtpModal>
      )}
    </div>
  );
};
