import { getUnixTime } from 'date-fns';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { ONE_DAY_SEC } from '@/constants/common';
import { Report, REPORT_TYPES } from '@/constants/payments';
import { fetchCachedData } from '@/lib/cache';
import { stripe } from '@/server/stripe';

export const POST = async (req: NextRequest, props: { params: Promise<{ accountId: string }> }) => {
  const { accountId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const { startDate, endDate, reportType } = await req.json();

    const cacheKey = `${accountId}_${reportType}_${user.userId}`;

    const cachedReportRun = await fetchCachedData(
      cacheKey,
      async () => {
        const reportRun = await stripe.reporting.reportRuns.create({
          report_type: REPORT_TYPES[reportType as Report],
          parameters: {
            ...(reportType === Report.CONNECT && { connected_account: accountId }),
            interval_end: getUnixTime(endDate),
            interval_start: getUnixTime(startDate),
          },
        });

        return reportRun;
      },
      ONE_DAY_SEC,
    );

    const reportRunId = cachedReportRun.id;
    const report = await stripe.reporting.reportRuns.retrieve(reportRunId);

    let filePublicUrl = null;

    if (report?.result?.id) {
      const link = await stripe.fileLinks.create({
        file: report.result.id,
      });

      filePublicUrl = link.url;
    }

    return NextResponse.json({
      status: report.status,
      successAt: report.succeeded_at,
      url: filePublicUrl,
    });
  } catch (error) {
    console.error('[PAYMENTS_REPORT]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
