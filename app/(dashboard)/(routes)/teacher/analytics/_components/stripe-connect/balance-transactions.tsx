'use client';

import { format, fromUnixTime } from 'date-fns';
import { useTranslations } from 'next-intl';

import { getAnalytics } from '@/actions/analytics/get-analytics';
import { TextBadge } from '@/components/common/text-badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { TIMESTAMP_TEMPLATE } from '@/constants/common';
import { DEFAULT_LOCALE } from '@/constants/locale';
import { PayoutRequestStatus } from '@/constants/payments';
import { formatPrice, getConvertedPrice } from '@/lib/format';
import { capitalize } from '@/lib/utils';

type Analytics = Awaited<ReturnType<typeof getAnalytics>>;

type BalanceTransactionsProps = { stripeConnectPayout: Analytics['stripeConnectPayouts'] };

export const BalanceTransactions = ({ stripeConnectPayout }: BalanceTransactionsProps) => {
  const t = useTranslations('teacher.analytics.stripeConnect');

  return (
    <div className="w-full mt-6">
      <Accordion type="single" collapsible>
        <AccordionItem value="transactions" className="border-none">
          <AccordionTrigger className="pt-0 pb-2 hover:no-underline">
            <p>{t('recentTransactions')}</p>
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">{t('table.type')}</TableHead>
                  <TableHead>{t('table.date')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead>{t('table.totalAmount')}</TableHead>
                  <TableHead>{t('table.feeAmount')}</TableHead>
                  <TableHead className="text-right">{t('table.netAmount')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stripeConnectPayout.map((scp) => {
                  const locale = {
                    locale: DEFAULT_LOCALE,
                    currency: scp.currency,
                  };

                  const variant = (() => {
                    if (scp.status === PayoutRequestStatus.AVAILABLE) {
                      return 'green';
                    }

                    if (scp.status === PayoutRequestStatus.DECLINED) {
                      return 'red';
                    }

                    return 'default';
                  })();

                  return (
                    <TableRow key={scp.id}>
                      <TableCell className="font-medium">{capitalize(scp.type)}</TableCell>
                      <TableCell>{format(fromUnixTime(scp.created), TIMESTAMP_TEMPLATE)}</TableCell>
                      <TableCell>
                        <TextBadge label={capitalize(scp.status)} variant={variant} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatPrice(getConvertedPrice(scp.amount), locale)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatPrice(getConvertedPrice(scp.fee), locale)}
                      </TableCell>
                      <TableCell className="text-right font-semibold whitespace-nowrap">
                        {formatPrice(getConvertedPrice(scp.net), locale)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
