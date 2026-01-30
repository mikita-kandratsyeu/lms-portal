'use client';

import { AlertTriangle, Flame } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { CaptchaInvisible } from '@/components/common/captcha-invisible';
import { DeleteAccountModal } from '@/components/modals/delete-account-modal';
import { Button } from '@/components/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type DeleteAccountProps = { userId?: string; email?: string | null };

export const DeleteAccount = ({ userId, email }: DeleteAccountProps) => {
  const t = useTranslations('settings');
  const locale = useLocale();

  const [open, setOpen] = useState(false);

  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaVisible, setCaptchaVisible] = useState(false);

  const handleDelete = () => {
    if (captchaToken) {
      setOpen(true);
    } else {
      setCaptchaVisible(true);
    }
  };

  useEffect(() => {
    if (captchaToken) {
      setOpen(true);
    }
  }, [captchaToken]);

  return (
    <>
      <Card className="shadow-none border-destructive/50 rounded-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">{t('dangerZone')}</CardTitle>
          </div>
          <CardDescription>{t('dangerZoneDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDelete} className="w-full sm:w-auto">
            <Flame className="h-4 w-4 mr-2" />
            {t('deleteAcc')}
          </Button>
        </CardContent>
      </Card>
      {open && <DeleteAccountModal userId={userId} email={email} open={open} setOpen={setOpen} />}
      <CaptchaInvisible
        callback={(token) => {
          if (token) {
            setCaptchaToken(token);
          }
        }}
        locale={locale}
        setVisible={setCaptchaVisible}
        visible={captchaVisible}
      />
    </>
  );
};
