'use server';

import Handlebars from 'handlebars';
import { getLocale } from 'next-intl/server';
import Mail from 'nodemailer/lib/mailer';

import { replaceMessagePlaceholders } from '@/lib/locale';

import { getEmailTemplate } from './get-email-template';
import { sentEmailTo } from './sent-email-to';

type SentEmailByTemplate = {
  attachments?: Mail.Attachment[];
  emails: string[];
  locale?: string;
  params: Record<string, string>;
  subject?: string;
  template: string;
};

export const sentEmailByTemplate = async ({
  attachments,
  emails,
  locale: customLocale,
  params,
  subject: customSubject,
  template,
}: SentEmailByTemplate) => {
  try {
    const locale = customLocale ?? (await getLocale());
    let translations = (await import(`/messages/email/${locale}.json`)).default[template];

    const templateContent = await getEmailTemplate(template);
    const templateHtml = Handlebars.compile(templateContent);

    translations = replaceMessagePlaceholders(translations, params);

    const html = templateHtml({
      ...translations,
      ...params,
      lang: locale,
      title: template,
      year: new Date().getFullYear().toString(),
    });

    const emailMessage = await sentEmailTo({
      attachments,
      emails,
      subject: customSubject ?? translations?.subject,
      html,
    });
    return { messageId: emailMessage.messageId };
  } catch (error) {
    console.error('[SENT_MAIL_BY_TEMPLATE_ACTION]', error);

    return { messageId: null };
  }
};
