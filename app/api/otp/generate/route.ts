import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';

import db from '@/lib/db';

export const POST = async (req: NextRequest) => {
  try {
    const { email } = await req.json();

    const user = db.user.findUnique({ where: { email } });

    if (!user) {
      return new NextResponse(ReasonPhrases.FORBIDDEN, {
        status: StatusCodes.FORBIDDEN,
      });
    }

    const t = await getTranslations('app');

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(email, t('name'), secret);
    const qr = await qrcode.toDataURL(otpauth);

    return NextResponse.json({ qr, secret });
  } catch (error) {
    console.error('[OTP_GENERATE]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
