import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '@/constants/locale';

import { roundToNearestFive as roundToNearestFiveFn } from './price';

export const formatPrice = (
  price: number,
  { locale, currency }: { locale: string; currency: string } = {
    currency: DEFAULT_CURRENCY,
    locale: DEFAULT_LOCALE,
  },
) =>
  new Intl.NumberFormat(locale, {
    currency,
    style: 'currency',
  }).format(price);

export const getCurrencySymbol = (locale: string, currency: string) =>
  (0)
    .toLocaleString(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    .replace(/\d/g, '')
    .trim();

export const getConvertedPrice = (price: number, roundToNearestFive?: boolean) =>
  roundToNearestFive ? roundToNearestFiveFn(price / 100) : price / 100;

export const getScaledPrice = (price: number) => price * 100;
