import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';

import { getAiPricingCsvData } from '@/actions/ai/pricing/get-ai-pricing';
import { Period } from '@/constants/ai/analytics';

const PERIOD_TO_DAYS: Record<string, number | null> = {
  [Period['7D']]: 7,
  [Period['30D']]: 30,
  [Period['90D']]: 90,
  [Period.ALL]: null,
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const period = searchParams.get('period') || Period['30D'];
  const periodDays = PERIOD_TO_DAYS[period] ?? 30;

  const t = await getTranslations('ai-agents.usage.export');

  const rows = await getAiPricingCsvData({ periodDays });

  if (!rows.length) {
    return new NextResponse(t('noData'), { status: 204 });
  }

  const headers = [
    t('date'),
    t('email'),
    t('model'),
    t('provider'),
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
      row.inputTokens,
      row.outputTokens,
      row.totalTokens,
      row.cachedTokens,
      `$${row.costCents.toFixed(4)}`,
    ].join(','),
  );

  const csv = [headers.join(','), ...csvRows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Disposition': `attachment; filename="ai-usage-${period}.csv"`,
      'Content-Type': 'text/csv; charset=utf-8',
    },
  });
}
