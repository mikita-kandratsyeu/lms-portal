import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { OTP_SECRET_SECURE } from '@/constants/otp';
import db from '@/lib/db';

export const PATCH = async (req: NextRequest) => {
  try {
    const { email } = await req.json();

    await db.user.update({ where: { email }, data: { otpCreatedAt: null, otpSecret: null } });
    (await cookies()).delete(`${OTP_SECRET_SECURE}:${email}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[OTP_DELETE]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
