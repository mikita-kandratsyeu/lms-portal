import bcrypt from 'bcrypt';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { sentEmailByTemplate } from '@/actions/mailer/sent-email-by-template';
import { TEN_MINUTE_SEC } from '@/constants/common';
import { OTP_LENGTH } from '@/constants/otp';
import { fetchCachedData, getValueFromMemoryCache, removeValueFromMemoryCache } from '@/lib/cache';
import db from '@/lib/db';
import { getRandomInt, maskEmail } from '@/lib/utils';

const BCRYPT_SALT_ROUNDS = 12;

const getPasswordOtpKey = (userId: string) => `${userId}-set_password_token`;

export const POST = async (_: NextRequest, props: { params: Promise<{ userId: string }> }) => {
  const { userId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!user || user.userId !== userId) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const dbUser = await db.user.findUnique({ where: { id: userId } });

    if (!dbUser) {
      return new NextResponse(ReasonPhrases.NOT_FOUND, { status: StatusCodes.NOT_FOUND });
    }

    const key = getPasswordOtpKey(userId);

    let isNewKey = false;

    const cachedData = await fetchCachedData(
      key,
      async () => {
        isNewKey = true;

        return {
          timestamp: Date.now(),
          otp: [...Array(OTP_LENGTH)].map(() => getRandomInt(0, 9)).join(''),
        };
      },
      TEN_MINUTE_SEC * 1.5,
    );

    if (isNewKey) {
      await sentEmailByTemplate({
        emails: [dbUser.email],
        template: 'set-password',
        params: { code: cachedData.otp },
      });
    }

    return NextResponse.json({ maskedEmail: maskEmail(dbUser.email) });
  } catch (error) {
    console.error('[POST_SET_PASSWORD_OTP]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

export const PATCH = async (req: NextRequest, props: { params: Promise<{ userId: string }> }) => {
  const { userId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!user || user.userId !== userId) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const { code, password, confirmPassword } = await req.json();

    if (!code || !password || !confirmPassword) {
      return new NextResponse(ReasonPhrases.BAD_REQUEST, { status: StatusCodes.BAD_REQUEST });
    }

    if (password !== confirmPassword) {
      return new NextResponse('Passwords do not match', { status: StatusCodes.BAD_REQUEST });
    }

    if (password.length < 8) {
      return new NextResponse('Password must be at least 8 characters', {
        status: StatusCodes.BAD_REQUEST,
      });
    }

    const key = getPasswordOtpKey(userId);
    const cached = await getValueFromMemoryCache(key);

    if (!cached) {
      return new NextResponse('Invalid or expired verification code', {
        status: StatusCodes.BAD_REQUEST,
      });
    }

    const cachedData = JSON.parse(cached) as { otp: string; timestamp: number };

    if (cachedData.otp !== code) {
      return new NextResponse('Invalid or expired verification code', {
        status: StatusCodes.BAD_REQUEST,
      });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await removeValueFromMemoryCache(key);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PATCH_SET_PASSWORD]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

export const DELETE = async (_: NextRequest, props: { params: Promise<{ userId: string }> }) => {
  const { userId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!user || user.userId !== userId) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    await removeValueFromMemoryCache(getPasswordOtpKey(userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE_SET_PASSWORD_OTP]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
