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

    if (!user?.email) {
      return new NextResponse(ReasonPhrases.BAD_REQUEST, { status: StatusCodes.BAD_REQUEST });
    }

    const { emailOptions } = await getUserReportBuffer(userId);

    const attachments = emailOptions.attachments?.map((att) => ({
      ...att,
      content: Buffer.from(att.content),
    }));

    await sentEmailTo({
      ...emailOptions,
      attachments,
      emails: [user.email],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[USER_REPORT_SEND]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}
