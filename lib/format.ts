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

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const formatCompactNumber = (num: number): string => {
  if (num < 1000) return num.toString();
  if (num < 1_000_000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1_000_000_000) return `${(num / 1_000_000).toFixed(1)}M`;

  return `${(num / 1_000_000_000).toFixed(1)}B`;
};
