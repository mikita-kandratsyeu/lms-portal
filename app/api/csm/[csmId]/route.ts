import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { sentEmailByTemplate } from '@/actions/mailer/sent-email-by-template';
import db from '@/lib/db';
import { isBusinessOwner } from '@/lib/owner';
import { capitalize } from '@/lib/utils';

export const PATCH = async (req: NextRequest, props: { params: Promise<{ csmId: string }> }) => {
  const { csmId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!isBusinessOwner(user?.userId)) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const { values, settings } = await req.json();

    const updatedCsmIssue = await db.csmIssue.update({
      where: { id: csmId },
      data: { ...values },
      include: { user: { select: { email: true } } },
    });

    let messageId = null;

    if (settings?.emailCheckBox) {
      const emailParams = {
        ticketID: updatedCsmIssue.name ?? '',
        ticketStatus: capitalize(updatedCsmIssue.status ?? ''),
        ticketDescription: updatedCsmIssue.description ?? '',
        ticketResponse: updatedCsmIssue.resolutionComment ?? '',
      };

      const emailMessage = await sentEmailByTemplate({
        emails: [updatedCsmIssue.email ?? updatedCsmIssue?.user?.email ?? ''],
        locale: updatedCsmIssue.locale,
        params: emailParams,
        template: 'csm-issue-resolution',
      });

      messageId = emailMessage.messageId;
    }

    return NextResponse.json({ issue: updatedCsmIssue, messageId });
  } catch (error) {
    console.error('[CSM_ID_PATCH]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

export const DELETE = async (_: NextRequest, props: { params: Promise<{ csmId: string }> }) => {
  const { csmId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!isBusinessOwner(user?.userId)) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const deletedCsmIssue = await db.csmIssue.delete({ where: { id: csmId } });

    return NextResponse.json(deletedCsmIssue);
  } catch (error) {
    console.error('[CSM_ID_DELETE]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
