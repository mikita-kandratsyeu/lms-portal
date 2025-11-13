import { Suspense } from 'react';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { getCourses } from '@/actions/courses/get-courses';
import { SearchInput } from '@/components/common/search-input';
import db from '@/lib/db';

import { Categories } from '../_components/category/categories';
import { CoursesList } from '../_components/courses/courses-list';

type SearchPageProps = {
  searchParams: Promise<{ title: string; categoryIds: string }>;
};

const SearchPage = async (props: SearchPageProps) => {
  const searchParams = await props.searchParams;
  const user = await getCurrentUser();

  const categories = await db.category.findMany({ orderBy: { name: 'asc' } });
  const fees = await db.fee.findMany({ orderBy: { name: 'asc' } });

  const courses = await getCourses({
    ...searchParams,
    hasSubscription: user?.hasSubscription,
    userId: user?.userId,
  });

  const filteredCourses = courses.filter((course) => searchParams?.categoryIds?.includes(course.id));

  return (
    <>
      <Suspense>
        <div className="px-6 pt-6 md:hidden md:mb-0 block">
          <SearchInput />
        </div>
      </Suspense>
      <div className="p-6 space-y-4">
        <Categories items={categories} />
        <CoursesList items={filteredCourses} fees={fees} specificFilter />
      </div>
    </>
  );
};

export default SearchPage;
