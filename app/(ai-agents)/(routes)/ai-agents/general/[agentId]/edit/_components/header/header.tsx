'use client';

import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { GetAgentDataResponse } from '@/actions/ai/agent/get-agent-data';
import { useCurrentUser } from '@/hooks/use-current-user';

import { Actions } from './actions';

type HeaderProps = {
  agentId: string;
  initialData: GetAgentDataResponse['agent'];
  isPreviewPage?: boolean;
};

export const Header = ({ agentId, initialData, isPreviewPage }: HeaderProps) => {
  const t = useTranslations('ai-agents.edit.header');
  const { user } = useCurrentUser();

  const requiredFields = [
    initialData?.description,
    initialData?.name,
    initialData?.aiModels?.length,
  ];

  const isCompleted = requiredFields.every(Boolean);
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = t('completion', { completed: completedFields, total: totalFields });

  return (
    <div className="flex w-full flex-col gap-4">
      <Link
        className="flex items-center text-sm hover:opacity-75 transition duration-300"
        href={'/ai-agents/general'}
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        {t('back')}
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-medium">
            {isPreviewPage ? t('previewTitle') : t('setupTitle')}
          </h1>
          {!isPreviewPage && (
            <span className="text-sm text-muted-foreground">
              {t('completeFields', { completion: completionText })}
            </span>
          )}
        </div>
        <div className="w-full max-w-full overflow-x-auto sm:w-auto sm:overflow-visible">
          <Actions
            agentId={agentId}
            isDefault={initialData?.isDefault}
            isDisabled={!isCompleted && !isPreviewPage}
            isOwner={initialData?.userId === user?.userId}
            isPreviewPage={isPreviewPage}
            isPublished={!initialData?.isDraft}
            isConnected={Boolean(
              initialData?.connectedUsers.find(
                (connectedUser) => connectedUser.userId === user?.userId,
              )?.userId,
            )}
          />
        </div>
      </div>
    </div>
  );
};
