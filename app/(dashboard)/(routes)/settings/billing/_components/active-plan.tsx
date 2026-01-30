'use client';

import { differenceInDays, format, isBefore } from 'date-fns';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  CreditCard,
  Gift,
  RefreshCw,
  TrendingUp,
  Wallet,
  XCircle,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { getUserSubscription } from '@/actions/stripe/get-user-subscription';
import { Banner } from '@/components/common/banner';
import { CreditCardInfo } from '@/components/common/credit-card-info';
import { Price } from '@/components/common/price';
import { Alert, AlertDescription, Badge, Button, Progress, Separator } from '@/components/ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

  const getSubscriptionProgress = () => {
    if (!userSubscription) return 0;

    const start = userSubscription.startPeriod.getTime();
    const end = userSubscription.endPeriod.getTime();
    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;

    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const isCardExpiringSoon = () => {
    if (!userSubscription?.paymentMethod) return false;

    const { expMonth, expYear } = userSubscription.paymentMethod;
    const cardExpiry = new Date(expYear, expMonth - 1);
    const daysUntilExpiry = differenceInDays(cardExpiry, new Date());

    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const isInTrial = () => {
    if (!userSubscription?.trialEnd) return false;

    return isBefore(new Date(), userSubscription.trialEnd);
  };

  const trialDaysRemaining = () => {
    if (!userSubscription?.trialEnd) return 0;

    return Math.max(differenceInDays(userSubscription.trialEnd, new Date()), 0);
  };

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
      {userSubscription && isInTrial() && (
        <div className="relative overflow-hidden rounded-lg border border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10">
                <Gift className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                {t('trialTitle')}
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {t('trialDescription', {
                  days: trialDaysRemaining(),
                })}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                {t('firstPaymentOn', {
                  date: format(userSubscription.trialEnd!, TIMESTAMP_SUBSCRIPTION_TEMPLATE),
                })}
              </p>
            </div>
          </div>
        </div>
      )}
      {userSubscription?.cancelAt && (
        <Banner
          label={t('cancelBanner', {
            date: format(userSubscription.endPeriod, TIMESTAMP_SUBSCRIPTION_TEMPLATE),
            planName: userSubscription.planName,
          })}
          variant="warning"
        />
      )}
      {userSubscription && isCardExpiringSoon() && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{t('cardExpiring')}</AlertDescription>
        </Alert>
      )}
      {userSubscription && (
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
              <CardTitle className="text-2xl">{userSubscription.planName}</CardTitle>
              <Badge
                variant={userSubscription.cancelAt ? 'destructive' : 'default'}
                className="flex items-center gap-1.5 w-fit"
              >
                {userSubscription.cancelAt ? (
                  <>
                    <XCircle className="h-3.5 w-3.5" />
                    {t('cancelled')}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t('active')}
                  </>
                )}
              </Badge>
            </div>
            <CardDescription className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">
                <Price
                  currency={userSubscription.price.currency}
                  ignoreExchangeRate
                  price={userSubscription.price.unitAmount}
                />
              </span>
              <span className="text-base text-muted-foreground">
                {t(userSubscription.plan.interval === 'month' ? 'mo' : 'year')}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="mt-0.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    {userSubscription.cancelAt ? t('endsOn') : t('renewsOn')}
                  </p>
                  <p className="text-sm font-semibold break-words">
                    {format(userSubscription.endPeriod, TIMESTAMP_SUBSCRIPTION_TEMPLATE)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="mt-0.5">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground">{t('startedOn')}</p>
                  <p className="text-sm font-semibold break-words">
                    {format(userSubscription.startPeriod, TIMESTAMP_SUBSCRIPTION_TEMPLATE)}
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription Progress Bar */}
            {!isInTrial() && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t('billingCycleProgress')}</span>
                  <span>
                    {differenceInDays(userSubscription.endPeriod, new Date())} {t('daysRemaining')}
                  </span>
                </div>
                <Progress value={getSubscriptionProgress()} className="h-2" />
              </div>
            )}
            {!userSubscription.cancelAt && !isInTrial() && (
              <>
                <Separator />
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                  <div className="mt-0.5">
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">{t('nextPayment')}</p>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="text-lg font-bold text-foreground">
                        <Price
                          currency={userSubscription.price.currency}
                          ignoreExchangeRate
                          price={userSubscription.price.unitAmount}
                        />
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {t('on')}{' '}
                        {format(userSubscription.endPeriod, TIMESTAMP_SUBSCRIPTION_TEMPLATE)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <RefreshCw
                className={`h-4 w-4 ${userSubscription.cancelAt ? 'text-muted-foreground' : 'text-green-600 dark:text-green-400'}`}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {userSubscription.cancelAt ? t('autoRenewalOff') : t('autoRenewalOn')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {userSubscription.cancelAt ? t('autoRenewalOffDesc') : t('autoRenewalOnDesc')}
                </p>
              </div>
            </div>
            {userSubscription.paymentMethod && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs font-medium text-muted-foreground">
                      {t('paymentMethod')}
                    </p>
                  </div>
                  <CreditCardInfo
                    brand={userSubscription.paymentMethod.brand}
                    expMonth={userSubscription.paymentMethod.expMonth}
                    expYear={userSubscription.paymentMethod.expYear}
                    last4={userSubscription.paymentMethod.last4}
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button
              disabled={isFetching}
              isLoading={isFetching}
              onClick={handleManageSubscription}
              className="w-full sm:w-auto"
            >
              {t('manageSubscription')}
            </Button>
          </CardFooter>
        </Card>
      )}
      {!userSubscription && (
        <Card className="shadow-none">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t('noSubscription')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
