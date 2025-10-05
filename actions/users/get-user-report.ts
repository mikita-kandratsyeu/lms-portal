'use server';

import { format } from 'date-fns';
import Handlebars from 'handlebars';

import { getEmailTemplate } from '@/actions/mailer/get-email-template';
import { ONE_HOUR_SEC, TIMESTAMP_EMAIL_TEMPLATE } from '@/constants/common';
import { DEFAULT_LOCALE } from '@/constants/locale';
import { fetchCachedData } from '@/lib/cache';
import db from '@/lib/db';
import { formatPrice, getConvertedPrice } from '@/lib/format';

import { getBrowser } from '../virtualization/getBrowser';
import { getUserSummary } from './get-user-summary';

Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

Handlebars.registerHelper('formatDate', function (dateString) {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);

  return date.toLocaleDateString(DEFAULT_LOCALE, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

Handlebars.registerHelper('formatCurrency', function (amount, currency) {
  if (!amount) return 'N/A';

  return formatPrice(getConvertedPrice(amount), {
    locale: DEFAULT_LOCALE,
    currency,
  });
});

export const getUserReportBuffer = async (userId: string) => {
  const data = await fetchCachedData(
    `user-report_${userId}`,
    async () => {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          conversations: {
            select: {
              id: true,
              title: true,
              createdAt: true,
              messages: {
                select: {
                  feedback: true,
                  createdAt: true,
                  model: true,
                  role: true,
                  imageGeneration: true,
                  content: true,
                },
              },
            },
          },
          csmIssues: {
            select: {
              id: true,
              createdAt: true,
              description: true,
              email: true,
              status: true,
              name: true,
              attachments: {
                select: {
                  id: true,
                  createdAt: true,
                  name: true,
                  url: true,
                },
              },
            },
          },
          oauth: true,
          stripeSubscription: true,
          copilotRequestLimit: true,
        },
      });

      const purchases = await db.purchase.findMany({
        where: { userId },
        include: {
          details: true,
        },
      });

      const courseIds = purchases.map((item) => item.courseId);
      const courses = await db.course.findMany({ where: { id: { in: courseIds } } });

      const userData = {
        ...user,
        purchases: purchases.map((item) => {
          const courseTitle = courses.find((i) => i.id === item.courseId)?.title;
          return { ...item, courseTitle };
        }),
      };

      const aiSummary = await getUserSummary(userData);

      return {
        aiSummary,
        userData,
      };
    },
    ONE_HOUR_SEC,
  );

  const templateContent = await getEmailTemplate('user-report');
  const template = Handlebars.compile(templateContent);

  const { aiSummary, userData } = data;

  const htmlContent = template({
    ...userData,
    aiSummary,
    currentDate: new Date().toLocaleDateString(DEFAULT_LOCALE, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  });

  const browser = await getBrowser();

  const page = await browser.newPage();

  await page.setContent(htmlContent, {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '15mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm',
    },
    preferCSSPageSize: true,
    timeout: 60000,
  });

  await browser.close();

  return {
    pdfBuffer,
    emailOptions: {
      attachments: [
        {
          content: pdfBuffer,
          contentType: 'application/pdf',
          filename: `${userData.email}_${format(new Date(), TIMESTAMP_EMAIL_TEMPLATE)}_report.pdf`,
        },
      ],
      subject: `User Report for ${userData.email}`,
      text: "The user's report is ready. Please see the attachments.",
    },
  };
};
