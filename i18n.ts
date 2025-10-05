import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

import { DEFAULT_LANGUAGE, USER_LOCALE_COOKIE } from './constants/locale';
import { getLocale } from './lib/locale';

export default getRequestConfig(async () => {
  const headersList = await headers();
  const cookieStore = await cookies();
  const acceptLanguage = headersList.get('accept-language');

  const defaultBrowserLocale = getLocale(
    acceptLanguage?.split(',')?.[1]?.split(';')?.[0] || acceptLanguage,
  );

  const locale =
    cookieStore.get(USER_LOCALE_COOKIE)?.value ?? defaultBrowserLocale ?? DEFAULT_LANGUAGE;

  return {
    locale,
    messages: (await import(`/messages/general/${locale}.json`)).default,
    timeZone: 'UTC',
  };
});
