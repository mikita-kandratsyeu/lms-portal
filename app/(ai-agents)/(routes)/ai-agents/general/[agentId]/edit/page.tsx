import {
  ArrowLeftIcon,
  BracketsIcon,
  FlaskConicalIcon,
  LayoutDashboardIcon,
  MessageCircleMoreIcon,
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { Banner } from '@/components/common/banner';
import { IconBadge } from '@/components/common/icon-badge';
import db from '@/lib/db';

import { Actions } from './_components/actions';
import { ModelsForm } from './_components/form/models-form';

type AgentIdPageProps = { params: Promise<{ agentId: string }> };

const AgentIdPage = async (props: AgentIdPageProps) => {
  const { agentId } = await props.params;

  const user = await getCurrentUser();

  const agent = await db.aiAgent.findUnique({
    where: {
      id: agentId,
      userId: user!.userId,
    },
    include: {
      aiModels: { orderBy: [{ isDefault: 'desc' }, { providerName: 'asc' }, { name: 'asc' }] },
    },
  });

  if (!agent) {
    redirect('/ai-agents/general');
  }

  const models = await db.aiModel.findMany({
    orderBy: [{ isDefault: 'desc' }, { providerName: 'asc' }, { name: 'asc' }],
  });

  const requiredFields = [
    // course.categoryId,
    // course.chapters.some((chapter) => chapter.isPublished),
    agent.description,
    // course.imageUrl,
    agent.pictureUrl,
    agent.name,
    agent.aiModels.length,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const isCompleted = requiredFields.every(Boolean);

  const completionText = `(${completedFields}/${totalFields})`;

  const commonFormProps = {
    agentId,
    initialData: agent,
  };

  return (
    <>
      {agent.isDraft && (
        <Banner label="This agent has not been published. It will not be visible for you or other members." />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              className="flex items-center text-sm hover:opacity-75 transition duration-300 mb-6"
              href={'/ai-agents/general'}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to agents
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Agent setup</h1>
                <span className="text-sm text-muted-foreground">
                  Complete all fields {completionText}
                </span>
              </div>
              <Actions agentId={agentId} isDisabled={!isCompleted} isPublished={!agent.isDraft} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboardIcon} />
                <h2 className="text-xl">Customize your agent</h2>
              </div>
              <p>Name, Description, Picture</p>
              {/* <TitleForm {...commonFormProps} />
            <DescriptionForm {...commonFormProps} />
            <ImageForm {...commonFormProps} />
            <CategoryForm
              {...commonFormProps}
              options={categories.map((category) => ({ label: category.name, value: category.id }))}
            />
            <AdvancedOptionsForm {...commonFormProps} /> */}
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={MessageCircleMoreIcon} />
                <h2 className="text-xl">Conversation starters</h2>
              </div>
              <p>list for all langs in APP</p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={BracketsIcon} />
                <h2 className="text-xl">Select LLM models</h2>
              </div>
              <ModelsForm {...commonFormProps} models={models} />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={FlaskConicalIcon} />
                <h2 className="text-xl">Experimental features</h2>
              </div>
              <p>Own API Key, Own API server (Ollama), temperature (0.7), system instruction</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AgentIdPage;
