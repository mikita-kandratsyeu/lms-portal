import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { getPreviewCourse } from '@/actions/courses/get-preview-course';
import { AuthRedirect } from '@/components/auth/auth-redirect';
import { CourseEnrollButton } from '@/components/common/course-enroll-button';
import { Price } from '@/components/common/price';
import { Button } from '@/components/ui/button';
import { PLATFORM_DESCRIPTION } from '@/constants/common';
import db from '@/lib/db';
import { cn } from '@/lib/utils';

import { ContinueButton } from './_components/continue-button';
import { CourseHighlights } from './_components/course-highlights';
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

  const { chapterImagePlaceholder, course, fees, hasPurchase, durationInSec } =
    await getPreviewCourse({
      courseId: courseId,
      userId: user?.userId,
    });

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
          {!hasPurchase && (
            <div className="border rounded-lg p-6 bg-card">
              <h4 className="font-semibold text-lg mb-4">{t('preview.pricing')}</h4>
              <Price
                customRates={course.customRates}
                price={course.price}
                fees={fees}
                showFeesAccordion
              />
            </div>
          )}
          <div
            className={cn(
              'w-full border rounded-lg p-6',
              user?.userId &&
                'bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%',
              !user?.userId && 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
            )}
          >
            <div className="mb-8 space-y-2 text-white">
              <h4 className="font-semibold text-xl">{t('readyToLearn')}</h4>
              <p className="text-sm">{t('keepProgress')}</p>
            </div>
            <div className="w-full">
              {user?.userId ? (
                <>
                  {!hasPurchase && (
                    <CourseEnrollButton
                      courseId={courseId}
                      customRates={course.customRates}
                      price={course.price}
                      variant="outline"
                    />
                  )}
                  {hasPurchase && <ContinueButton redirectUrl={`/courses/${courseId}`} />}
                </>
              ) : (
                <AuthRedirect>
                  <Button className="w-full truncate" variant="outline">
                    {t('loginToContinue')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </AuthRedirect>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewCourseIdPage;
