import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { getUserReportBuffer } from '@/actions/users/get-user-report';
import { isBusinessOwner } from '@/lib/owner';

const createPdfResponse = (pdfBuffer: Buffer | Uint8Array, filename: string) => {
  const buffer = Buffer.from(pdfBuffer);
  return new NextResponse(buffer, {
    status: StatusCodes.OK,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    },
  });
};

export async function GET(_: NextRequest, props: { params: Promise<{ userId: string }> }) {
  const { userId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!isBusinessOwner(user?.userId)) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const result = await getUserReportBuffer(userId);
    const filename = result.emailOptions?.attachments?.[0]?.filename ?? 'user_report.pdf';

    return createPdfResponse(result.pdfBuffer, filename);
  } catch (error) {
    console.error('[USER_REPORT]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}

export async function POST(_: NextRequest, props: { params: Promise<{ userId: string }> }) {
  const { userId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!isBusinessOwner(user?.userId)) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const result = await getUserReportBuffer(userId);
    const filename = result.emailOptions?.attachments?.[0]?.filename ?? 'user_report.pdf';

    return createPdfResponse(result.pdfBuffer, filename);
  } catch (error) {
    console.error('[USER_REPORT]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}
