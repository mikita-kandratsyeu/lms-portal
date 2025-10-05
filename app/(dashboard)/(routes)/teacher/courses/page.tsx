import { getCurrentUser } from '@/actions/auth/get-current-user';
import { DataTable } from '@/components/data-table/data-table';
import { PAGE_SIZES } from '@/constants/paginations';
import db from '@/lib/db';

import { columns } from './_components/data-table/columns';

type CoursesPageProps = {
  searchParams: Promise<{ pageIndex: string; pageSize: string }>;
};

const CoursesPage = async (props: CoursesPageProps) => {
  const searchParams = await props.searchParams;

  const { pageIndex, pageSize } = searchParams;

  const user = await getCurrentUser();

  const index = Number(pageIndex) || 0;
  const size = Number(pageSize) || PAGE_SIZES[0];

  const courses = await db.course.findMany({
    orderBy: { createdAt: 'desc' },
    skip: index * size,
    take: size,
    where: { userId: user!.userId },
  });

  const count = await db.course.count({ where: { userId: user!.userId } });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-medium mb-12">Courses</h1>
      <DataTable
        columns={columns}
        data={courses}
        isTeacherCoursesPage
        noLabel="No courses"
        pageCount={Math.ceil(count / size)}
      />
    </div>
  );
};

export default CoursesPage;
