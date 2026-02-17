import { geolocation } from '@vercel/functions';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getAppConfig } from '@/actions/configs/get-app-config';
import { getExchangeRates } from '@/actions/exchange/get-exchange-rates';
import {
  CURRENCY_BY_COUNTRY,
  DEFAULT_COUNTRY_CODE,
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
} from '@/constants/locale';

export const GET = async (req: NextRequest) => {
  try {
    const {
      features: { enableDynamicPricing },
    } = await getAppConfig();
    const geo = geolocation(req);

    const currency = enableDynamicPricing
      ? CURRENCY_BY_COUNTRY[
          (geo.country ?? DEFAULT_COUNTRY_CODE) as keyof typeof CURRENCY_BY_COUNTRY
        ]
      : null;

    const locale = { currency: currency ?? DEFAULT_CURRENCY, locale: DEFAULT_LOCALE };
    const details = {
      city: geo.city,
      country: geo.country,
      countryCode: geo.country,
      latitude: geo.latitude,
      longitude: geo.longitude,
      timezone: DEFAULT_TIMEZONE,
    };

    let rates = {};

    if (enableDynamicPricing) {
      const { exchangeRates } = await getExchangeRates();
      rates = exchangeRates;
    }

    return NextResponse.json({
      details,
      exchangeRates: rates,
      locale,
    });
  } catch (error) {
    console.error('[GET_GEO]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
