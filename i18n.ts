import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

import { DEFAULT_LANGUAGE, USER_LOCALE_COOKIE } from './constants/locale';
import { getLocale } from './lib/locale';
import { getGeneralTranslations } from './lib/translations/general';

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
    messages: getGeneralTranslations(locale),
    timeZone: 'UTC',
  };
});
