import { format, fromUnixTime } from 'date-fns';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { Report, REPORT_TYPES } from '@/constants/payments';
import { stripe } from '@/server/stripe';

export const GET = async (req: NextRequest) => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get('reportType') as Report | null;

    if (!reportType || !REPORT_TYPES[reportType]) {
      return new NextResponse(ReasonPhrases.BAD_REQUEST, { status: StatusCodes.BAD_REQUEST });
    }

    const reportTypeConfig = await stripe.reporting.reportTypes.retrieve(REPORT_TYPES[reportType]);

    const minDate = format(fromUnixTime(reportTypeConfig.data_available_start), 'yyyy-MM-dd');

    return NextResponse.json({ minDate });
  } catch (error) {
    console.error('[PAYMENTS_REPORT_AVAILABLE_DATES]', error);

    return new NextResponse(
      JSON.stringify({
        error: (error as Error)?.message ?? ReasonPhrases.INTERNAL_SERVER_ERROR,
      }),
      {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};
