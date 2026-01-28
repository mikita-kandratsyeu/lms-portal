'use client';

import { Download, Wallet } from 'lucide-react';

import { ReportModal } from '@/components/modals/report-modal';
import { Button, Card, CardContent } from '@/components/ui';
import { Report } from '@/constants/payments';

export const StripeBalances = () => {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-col gap-1">
        <p className="font-medium text-xl">Stripe Account</p>
        <span className="text-xs text-muted-foreground">
          Connected payment service provider for secure transactions
        </span>
      </div>
      <Card className="shadow-none">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-blue-500" />
              <p className="text-sm">
                All financial transactions are securely processed through{' '}
                <span className="text-blue-500 font-semibold">Stripe</span>
              </p>
            </div>
            <ReportModal reportType={Report.OWNER}>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </ReportModal>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
