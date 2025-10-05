import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { sentEmailByTemplate } from '@/actions/mailer/sent-email-by-template';
import { ONE_HOUR_SEC } from '@/constants/common';
import { setValueToMemoryCache } from '@/lib/cache';
import { absoluteUrl, encrypt } from '@/lib/utils';

export const POST = async (_: NextRequest, props: { params: Promise<{ userId: string }> }) => {
  const { userId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const secret = uuidv4();
    const key = `${userId}-email_confirmation_token`;

    await setValueToMemoryCache(key, secret, ONE_HOUR_SEC);

    const emailParams = {
      username: user?.name ?? '',
      verificationLink: absoluteUrl(
        `/settings/general?code=${encodeURIComponent(encrypt({ secret, key }, process.env.EMAIl_CONFIRMATION_SECRET as string))}`,
      ),
    };

    const sentEmailMessage = await sentEmailByTemplate({
      emails: [user?.email ?? ''],
      params: emailParams,
      template: 'confirmation-email',
    });

    return NextResponse.json({ messageId: sentEmailMessage.messageId });
  } catch (error) {
    console.error('[POST_EMAIL_CONFIRMATION]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
