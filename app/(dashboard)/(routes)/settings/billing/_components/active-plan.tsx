'use client';

import { format } from 'date-fns';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { getUserSubscription } from '@/actions/stripe/get-user-subscription';
import { Banner } from '@/components/common/banner';
import { Price } from '@/components/common/price';
import { Button, Card, CardContent } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { TIMESTAMP_SUBSCRIPTION_TEMPLATE } from '@/constants/common';
import { fetcher } from '@/lib/fetcher';

type ActivePlanProps = {
  userSubscription: Awaited<ReturnType<typeof getUserSubscription>>;
};

export const ActivePlan = ({ userSubscription }: ActivePlanProps) => {
  const t = useTranslations('settings.billing');

  const { toast } = useToast();
  const pathname = usePathname();

  const [isFetching, setIsFetching] = useState(false);

  const handleManageSubscription = async () => {
    setIsFetching(true);

    try {
      const response = await fetcher.post('/api/payments/subscription', {
        body: {
          returnUrl: pathname,
        },
        responseType: 'json',
      });

      if (response?.message) {
        toast({ title: response?.message });
      } else {
        toast({ title: t('redirect') });
        window.location.assign(response.url);
      }
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="font-medium text-xl">{t('activePlan')}</p>
      {userSubscription?.cancelAt && (
        <Banner
          label={t('cancelBanner', {
            date: format(userSubscription.endPeriod, TIMESTAMP_SUBSCRIPTION_TEMPLATE),
            planName: userSubscription.planName,
          })}
          variant="warning"
        />
      )}
      {userSubscription && (
        <Card className="shadow-none rounded-lg">
          <CardContent>
            <div className="pt-6 flex flex-col justify-center space-y-2 mb-6">
              <div className="flex items-baseline">
                <p className="text-center text-3xl font-semibold">
                  <Price
                    currency={userSubscription.price.currency}
                    ignoreExchangeRate
                    price={userSubscription.price.unitAmount}
                  />
                </p>
                <span className="text-sm leading-7 text-muted-foreground ml-1">
                  {t(userSubscription.plan.interval === 'month' ? 'mo' : 'year')}
                </span>
              </div>
              <p className="text-lg font-semibold">{userSubscription.planName}</p>
              <p className="text-sm">
                {t('cancel', {
                  action: t(userSubscription?.cancelAt ? 'cancelled' : 'renewed'),
                  date: format(userSubscription.endPeriod, TIMESTAMP_SUBSCRIPTION_TEMPLATE),
                })}
              </p>
            </div>
            <Button disabled={isFetching} isLoading={isFetching} onClick={handleManageSubscription}>
              {t('manageSubscription')}
            </Button>
          </CardContent>
        </Card>
      )}
      {!userSubscription && (
        <div className="">
          <p className="text-sm">{t('noSubscription')}</p>
        </div>
      )}
    </div>
  );
};
