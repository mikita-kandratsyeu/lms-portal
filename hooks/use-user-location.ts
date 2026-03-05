import { useEffect } from 'react';

import {
  ALLOWED_CURRENCY,
  DEFAULT_COUNTRY_CODE,
  DEFAULT_CURRENCY,
  DEFAULT_EXCHANGE_RATE,
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
} from '@/constants/locale';
import { fetcher } from '@/lib/fetcher';

import { useLocaleStore } from './store/use-locale-store';

const defaultLocaleInfo = {
  locale: { currency: DEFAULT_CURRENCY, locale: DEFAULT_LOCALE },
  details: {
    city: 'Unknown',
    country: 'Unknown',
    countryCode: DEFAULT_COUNTRY_CODE,
    latitude: 0,
    longitude: 0,
    timezone: DEFAULT_TIMEZONE,
  },
  rate: DEFAULT_EXCHANGE_RATE,
};

export const useUserLocation = () => {
  const { handleExchangeRates, handleLocaleInfo } = useLocaleStore((state) => ({
    handleExchangeRates: state.setExchangeRates,
    handleLocaleInfo: state.setLocaleInfo,
  }));

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const { details, exchangeRates, locale } = await fetcher.get('/api/geo', {
          responseType: 'json',
        });

        if (exchangeRates?.rates && Object.keys(exchangeRates.rates).length > 0) {
          handleExchangeRates({
            ...exchangeRates,
            rates: Object.keys(exchangeRates.rates)
              .filter((key) => ALLOWED_CURRENCY.includes(key))
              .reduce((rates, key) => {
                rates[key as keyof typeof rates] = exchangeRates.rates[key] as never;
                return rates;
              }, {}),
          });
        }

        handleLocaleInfo({
          details,
          locale,
          rate: exchangeRates?.rates?.[locale.currency] ?? DEFAULT_EXCHANGE_RATE,
        });
      } catch (error) {
        console.error('[USE_USER_LOCATION]', error);

        handleLocaleInfo(defaultLocaleInfo);
      }
    };

    getUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
