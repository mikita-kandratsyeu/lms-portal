import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';

import { sentEmailByTemplate } from '@/actions/mailer/sent-email-by-template';
import { TEN_MINUTE_SEC } from '@/constants/common';
import { OTP_LENGTH } from '@/constants/otp';
import { fetchCachedData } from '@/lib/cache';
import db from '@/lib/db';
import { getRandomInt, maskEmail } from '@/lib/utils';

export const POST = async (req: NextRequest) => {
  try {
    const t = await getTranslations('auth-form');

    const { email } = await req.json();

    const user = await db.user.findFirst({ where: { email: email?.toLowerCase() } });

    if (!user) {
      return new NextResponse(JSON.stringify({ error: t('errors.invalidEmail') }), {
        status: StatusCodes.NOT_FOUND,
      });
    }

    let isNewCreateKey = false;

    const key = `auth-without-pass-token_${user.id}`;
    const cachedData = await fetchCachedData(
      key,
      async () => {
        isNewCreateKey = true;

        return {
          timestamp: Date.now(),
          otp: [...Array(OTP_LENGTH)].map(() => getRandomInt(0, 9)).join(''),
        };
      },
      TEN_MINUTE_SEC * 2,
    );

    let sentEmail = null;

    if (isNewCreateKey) {
      sentEmail = await sentEmailByTemplate({
        emails: [email],
        template: 'login-code',
        params: {
          code: cachedData.otp,
        },
      });
    }

    return NextResponse.json({
      messageId: sentEmail?.messageId ?? null,
      maskedEmail: maskEmail(email),
    });
  } catch (error) {
    console.error('[POST_WITHOUT_PASS]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
