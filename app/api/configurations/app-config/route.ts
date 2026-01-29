import { readFile, writeFile } from 'fs/promises';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { isBusinessOwner } from '@/lib/owner';

const CONFIG_PATH = path.join(process.cwd(), 'configs', 'app.json');

export const GET = async () => {
  try {
    const user = await getCurrentUser();

    if (!isBusinessOwner(user?.userId)) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const fileContent = await readFile(CONFIG_PATH, 'utf-8');
    const config = JSON.parse(fileContent);

    return NextResponse.json(config);
  } catch (error) {
    console.error('[APP_CONFIG_GET]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

export const PATCH = async (req: NextRequest) => {
  try {
    const user = await getCurrentUser();

    if (!isBusinessOwner(user?.userId)) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const newConfig = await req.json();

    await writeFile(CONFIG_PATH, JSON.stringify(newConfig, null, 2), 'utf-8');

    return NextResponse.json(newConfig);
  } catch (error) {
    console.error('[APP_CONFIG_PATCH]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
