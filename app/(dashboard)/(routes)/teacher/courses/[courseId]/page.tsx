import { ArrowLeft, BadgeDollarSign, Files, Hash, LayoutDashboard, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { Banner } from '@/components/common/banner';
import { IconBadge } from '@/components/common/icon-badge';
import db from '@/lib/db';

import { Actions } from './_components/actions';
import { AdvancedOptionsForm } from './_components/form/advanced-options-form';
import { AttachmentForm } from './_components/form/attachment-form';
import { CategoryForm } from './_components/form/category-form';
import { ChaptersForm } from './_components/form/chapters-form';
import { CustomTagsForm } from './_components/form/custom-tags-form';
import { DescriptionForm } from './_components/form/description-form';
import { ImageForm } from './_components/form/image-form';
import { PriceForm } from './_components/form/price-form';
import { TitleForm } from './_components/form/title-form';

type CourseIdPageProps = { params: Promise<{ courseId: string }> };

const CourseIdPage = async (props: CourseIdPageProps) => {
  const { courseId } = await props.params;

  const user = await getCurrentUser();

  const course = await db.course.findUnique({
    where: {
      id: courseId,
      userId: user!.userId,
    },
    include: {
      _count: {
        select: { purchases: true },
      },
      attachments: { orderBy: { createdAt: 'desc' } },
      chapters: { orderBy: { position: 'asc' } },
    },
  });

  const fees = await db.fee.findMany({ orderBy: { name: 'asc' } });

  const categories = await db.category.findMany({ orderBy: { name: 'asc' } });

  if (!course) {
    redirect('/');
  }

  const requiredFields = [
    course.categoryId,
    course.chapters.some((chapter) => chapter.isPublished),
    course.description,
    course.imageUrl,
    course.title,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const isCompleted = requiredFields.every(Boolean);

  const completionText = `(${completedFields}/${totalFields})`;

  const commonFormProps = {
    courseId,
    initialData: course,
  };

  return (
    <>
      {!course.isPublished && (
        <Banner label="This course has not been published. It will not be visible in the students." />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              className="flex items-center text-sm hover:opacity-75 transition duration-300 mb-6"
              href={'/teacher/courses'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to courses
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Course setup</h1>
                <span className="text-sm text-muted-foreground">
                  Complete all fields {completionText}
                </span>
              </div>
              <Actions
                courseId={courseId}
                disabled={!isCompleted}
                hasPurchases={Boolean(course?._count?.purchases)}
                isPublished={course.isPublished}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize your course</h2>
            </div>
            <TitleForm {...commonFormProps} />
            <DescriptionForm {...commonFormProps} />
            <ImageForm {...commonFormProps} />
            <CategoryForm
              {...commonFormProps}
              options={categories.map((category) => ({ label: category.name, value: category.id }))}
            />
            <AdvancedOptionsForm {...commonFormProps} />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-xl">Course chapters</h2>
              </div>
              <ChaptersForm {...commonFormProps} />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={BadgeDollarSign} />
                <h2 className="text-xl">Sell your course</h2>
              </div>
              <PriceForm {...commonFormProps} fees={fees} />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={Files} />
                <h2 className="text-xl">Recourses & Attachments</h2>
              </div>
              <AttachmentForm {...commonFormProps} />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={Hash} />
                <h2 className="text-xl">Custom tags</h2>
              </div>
              <CustomTagsForm {...commonFormProps} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseIdPage;
