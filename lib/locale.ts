import { setDefaultOptions } from 'date-fns';
import { be, enUS, ru } from 'date-fns/locale';

import { LOCALE } from '@/constants/locale';

import { isArray, isObject, isString } from './guard';

export const getLocale = (locale?: string | null, restrictedLocales: string[] = []) => {
  if (!locale) {
    return LOCALE.EN;
  }

  const availableLocale = (Object.values(LOCALE) as string[]).includes(locale) ? locale : LOCALE.EN;

  return restrictedLocales.includes(availableLocale) ? LOCALE.EN : availableLocale;
};

export const switchLanguage = (language: string) => {
  switch (language) {
    case LOCALE.RU:
      setDefaultOptions({ locale: ru });
      break;
    case LOCALE.BE:
      setDefaultOptions({ locale: be });
      break;
    default:
      setDefaultOptions({ locale: enUS });
      break;
  }
};

export const getFormatLocale = (language: string) => {
  switch (language) {
    case LOCALE.RU:
      return ru;
    case LOCALE.BE:
      return be;
    default:
      return enUS;
  }
};

export function replaceMessagePlaceholders<T>(obj: T, params: Record<string, string>): unknown {
  if (isString(obj)) {
    return obj.replace(/{(\w+)}/g, (_, key) => params[key] || `{${key}}`);
  }

  if (isArray<T>(obj)) {
    return obj.map((item) => replaceMessagePlaceholders(item, params));
  }

  if (isObject(obj) && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, replaceMessagePlaceholders(value, params)]),
    );
  }

  return obj;
}
