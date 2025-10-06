import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

type RequestProps = { params: Promise<{ label: string }> };

export const GET = async (_: NextRequest, props: RequestProps) => {
  const { label } = await props.params;

  try {
    return NextResponse.json({ schemaVersion: 1, label, message: 'sweet world', color: 'orange' });
  } catch (error) {
    console.error('[GET_GITHUB_BADGE]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
