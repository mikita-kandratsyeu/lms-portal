import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { generateStripeAiInsights } from '@/actions/stripe/generate-stripe-ai-insights';
import { isBusinessOwner } from '@/lib/owner';

export const maxDuration = 60;

export const POST = async () => {
  const user = await getCurrentUser();
  const t = await getTranslations('error');

  try {
    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    if (!isBusinessOwner(user.userId)) {
      return new NextResponse(ReasonPhrases.FORBIDDEN, { status: StatusCodes.FORBIDDEN });
    }

    const result = await generateStripeAiInsights();

    if (!result.success) {
      return new NextResponse(result.insights, {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }

    return NextResponse.json({ success: true, insights: result.insights });
  } catch (error) {
    console.error('[PAYMENTS_AI_INSIGHTS]', error);

    return new NextResponse(t('body'), {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
