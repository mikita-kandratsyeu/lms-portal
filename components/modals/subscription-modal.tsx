'use client';

import { StripeSubscriptionDescription, StripeSubscriptionPeriod } from '@prisma/client';
import { ArrowRight, CheckCircle2 as CheckCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SyntheticEvent, useMemo, useState } from 'react';

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

  const { price, recurringInterval, subscriptionName } = (() => {
    const currentPeriod = currentTab === StripeSubscriptionPeriod.yearly ? yearly : monthly;

    return {
      price: currentPeriod?.price,
      recurringInterval:
        currentPeriod?.period === StripeSubscriptionPeriod.yearly ? 'year' : 'month',
      subscriptionName: currentPeriod?.name,
    };
  })();

  const savingsPercent = useMemo(() => {
    const monthlyPrice = monthly?.price ?? 0;
    const yearlyTotal = yearly?.price ?? 0;

    if (monthlyPrice <= 0 || yearlyTotal <= 0) return 0;

    const monthlyYearlyEquivalent = monthlyPrice * 12;

    return Math.round(((monthlyYearlyEquivalent - yearlyTotal) / monthlyYearlyEquivalent) * 100);
  }, [monthly?.price, yearly?.price]);

  const yearlyMonthlyEquivalent = yearly ? Math.round((yearly.price ?? 0) / 12) : 0;

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
      <ul className="space-y-3 text-sm leading-6 sm:space-y-2.5">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex gap-x-3 items-center">
            <CheckCircle className="h-4 w-4 shrink-0 text-lime-600 dark:text-lime-500" />
            <span className="text-muted-foreground">{t(`benefits.${benefit}`)}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto p-4 sm:max-w-[440px] sm:p-6">
        <form onSubmit={handleUpgrade} className="flex flex-col gap-4 sm:gap-5">
          <DialogHeader className="space-y-0">
            <DialogTitle className="text-center text-xl font-semibold sm:text-2xl">
              {t('bannerTitle')}
            </DialogTitle>
          </DialogHeader>

          <Tabs
            defaultValue={StripeSubscriptionPeriod.yearly}
            className="w-full"
            onValueChange={(value) => setCurrentTab(value as StripeSubscriptionPeriod)}
            value={currentTab}
          >
            <div className="flex flex-col gap-4 sm:gap-5">
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="flex w-full flex-col gap-4">
                  {savingsPercent > 0 && currentTab === StripeSubscriptionPeriod.yearly && (
                    <div className="flex justify-center">
                      <TextBadge
                        className="text-xs font-semibold"
                        label={t('bestChoice')}
                        variant="lime"
                      />
                    </div>
                  )}
                  <TabsList className="grid h-auto min-h-10 w-full grid-cols-2 gap-1 rounded-xl bg-muted/80 p-1">
                    <TabsTrigger
                      className="min-w-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      value={StripeSubscriptionPeriod.monthly}
                    >
                      <span className="truncate">{t(monthly?.period ?? '')}</span>
                    </TabsTrigger>
                    <TabsTrigger
                      className="min-w-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      value={StripeSubscriptionPeriod.yearly}
                    >
                      <span className="truncate">{t(yearly?.period ?? '')}</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="flex w-full flex-col items-center rounded-xl border bg-muted/30 px-4 py-5 sm:py-6">
                  {currentTab === StripeSubscriptionPeriod.yearly ? (
                    <>
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-center text-2xl font-bold tracking-tight sm:text-3xl [&>p]:text-2xl [&>p]:sm:text-3xl [&>p]:font-bold">
                          <Price price={yearly?.price ?? 0} />
                        </div>
                        <span className="text-sm text-muted-foreground">{t('perYear')}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-1 gap-y-0 text-sm text-muted-foreground">
                        <div className="[&_p]:m-0 [&_p]:inline [&_p]:text-sm">
                          <Price price={yearlyMonthlyEquivalent} />
                        </div>
                        <span>
                          {t('mo')} {t('billedAnnually')}
                        </span>
                      </div>
                      {savingsPercent > 0 && (
                        <TextBadge
                          className="mt-3"
                          label={t('savePercent', { percent: savingsPercent })}
                          variant="lime"
                        />
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-center text-2xl font-bold tracking-tight sm:text-3xl [&>p]:text-2xl [&>p]:sm:text-3xl [&>p]:font-bold">
                        <Price price={monthly?.price ?? 0} />
                      </div>
                      <span className="text-sm text-muted-foreground">{t('mo')}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <TabsContent value={StripeSubscriptionPeriod.yearly} className="mt-0 border-0 p-0">
                  {renderBenefits()}
                </TabsContent>
                <TabsContent value={StripeSubscriptionPeriod.monthly} className="mt-0 border-0 p-0">
                  {renderBenefits()}
                </TabsContent>
              </div>
            </div>
          </Tabs>
          <DialogFooter className="mt-2 flex-col gap-2 sm:flex-col">
            {user?.userId ? (
              <Button
                className="w-full"
                disabled={isFetching}
                isLoading={isFetching}
                size="lg"
                type="submit"
              >
                {t('upgrade')}
              </Button>
            ) : (
              <AuthRedirect>
                <Button className="w-full" size="lg">
                  {t('loginToContinue')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </AuthRedirect>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
