'use client';

import { Download, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { BalanceTransactionItem } from '@/actions/stripe/get-stripe-balance-transactions';
import { BalanceTransactions } from '@/app/(dashboard)/(routes)/owner/_components/balance-transactions';
import { ReportModal } from '@/components/modals/report-modal';
import { Button, Card, CardContent } from '@/components/ui';
import { Report } from '@/constants/payments';

type StripeBalancesProps = {
  balanceTransactions?: BalanceTransactionItem[];
};

export const StripeBalances = ({ balanceTransactions = [] }: StripeBalancesProps) => {
  const t = useTranslations('owner');

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-col gap-1">
        <p className="font-medium text-xl">{t('page.sections.stripe.title')}</p>
        <span className="text-xs text-muted-foreground">
          {t('page.sections.stripe.description')}
        </span>
      </div>
      <Card className="shadow-none">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-blue-500" />
              <p className="text-sm">
                {t('stripe.secureProcessing')}{' '}
                <span className="text-blue-500 font-semibold">Stripe</span>
              </p>
            </div>
            <ReportModal reportType={Report.OWNER}>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {t('stripe.downloadReport')}
              </Button>
            </ReportModal>
          </div>
          <BalanceTransactions transactions={balanceTransactions} />
        </CardContent>
      </Card>
    </div>
  );
};
