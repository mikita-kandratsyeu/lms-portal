import { LOCALE } from '@/constants/locale';
import beTranslations from '@/messages/general/be.json';
import enTranslations from '@/messages/general/en.json';
import ruTranslations from '@/messages/general/ru.json';

const generalTranslations = {
  [LOCALE.BE]: beTranslations,
  [LOCALE.EN]: enTranslations,
  [LOCALE.RU]: ruTranslations,
};

export const getGeneralTranslations = (locale: string) => {
  return generalTranslations[locale as LOCALE] ?? generalTranslations[LOCALE.EN];
};
