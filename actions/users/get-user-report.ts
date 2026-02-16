'use server';

import { format } from 'date-fns';
import Handlebars from 'handlebars';

import { getEmailTemplate } from '@/actions/mailer/get-email-template';
import { ONE_HOUR_SEC, REPORT_ID_TIMESTAMP_TEMPLATE } from '@/constants/common';
import { DEFAULT_LOCALE } from '@/constants/locale';
import { fetchCachedData } from '@/lib/cache';
import db from '@/lib/db';
import { formatNumber as formatNumberUtil, formatPrice, getConvertedPrice } from '@/lib/format';
import { truncate } from '@/lib/utils';

import { getBrowser } from '../virtualization/getBrowser';
import { getUserAiUsage } from './get-user-ai-usage';
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

Handlebars.registerHelper('formatCost', function (costDollars) {
  if (costDollars == null || costDollars === '') return 'N/A';

  const dollars = typeof costDollars === 'number' ? costDollars : parseFloat(costDollars);

  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    currency: 'USD',
    style: 'currency',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(dollars);
});

Handlebars.registerHelper('formatNumber', function (num) {
  if (num == null || num === '') return '0';

  const n = typeof num === 'number' ? num : parseInt(String(num), 10);

  return formatNumberUtil(n);
});

Handlebars.registerHelper('truncate', function (str, options) {
  const maxLen = options?.hash?.length ?? 200;

  return truncate(String(str ?? ''), maxLen);
});

Handlebars.registerHelper('paragraphs', function (text) {
  if (!text || typeof text !== 'string') return '';
  const parts = text.split(/\n\n+/).filter(Boolean);
  if (parts.length <= 1) return `<p>${Handlebars.escapeExpression(text.trim())}</p>`;
  return parts.map((p) => `<p>${Handlebars.escapeExpression(p.trim())}</p>`).join('');
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

      const aiUsage = await getUserAiUsage(userId, user?.email ?? '', 90).catch(() => ({
        requestCount: 0,
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalCostCents: 0,
        rows: [],
        byModel: [],
      }));

      const aiSummary = await getUserSummary({ userData, aiUsage });

      return {
        aiSummary,
        aiUsage,
        userData,
      };
    },
    ONE_HOUR_SEC,
  );

  const templateContent = await getEmailTemplate('user-report');
  const template = Handlebars.compile(templateContent);

  const { aiSummary, aiUsage, userData } = data;

  const reportId = `${userData.email}_${format(new Date(), REPORT_ID_TIMESTAMP_TEMPLATE)}_report`;
  const filename = `${reportId}.pdf`;

  const htmlContent = template({
    ...userData,
    aiSummary,
    aiUsage,
    reportId,
    currentDate: new Date().toLocaleDateString(DEFAULT_LOCALE, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    year: new Date().getFullYear(),
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
      top: '12mm',
      right: '15mm',
      bottom: '18mm',
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
          filename,
        },
      ],
      subject: `User Report for ${userData.email}`,
      text: "The user's report is ready. Please see the attachments.",
    },
  };
};
