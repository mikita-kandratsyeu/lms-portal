import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { sentEmailTo } from '@/actions/mailer/sent-email-to';
import { getUserReportBuffer } from '@/actions/users/get-user-report';
import { isBusinessOwner } from '@/lib/owner';

export async function POST(_: NextRequest, props: { params: Promise<{ userId: string }> }) {
  const { userId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!isBusinessOwner(user?.userId)) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const { pdfBuffer, emailOptions } = (await getUserReportBuffer(userId)) as any;

    await sentEmailTo({ ...emailOptions, emails: [user?.email] });

    return new NextResponse(pdfBuffer, {
      status: StatusCodes.OK,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${emailOptions?.attachments?.[0]?.filename ?? 'user_report.pdf'}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('[USER_REPORT]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}
