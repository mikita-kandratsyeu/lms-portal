import { ArrowLeft, CircleEllipsis, Film, LayoutDashboard, ScanEye } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Banner } from '@/components/common/banner';
import { IconBadge } from '@/components/common/icon-badge';
import db from '@/lib/db';

import { ChapterActions } from './_components/chapter-actions';
import { ChapterAccessForm } from './_components/form/chapter-access-form';
import { ChapterDescriptionForm } from './_components/form/chapter-description-form';
import { ChapterExtraSettingsForm } from './_components/form/chapter-extra-settings-form';
import { ChapterTitleForm } from './_components/form/chapter-title-form';
import { ChapterVideoForm } from './_components/form/chapter-video-form';

type ChapterIdPageProps = {
  params: Promise<{ courseId: string; chapterId: string }>;
};

const ChapterIdPage = async (props: ChapterIdPageProps) => {
  const { chapterId, courseId } = await props.params;

  const chapter = await db.chapter.findUnique({
    where: { id: chapterId, courseId },
    include: { muxData: true },
  });

  if (!chapter) {
    return redirect('/');
  }

  const requiredFields = [chapter.title, chapter.videoUrl || chapter.imageUrl];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const isCompleted = requiredFields.every(Boolean);

  const completionText = `(${completedFields}/${totalFields})`;

  const chapterFormProps = {
    chapterId,
    courseId,
    initialData: chapter,
  };

  return (
    <>
      {!chapter.isPublished && (
        <Banner
          variant="warning"
          label="This chapter has not been published. It will not be visible in the course."
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              className="flex items-center text-sm hover:opacity-75 transition duration-300 mb-6"
              href={`/teacher/courses/${courseId}`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to course setup
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Chapter Creation</h1>
                <span className="text-sm text-muted-foreground">
                  Complete all fields {completionText}
                </span>
              </div>
              <ChapterActions
                chapterId={chapterId}
                courseId={courseId}
                disabled={!isCompleted}
                isPublished={chapter.isPublished}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-xl">Customize your chapter</h2>
              </div>
              <ChapterTitleForm {...chapterFormProps} />
              <ChapterDescriptionForm {...chapterFormProps} />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ScanEye} />
                <h2 className="text-xl">Access settings</h2>
              </div>
              <ChapterAccessForm {...chapterFormProps} />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={CircleEllipsis} />
                <h2 className="text-xl">Additional settings</h2>
              </div>
              <ChapterExtraSettingsForm {...chapterFormProps} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Film} />
              <h2 className="text-xl">Add a video or photo</h2>
            </div>
            <ChapterVideoForm {...chapterFormProps} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChapterIdPage;
