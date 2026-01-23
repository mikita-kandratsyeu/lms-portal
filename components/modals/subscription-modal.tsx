'use client';

import { StripeSubscriptionDescription, StripeSubscriptionPeriod } from '@prisma/client';
import { ArrowRight, CheckCircle2 as CheckCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SyntheticEvent, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useLocaleStore } from '@/hooks/store/use-locale-store';
import { useCurrentUser } from '@/hooks/use-current-user';
import { fetcher } from '@/lib/fetcher';

import { AuthRedirect } from '../auth/auth-redirect';
import { Price } from '../common/price';
import { TextBadge } from '../common/text-badge';
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '../ui';

type SubscriptionModalProps = {
  description: StripeSubscriptionDescription[];
  open: boolean;
  setOpen: (value: boolean) => void;
};

export const SubscriptionModal = ({ description = [], open, setOpen }: SubscriptionModalProps) => {
  const t = useTranslations('subscription');

  const { toast } = useToast();

  const pathname = usePathname();
  const { user } = useCurrentUser();

  const localeInfo = useLocaleStore((state) => state.localeInfo);

  const [isFetching, setIsFetching] = useState(false);
  const [currentTab, setCurrentTab] = useState<StripeSubscriptionPeriod>(
    StripeSubscriptionPeriod.yearly,
  );

  const yearly = description.find(({ period }) => period === StripeSubscriptionPeriod.yearly);
  const monthly = description.find(({ period }) => period === StripeSubscriptionPeriod.monthly);

  const { price, unitPrice, recurringInterval, subscriptionName } = (() => {
    const currentPeriod = currentTab === StripeSubscriptionPeriod.yearly ? yearly : monthly;

    return {
      price: currentPeriod?.price,
      unitPrice:
        currentPeriod?.period === StripeSubscriptionPeriod?.yearly
          ? Math.round((currentPeriod?.price ?? 0) / 12)
          : currentPeriod?.price,
      recurringInterval:
        currentPeriod?.period === StripeSubscriptionPeriod.yearly ? 'year' : 'month',
      subscriptionName: currentPeriod?.name,
    };
  })();

  const handleUpgrade = async (event: SyntheticEvent) => {
    event.preventDefault();

    setIsFetching(true);

    try {
      const response = await fetcher.post('/api/payments/subscription', {
        body: {
          details: localeInfo?.details,
          locale: localeInfo?.locale,
          price,
          rate: localeInfo?.rate,
          recurringInterval,
          returnUrl: pathname,
          subscriptionName,
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

  const renderBenefits = () => {
    const benefits = [
      'unlock-premium-courses',
      'get-access-nova-ai',
      'advanced-ai-agents',
      'teacher-functionality',
      'cancel-anytime',
    ];

    return (
      <ul className="pt-2 space-y-3 text-sm leading-6">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex gap-x-3 text-sm items-center">
            <CheckCircle className="h-4 w-4" />
            {t(`benefits.${benefit}`)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleUpgrade}>
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold">{t(currentTab)}</DialogTitle>
            <div className="flex items-baseline justify-center pt-4">
              <p className="text-center text-3xl lg:text-4xl font-semibold tracking-tight">
                <Price price={unitPrice ?? 0} />
              </p>
              <span className="text-sm leading-7 text-muted-foreground ml-1">{t('mo')}</span>
            </div>
          </DialogHeader>
          <Tabs
            defaultValue={StripeSubscriptionPeriod.yearly}
            className="w-full pt-4"
            onValueChange={(value) => setCurrentTab(value as StripeSubscriptionPeriod)}
            value={currentTab}
          >
            <TabsList className="w-full">
              <TabsTrigger className="w-full" value={StripeSubscriptionPeriod.yearly}>
                {t(yearly?.period ?? '')}
              </TabsTrigger>
              <TabsTrigger className="w-full" value={StripeSubscriptionPeriod.monthly}>
                {t(monthly?.period ?? '')}
              </TabsTrigger>
            </TabsList>
            {currentTab === StripeSubscriptionPeriod.yearly && (
              <div className="mt-6 w-full text-center">
                <TextBadge variant="lime" label={t('bestChoice')} />
              </div>
            )}
            <TabsContent value={StripeSubscriptionPeriod.yearly} className="pt-4">
              {renderBenefits()}
            </TabsContent>
            <TabsContent value={StripeSubscriptionPeriod.monthly} className="pt-4">
              {renderBenefits()}
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-6">
            {user?.userId && (
              <Button
                className="mt-2 w-full"
                disabled={isFetching}
                isLoading={isFetching}
                type="submit"
              >
                {t('upgrade')}
              </Button>
            )}
            {!user?.userId && (
              <AuthRedirect>
                <Button className="w-full">
                  {t('loginToContinue')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </AuthRedirect>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
