'use server';

import { Category, Course } from '@prisma/client';

import db from '@/lib/db';
import { getImagePlaceHolder } from '@/lib/image';

import { getProgress } from './get-progress';

type CourseWithProgressWithCategory = Course & {
  _count: { chapters: number; purchases?: number };
  category: Category | null;
  imagePlaceholder: string;
  price: number | null;
  progress: number | null;
};

type GetCourses = {
  categoryIds?: string;
  hasSubscription?: boolean;
  title?: string;
  userId?: string;
};

export const getCourses = async ({ categoryIds, hasSubscription, title, userId }: GetCourses) => {
  const courses = await db.course.findMany({
    where: {
      ...(!hasSubscription && { isPremium: false }),
      ...(categoryIds && { categoryId: { in: JSON.parse(categoryIds ?? '[]') } }),
      isPublished: true,
      title: { contains: title, mode: 'insensitive' },
    },
    include: {
      _count: {
        select: {
          ...(userId && { purchases: { where: { userId } } }),
          chapters: { where: { isPublished: true } },
        },
      },
      category: true,
    },
    orderBy: [{ isPremium: 'desc' }, { createdAt: 'desc' }],
  });

  const courseWithProgress: CourseWithProgressWithCategory[] = await Promise.all(
    courses.map(async (course) => {
      const imagePlaceholder = await getImagePlaceHolder(course.imageUrl!);

      if (!course?._count.purchases || !userId) {
        return {
          ...course,
          imagePlaceholder: imagePlaceholder.base64,
          progress: null,
        };
      }

      const { progressPercentage } = await getProgress({ userId, courseId: course.id });

      return { ...course, imagePlaceholder: imagePlaceholder.base64, progress: progressPercentage };
    }),
  );

  return courseWithProgress;
};
