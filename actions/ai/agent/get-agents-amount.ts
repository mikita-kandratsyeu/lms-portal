'use server';

import db from '@/lib/db';

export const getAgentsAmount = async () => await db.aiAgent.count({ where: { isPublic: true } });
