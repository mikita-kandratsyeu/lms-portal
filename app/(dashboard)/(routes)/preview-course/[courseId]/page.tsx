import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { getPreviewCourse } from '@/actions/courses/get-preview-course';
import { getUserPromotions } from '@/actions/stripe/get-user-promotions';
import { PLATFORM_DESCRIPTION } from '@/constants/common';
import db from '@/lib/db';

import { CourseHighlights } from './_components/course-highlights';
import { CoursePurchaseSection } from './_components/course-purchase-section';
import { PreviewDescription } from './_components/preview-description';
import { PreviewImage } from './_components/preview-image';
import { PreviewVideoPlayer } from './_components/preview-video-player';

type PreviewCourseIdPageProps = {
  params: Promise<{ courseId: string }>;
};

export const generateMetadata = async (props: PreviewCourseIdPageProps): Promise<Metadata> => {
  const { courseId } = await props.params;

  const course = await db.course.findUnique({
    where: { id: courseId },
  });

  return {
    title: course?.title || 'Nova Academy',
    description: course?.description || PLATFORM_DESCRIPTION,
  };
};

const PreviewCourseIdPage = async (props: PreviewCourseIdPageProps) => {
  const { courseId } = await props.params;

  const t = await getTranslations('courses.preview');

  const user = await getCurrentUser();

  const [{ chapterImagePlaceholder, course, fees, hasPurchase, durationInSec }, { promotions }] =
    await Promise.all([
      getPreviewCourse({ courseId, userId: user?.userId }),
      user?.userId ? getUserPromotions() : Promise.resolve({ promotions: [] }),
    ]);

  if (!course || (course?.isPremium && !user?.hasSubscription)) {
    redirect('/');
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="w-full">
          <Link
            className="flex items-center text-sm hover:opacity-75 transition duration-300 mb-6"
            href={'/'}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backTo')}
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {course.chapters?.[0]?.imageUrl && (
            <PreviewImage
              alt="Course preview"
              blurDataURL={chapterImagePlaceholder}
              src={course.chapters[0].imageUrl}
            />
          )}
          {course.chapters?.[0]?.videoUrl && (
            <PreviewVideoPlayer
              videoUrl={course.chapters[0].videoUrl}
              isLocked={!course.chapters?.[0]?.isFree}
            />
          )}
          <div className="space-y-4">
            <CourseHighlights
              durationInSec={durationInSec}
              language={course.language}
              chaptersLength={course._count.chapters}
            />
          </div>
          <PreviewDescription
            author={course?.user?.name}
            authorUserId={course?.userId}
            categories={[course.category!.name]}
            customTags={course.customTags}
            description={course.description!}
            id={course.id}
            language={course.language}
            lastUpdate={course.updatedAt}
            title={course.title}
          />
        </div>
        <div className="space-y-6 lg:col-span-1">
          <CoursePurchaseSection
            courseId={courseId}
            customRates={course.customRates}
            fees={fees}
            hasPurchase={hasPurchase}
            isLoggedIn={!!user?.userId}
            price={course.price}
            promotions={promotions}
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewCourseIdPage;
