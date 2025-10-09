'use server';

import db from '@/lib/db';

export const getCsmCategories = async () => {
  const categories = await db.csmCategory.findMany({ orderBy: { name: 'asc' } });

  return categories;
};
