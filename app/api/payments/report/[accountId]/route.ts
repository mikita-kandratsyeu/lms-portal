import { format, fromUnixTime, getUnixTime } from 'date-fns';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { ONE_DAY_SEC } from '@/constants/common';
import { Report, REPORT_TYPES } from '@/constants/payments';
import { fetchCachedData } from '@/lib/cache';
import db from '@/lib/db';
import { isBusinessOwner } from '@/lib/owner';
import { stripe } from '@/server/stripe';

const REPORT_POLL_INTERVAL_MS = 5000;
const REPORT_POLL_MAX_ATTEMPTS = 24;

const waitForReportCompletion = async (reportRunId: string) => {
  for (let attempt = 0; attempt < REPORT_POLL_MAX_ATTEMPTS; attempt++) {
    const report = await stripe.reporting.reportRuns.retrieve(reportRunId);

    if (report.status === 'succeeded' && report.result?.id) {
      return report;
    }

    if (report.status === 'failed') {
      throw new Error('Report generation failed');
    }

    await new Promise((resolve) => setTimeout(resolve, REPORT_POLL_INTERVAL_MS));
  }

  return null;
};

export const POST = async (req: NextRequest, props: { params: Promise<{ accountId: string }> }) => {
  const { accountId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const { startDate, endDate, reportType } = await req.json();

    if (reportType === Report.OWNER) {
      if (!isBusinessOwner(user.userId)) {
        return new NextResponse(ReasonPhrases.FORBIDDEN, { status: StatusCodes.FORBIDDEN });
      }
    } else if (reportType === Report.CONNECT) {
      const connectAccount = await db.stripeConnectAccount.findFirst({
        where: { stripeAccountId: accountId, userId: user.userId },
      });

      if (!connectAccount) {
        return new NextResponse(ReasonPhrases.FORBIDDEN, { status: StatusCodes.FORBIDDEN });
      }
    }

    const reportTypeId = REPORT_TYPES[reportType as Report];
    const reportTypeConfig = await stripe.reporting.reportTypes.retrieve(reportTypeId);
    const minIntervalStart = reportTypeConfig.data_available_start;

    if (getUnixTime(new Date(startDate)) < minIntervalStart) {
      const minDateStr = format(fromUnixTime(minIntervalStart), 'yyyy-MM-dd');

      return new NextResponse(
        JSON.stringify({
          error: `Data is only available from ${minDateStr}. Please select a start date on or after this date.`,
        }),
        {
          status: StatusCodes.BAD_REQUEST,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const cacheKey = `${accountId}_${reportType}_${user.userId}_${getUnixTime(new Date(startDate))}_${getUnixTime(new Date(endDate))}`;

    const cachedReportRun = await fetchCachedData(
      cacheKey,
      async () => {
        const reportRun = await stripe.reporting.reportRuns.create({
          report_type: reportTypeId,
          parameters: {
            ...(reportType === Report.CONNECT && { connected_account: accountId }),
            interval_end: getUnixTime(new Date(endDate)),
            interval_start: getUnixTime(new Date(startDate)),
          },
        });

        return reportRun;
      },
      ONE_DAY_SEC,
    );

    const reportRunId = cachedReportRun.id;
    let report: any = await stripe.reporting.reportRuns.retrieve(reportRunId);

    if (report.status === 'pending' || report.status === 'running') {
      report = await waitForReportCompletion(reportRunId);
    }

    let filePublicUrl = null;

    if (report?.result?.id) {
      const link = await stripe.fileLinks.create({
        file: report.result.id,
      });

      filePublicUrl = link.url;
    }

    return NextResponse.json({
      status: report?.status ?? 'pending',
      successAt: report?.succeeded_at ?? null,
      url: filePublicUrl,
    });
  } catch (error: unknown) {
    console.error('[PAYMENTS_REPORT]', error);

    const message = (error as Error)?.message ?? ReasonPhrases.INTERNAL_SERVER_ERROR;
    const isStripeInvalidRequest =
      typeof error === 'object' &&
      error !== null &&
      'type' in error &&
      (error as { type?: string }).type === 'StripeInvalidRequestError';

    return new NextResponse(JSON.stringify({ error: message }), {
      status: isStripeInvalidRequest ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
