import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';

import { getAiPricingCsvData } from '@/actions/ai/pricing/get-ai-pricing';
import { getCurrentUser } from '@/actions/auth/get-current-user';
import { sentEmailTo } from '@/actions/mailer/sent-email-to';
import { Period } from '@/constants/ai/analytics';

const PERIOD_TO_DAYS: Record<string, number | null> = {
  [Period['7D']]: 7,
  [Period['30D']]: 30,
  [Period['90D']]: 90,
  [Period.ALL]: null,
};

async function buildCsvForPeriod(period: string) {
  const periodDays = PERIOD_TO_DAYS[period] ?? 30;
  const t = await getTranslations('ai-agents.usage.export');
  const rows = await getAiPricingCsvData({ periodDays });

  const headers = [
    t('date'),
    t('email'),
    t('model'),
    t('provider'),
    t('referer'),
    t('inputTokens'),
    t('outputTokens'),
    t('totalTokens'),
    t('cachedTokens'),
    t('cost'),
  ];

  const csvRows = rows.map((row) =>
    [
      row.createdAt,
      row.email,
      row.model,
      row.provider,
      row.referer ?? '',
      row.inputTokens,
      row.outputTokens,
      row.totalTokens,
      row.cachedTokens,
      `$${row.costCents.toFixed(4)}`,
    ].join(','),
  );

  const csv = [headers.join(','), ...csvRows].join('\n');
  return { csv, rows, t };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const period = searchParams.get('period') || Period['30D'];

  const { csv, rows, t } = await buildCsvForPeriod(period);

  if (!rows.length) {
    return new NextResponse(t('noData'), { status: 204 });
  }

  return new NextResponse(csv, {
    headers: {
      'Content-Disposition': `attachment; filename="ai-usage-${period}.csv"`,
      'Content-Type': 'text/csv; charset=utf-8',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user?.userId || !user?.email) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const body = await req.json().catch(() => ({}));
    const period = (body.period as string) || Period['30D'];

    const { csv, rows, t } = await buildCsvForPeriod(period);

    if (!rows.length) {
      return new NextResponse(t('noData'), { status: StatusCodes.BAD_REQUEST });
    }

    const filename = `ai-usage-${period}.csv`;
    const result = await sentEmailTo({
      attachments: [
        {
          content: Buffer.from(csv, 'utf-8'),
          contentType: 'text/csv; charset=utf-8',
          filename,
        },
      ],
      emails: [user.email],
      subject: t('emailSubject'),
      text: t('emailText'),
    });

    if (!result.messageId) {
      return new NextResponse(t('emailFailed'), { status: StatusCodes.INTERNAL_SERVER_ERROR });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AI_USAGE_EXPORT_EMAIL]', error);
    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}
