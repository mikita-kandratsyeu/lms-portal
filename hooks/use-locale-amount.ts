import { Fee } from '@prisma/client';
import { useMemo } from 'react';

import { DEFAULT_EXCHANGE_RATE } from '@/constants/locale';
import { formatPrice, getConvertedPrice, getScaledPrice } from '@/lib/format';
import { isNumber } from '@/lib/guard';
import { hasJsonStructure } from '@/lib/utils';

import { useLocaleStore } from './store/use-locale-store';
import { useFeesAmount } from './use-fees-amount';

type UseLocaleAmount = {
  currency?: string;
  customRates?: string | null;
  fees?: Fee[];
  ignoreExchangeRate?: boolean;
  price: number | null;
  roundToNearestFive?: boolean;
  useDefaultLocale?: boolean;
};

export const useLocaleAmount = ({
  currency,
  customRates,
  fees = [],
  ignoreExchangeRate = false,
  price,
  roundToNearestFive = false,
  useDefaultLocale = false,
}: UseLocaleAmount) => {
  const localeInfo = useLocaleStore((state) => state.localeInfo);

  const locale = localeInfo?.locale
    ? { ...localeInfo.locale, currency: currency ?? localeInfo.locale.currency }
    : null;

  const exchangeRate = useMemo(() => {
    if (useDefaultLocale || ignoreExchangeRate) {
      return DEFAULT_EXCHANGE_RATE;
    }

    if (locale?.currency && hasJsonStructure(customRates ?? '')) {
      return JSON.parse(customRates!)[locale.currency];
    }
    return localeInfo?.rate ?? DEFAULT_EXCHANGE_RATE;
  }, [customRates, ignoreExchangeRate, locale?.currency, localeInfo?.rate, useDefaultLocale]);

  const amount = Math.round(
    getScaledPrice(getConvertedPrice((price ?? 0) * exchangeRate, roundToNearestFive)),
  );

  const { net, calculatedFees } = useFeesAmount({ exchangeRate, fees, price: amount });

  const formattedPrice = locale ? formatPrice(getConvertedPrice(amount), locale) : null;
  const formattedNet = locale ? formatPrice(getConvertedPrice(net), locale) : null;
  const formattedCalculatedFees = calculatedFees.map((fee) => ({
    ...fee,
    amount: locale ? formatPrice(getConvertedPrice(fee.amount), locale) : null,
  }));
  const formattedTotalFees = locale
    ? formatPrice(
        getConvertedPrice(calculatedFees.reduce((total, fee) => total + fee.amount, 0)),
        locale,
      )
    : null;

  const isLoading = !isNumber(price) || !formattedPrice || !localeInfo;

  return {
    ...(useDefaultLocale
      ? {
          amount: price,
          formattedNet: formatPrice(getConvertedPrice(net)),
          formattedPrice: formatPrice(getConvertedPrice(price ?? 0)),
          formattedCalculatedFees: calculatedFees.map((fee) => ({
            ...fee,
            amount: formatPrice(getConvertedPrice(fee.amount)),
          })),
          formattedTotalFees: formatPrice(
            getConvertedPrice(calculatedFees.reduce((total, fee) => total + fee.amount, 0)),
          ),
        }
      : { amount, formattedNet, formattedPrice, formattedCalculatedFees, formattedTotalFees }),
    isLoading,
  };
};
