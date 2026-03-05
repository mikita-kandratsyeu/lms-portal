'use client';

import { Download, ExternalLink, HandCoins } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { getAnalytics } from '@/actions/analytics/get-analytics';
import { ReportModal } from '@/components/modals/report-modal';
import { RequestPayoutModal } from '@/components/modals/request-payout-modal';
import { Button } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { Report } from '@/constants/payments';
import { useCurrentUser } from '@/hooks/use-current-user';
import { fetcher } from '@/lib/fetcher';

import { BalanceAmount } from './balance-amount';

type Analytics = Awaited<ReturnType<typeof getAnalytics>>;

type ActionsProps = {
  disableRequest?: boolean;
  stripeConnect: Analytics['stripeConnect'];
  totalProfit: Analytics['totalProfit'];
};

export const Actions = ({ disableRequest = false, stripeConnect, totalProfit }: ActionsProps) => {
  const t = useTranslations('teacher.analytics.stripeConnect');
  const { toast } = useToast();
  const { user } = useCurrentUser();

  const [isFetching, setIsFetching] = useState(false);

  const handleCreateAccount = async () => {
    setIsFetching(true);

    try {
      const response = await fetcher.post(`/api/payments/stripe-connect/${user?.userId}/create`, {
        responseType: 'json',
      });

      toast({ title: t('redirectOnboarding') });
      window.location.assign(response.url);
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsFetching(false);
    }
  };

  const handleLoginAccount = async () => {
    setIsFetching(true);

    try {
      const response = await fetcher.post(`/api/payments/stripe-connect/${user?.userId}/login`, {
        responseType: 'json',
      });

      toast({ title: t('redirectExpress') });
      window.location.assign(response.url);
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="pt-6 flex flex-col md:flex-row gap-4 items-center md:justify-between">
      <BalanceAmount stripeConnect={stripeConnect} />
      <div className="flex flex-col md:flex-row gap-3 md:gap-2 items-center w-full md:w-auto">
        {(!stripeConnect || !stripeConnect?.isActive) && (
          <Button className="w-full" disabled={isFetching} onClick={handleCreateAccount}>
            {!stripeConnect && <span>{t('createAccount')}</span>}
            {stripeConnect && !stripeConnect?.isActive && <span>{t('continueCreating')}</span>}
          </Button>
        )}
        {stripeConnect && stripeConnect.isActive && (
          <div className="flex flex-col gap-2 w-full">
            <RequestPayoutModal stripeConnect={stripeConnect} totalProfit={totalProfit}>
              <Button
                disabled={isFetching || !totalProfit?.availableForPayout || disableRequest}
                className="w-full"
              >
                <HandCoins className="h-4 w-4 mr-2" />
                <span>{t('requestPayout')}</span>
              </Button>
            </RequestPayoutModal>
            <ReportModal reportType={Report.CONNECT} stripeConnect={stripeConnect}>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                {t('downloadReport')}
              </Button>
            </ReportModal>
            <Button
              disabled={isFetching}
              onClick={handleLoginAccount}
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              <span>{t('stripeExpress')}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
