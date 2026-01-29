'use client';

import { useRouter } from 'next/navigation';
import { SyntheticEvent, useEffect, useState } from 'react';

import { getAnalytics } from '@/actions/analytics/get-analytics';
import { CurrencyInput } from '@/components/common/currency-input';
import { Button } from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '@/constants/locale';
import { MIN_PAYOUT_AMOUNT } from '@/constants/payments';
import { useCurrentUser } from '@/hooks/use-current-user';
import { fetcher } from '@/lib/fetcher';
import { formatPrice, getConvertedPrice, getScaledPrice } from '@/lib/format';

type Analytics = Awaited<ReturnType<typeof getAnalytics>>;

type RequestPayoutModalProps = {
  children: React.ReactNode;
  stripeConnect: Analytics['stripeConnect'];
  totalProfit: Analytics['totalProfit'];
};

export const RequestPayoutModal = ({
  children,
  stripeConnect,
  totalProfit,
}: RequestPayoutModalProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useCurrentUser();

  const [price, setPrice] = useState<string | number>(getConvertedPrice(MIN_PAYOUT_AMOUNT));
  const [errorMessage, setErrorMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const locale = {
    locale: DEFAULT_LOCALE,
    currency: stripeConnect?.currency ?? DEFAULT_CURRENCY,
  };

  useEffect(() => {
    const amount = getScaledPrice(Number(price));

    if (amount < MIN_PAYOUT_AMOUNT) {
      setErrorMessage(
        `The minimum withdrawal amount is ${formatPrice(getConvertedPrice(MIN_PAYOUT_AMOUNT), locale)}`,
      );
    } else if (Math.round(amount) > (totalProfit?.availableForPayout ?? 0)) {
      setErrorMessage(
        `The maximum withdrawal amount is ${formatPrice(getConvertedPrice(totalProfit?.availableForPayout ?? 0), locale)}`,
      );
    } else {
      setErrorMessage('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price]);

  const handleOnPriceChange = (_price?: string) => {
    if (!_price) {
      setPrice('');
      return;
    }

    setPrice(_price);
  };

  const handleRequestPayout = async (event: SyntheticEvent) => {
    event.preventDefault();

    try {
      setIsFetching(true);

      await fetcher.post(`/api/payments/stripe-connect/${user?.userId}/request`, {
        responseType: 'json',
        body: { amount: getScaledPrice(Number(price)), currency: locale.currency },
      });

      toast({ title: 'Payout request created' });
      router.refresh();
    } catch {
      toast({ description: 'Insufficient funds on the balance sheet', isError: true });
    } finally {
      setIsFetching(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleRequestPayout}>
          <DialogHeader>
            <DialogTitle>Request payout</DialogTitle>
            <DialogDescription>
              Enter the amount of money you would like to withdraw.
            </DialogDescription>
          </DialogHeader>
          <div className="w-full my-4">
            <div>
              <CurrencyInput
                disabled={isFetching}
                intlConfig={locale}
                name="price"
                onValueChange={handleOnPriceChange}
                placeholder="Enter the amount"
                value={price}
              />
              {Boolean(errorMessage) && <p className="text-xs text-red-500 mt-2">{errorMessage}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={Boolean(errorMessage) || isFetching}
              isLoading={isFetching}
              type="submit"
            >
              Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
