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

interface IpInfoResponse {
  ip: string;
  city?: string;
  country?: string;
  loc?: string;
  timezone?: string;
  bogon?: boolean;
}

function getClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get('x-forwarded-for');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return req.headers.get('x-real-ip');
}

async function getGeoFromIp(ip: string): Promise<IpInfoResponse | null> {
  try {
    const res = await fetch(`https://ipinfo.io/${ip}/json`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    const data: IpInfoResponse = await res.json();

    return data.bogon ? null : data;
  } catch {
    return null;
  }
}

export const GET = async (req: NextRequest) => {
  try {
    const {
      features: { enableDynamicPricing },
    } = await getAppConfig();

    const ip = getClientIp(req);
    const geoData = ip ? await getGeoFromIp(ip) : null;

    const [latitude, longitude] = geoData?.loc?.split(',') ?? [];
    const countryCode = geoData?.country ?? DEFAULT_COUNTRY_CODE;

    const currency = enableDynamicPricing
      ? CURRENCY_BY_COUNTRY[countryCode as keyof typeof CURRENCY_BY_COUNTRY]
      : null;

    const locale = { currency: currency ?? DEFAULT_CURRENCY, locale: DEFAULT_LOCALE };
    const details = {
      city: geoData?.city,
      country: geoData?.country,
      countryCode,
      latitude,
      longitude,
      timezone: geoData?.timezone ?? DEFAULT_TIMEZONE,
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
    console.error('[GET_USER_LOCATION_GEO]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
