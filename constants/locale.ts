export const DEFAULT_COUNTRY_CODE = 'US';
export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_EXCHANGE_RATE = 1;
export const DEFAULT_LOCALE = 'en-US';
export const DEFAULT_LANGUAGE = 'en';
export const DEFAULT_TIMEZONE = 'Etc/UTC';

export const ALLOWED_CURRENCY = ['USD', 'EUR', 'BYN', 'GBP', 'PLN', 'RUB'];
export const CURRENCY_BY_COUNTRY = {
  BY: 'BYN',
  DE: 'EUR',
  ES: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  PL: 'PLN',
  RU: 'RUB',
  UK: 'GBP',
  US: 'USD',
};

export const USER_LOCALE_COOKIE = 'NEXT_LOCALE';
export enum LOCALE {
  BE = 'be',
  EN = 'en',
  RU = 'ru',
}
export const SUPPORTED_LOCALES = [
  { key: LOCALE.EN, title: 'English' },
  { key: LOCALE.RU, title: 'Русский' },
  { key: LOCALE.BE, title: 'Беларускі' },
];
