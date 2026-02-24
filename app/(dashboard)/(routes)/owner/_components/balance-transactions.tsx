'use client';

import { format, fromUnixTime } from 'date-fns';
import { useTranslations } from 'next-intl';

import type { BalanceTransactionItem } from '@/actions/stripe/get-stripe-balance-transactions';
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
import { formatPrice, getConvertedPrice } from '@/lib/format';
import { capitalize, cn } from '@/lib/utils';

type BalanceTransactionsProps = {
  transactions: BalanceTransactionItem[];
};

const getTransactionTypeKey = (type: string, reportingCategory: string): string => {
  const category = reportingCategory || type;

  const typeMap: Record<string, string> = {
    charge: 'charge',
    payment: 'payment',
    subscription: 'subscription',
    transfer: 'transfer',
    payout: 'payout',
    refund: 'refund',
    payment_refund: 'paymentRefund',
    application_fee: 'applicationFee',
    adjustment: 'adjustment',
    stripe_fee: 'stripeFee',
  };

  return typeMap[category] ?? 'other';
};

export const BalanceTransactions = ({ transactions }: BalanceTransactionsProps) => {
  const t = useTranslations('owner.balanceTransactions');

  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-6">
      <Accordion type="single" collapsible>
        <AccordionItem value="transactions" className="border-none">
          <AccordionTrigger className="pt-0 pb-2 hover:no-underline">
            <p>{t('title')}</p>
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">{t('columns.type')}</TableHead>
                  <TableHead>{t('columns.date')}</TableHead>
                  <TableHead>{t('columns.status')}</TableHead>
                  <TableHead>{t('columns.amount')}</TableHead>
                  <TableHead>{t('columns.fee')}</TableHead>
                  <TableHead className="text-right">{t('columns.net')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const locale = {
                    locale: DEFAULT_LOCALE,
                    currency: tx.currency,
                  };

                  const typeKey = getTransactionTypeKey(tx.type, tx.reportingCategory);
                  const typeLabel = t(`types.${typeKey}`);

                  const statusVariant = tx.status === 'available' ? 'green' : 'default';
                  const isCredit = tx.net > 0;

                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">{typeLabel}</TableCell>
                      <TableCell>{format(fromUnixTime(tx.created), TIMESTAMP_TEMPLATE)}</TableCell>
                      <TableCell>
                        <TextBadge label={capitalize(tx.status)} variant={statusVariant} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatPrice(getConvertedPrice(tx.amount), locale)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatPrice(getConvertedPrice(tx.fee), locale)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right font-semibold whitespace-nowrap',
                          isCredit ? 'text-green-600' : 'text-muted-foreground',
                        )}
                      >
                        {isCredit ? '+' : ''}
                        {formatPrice(getConvertedPrice(tx.net), locale)}
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
