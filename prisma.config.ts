import 'dotenv/config';

import type { PrismaConfig } from 'prisma';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('POSTGRES_PRISMA_URL'),
  },
} satisfies PrismaConfig);
