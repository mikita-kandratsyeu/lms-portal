'use client';

import { User } from '@prisma/client';
import { format } from 'date-fns';
import { BadgeCheckIcon, BadgeDollarSign, IdCard, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { TextBadge, TextVariantsProps } from '@/components/common/text-badge';
import { UpdatePhotoModal } from '@/components/modals/update-photo-modal';
import { Avatar, AvatarFallback, AvatarImage, Input } from '@/components/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { AuthStatus } from '@/constants/auth';
import { TIMESTAMP_USER_PROFILE_TEMPLATE } from '@/constants/common';
import { useLocaleStore } from '@/hooks/store/use-locale-store';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useDebounce } from '@/hooks/use-debounce';
import { fetcher } from '@/lib/fetcher';
import { getFallbackName } from '@/lib/utils';

type GeneralSettingsFormProps = {
  emailVerification: { label: string; variant: string };
  initialData: User;
};

export const GeneralSettingsForm = ({
  emailVerification,
  initialData,
}: GeneralSettingsFormProps) => {
  const t = useTranslations('settings.generalForm');

  const { user, status } = useCurrentUser();

  const localeInfo = useLocaleStore((state) => state.localeInfo);

  const { toast } = useToast();
  const { update } = useSession();
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || '');
  const [isFetching, setIsFetching] = useState(false);

  const debouncedValue = useDebounce(name);

  useEffect(() => {
    if (debouncedValue.length > 0 && debouncedValue !== initialData.name) {
      handleSubmit({ name: debouncedValue, pictureUrl: initialData?.pictureUrl ?? '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  const handleSubmit = async (values: Record<string, string | null>) => {
    setIsFetching(true);

    try {
      await fetcher.patch(`/api/users/${initialData.id}`, { body: values });

      await update(values);

      toast({ title: t('accInfoUpdated') });
      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsFetching(false);
    }
  };

  const handleVerifyEmail = async () => {
    setIsFetching(true);

    try {
      await fetcher.post(`/api/users/${initialData.id}/email-confirmation`);

      toast({ title: t('emailVerifyStatus.sentMessage') });
      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsFetching(false);
    }
  };

  const handleUpdatePicture = async (pictureUrl: string | null) => {
    setIsFetching(true);

    try {
      const response = await fetcher.patch(`/api/users/${user?.userId}`, {
        body: { pictureUrl },
        responseType: 'json',
      });

      await update(response);

      toast({ title: t('accInfoUpdated') });
      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Card className="shadow-none rounded-md">
      <CardHeader>
        <CardTitle>{t('accInfo')}</CardTitle>
        <CardDescription className="flex flex-col gap-2">
          <span>
            {t('lastUpdated')}&nbsp;{format(initialData.updatedAt, TIMESTAMP_USER_PROFILE_TEMPLATE)}
          </span>
          {localeInfo && (
            <div className="flex flex-col gap-y-1">
              <span className="flex items-center gap-x-1">
                <IdCard className="h-3 w-3" />
                <span>{initialData.id}</span>
              </span>
              <span className="flex items-center gap-x-1">
                <MapPin className="h-3 w-3" />
                <span>
                  {localeInfo.details.city}, {localeInfo.details.country}
                </span>
              </span>
              <span className="flex items-center gap-x-1">
                <BadgeDollarSign className="h-3 w-3" />
                <span>{localeInfo.locale.currency}</span>
              </span>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full">
          <UpdatePhotoModal type="profile" callback={handleUpdatePicture}>
            <button disabled={isFetching || status === AuthStatus.LOADING} className="shrink-0">
              <Avatar className="border dark:border-muted-foreground w-20 h-20 sm:w-24 sm:h-24 hover:opacity-80 transition-opacity">
                <AvatarImage src={initialData?.pictureUrl ?? ''} />
                <AvatarFallback>{getFallbackName(initialData?.name || '')}</AvatarFallback>
              </Avatar>
            </button>
          </UpdatePhotoModal>
          <div className="flex flex-col gap-y-4 flex-1 w-full">
            <div className="flex flex-col gap-y-2">
              <label className="text-sm font-medium text-foreground">{t('name')}</label>
              <Input
                disabled={isFetching || status === AuthStatus.LOADING}
                placeholder={t('enterName')}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <div className="flex items-center gap-x-2">
                <label className="text-sm font-medium text-foreground">{t('email')}</label>
                <button
                  onClick={handleVerifyEmail}
                  disabled={isFetching || emailVerification.label !== 'failed'}
                >
                  {emailVerification.label === 'success' ? (
                    <div
                      className="hover:cursor-pointer"
                      title={t(`emailVerifyStatus.${emailVerification.label}`)}
                    >
                      <BadgeCheckIcon className="w-4 h-4 text-green-500" />
                    </div>
                  ) : (
                    <TextBadge
                      label={t(`emailVerifyStatus.${emailVerification.label}`)}
                      variant={emailVerification.variant as TextVariantsProps['variant']}
                    />
                  )}
                </button>
              </div>
              <Input
                disabled
                placeholder={t('enterEmail')}
                value={initialData.email}
                className="max-w-md"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
