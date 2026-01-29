import { LOCALE } from '@/constants/locale';
import beTranslations from '@/messages/email/be.json';
import enTranslations from '@/messages/email/en.json';
import ruTranslations from '@/messages/email/ru.json';

export type EmailTemplateKey = keyof typeof enTranslations;

const emailTranslations = {
  [LOCALE.BE]: beTranslations,
  [LOCALE.EN]: enTranslations,
  [LOCALE.RU]: ruTranslations,
};

export const getEmailTranslations = (locale: string) => {
  return emailTranslations[locale as LOCALE] ?? emailTranslations[LOCALE.EN];
};
