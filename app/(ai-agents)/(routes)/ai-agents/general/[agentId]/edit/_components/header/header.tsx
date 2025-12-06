'use client';

import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';

import { GetAgentDataResponse } from '@/actions/ai/agent/get-agent-data';
import { useCurrentUser } from '@/hooks/use-current-user';

import { Actions } from './actions';

type HeaderProps = {
  agentId: string;
  initialData: GetAgentDataResponse['agent'];
  isPreviewPage?: boolean;
};

export const Header = ({ agentId, initialData, isPreviewPage }: HeaderProps) => {
  const { user } = useCurrentUser();

  const requiredFields = [
    initialData?.description,
    initialData?.name,
    initialData?.aiModels?.length,
  ];

  const isCompleted = requiredFields.every(Boolean);
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  return (
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
            <h1 className="text-2xl font-medium">
              {isPreviewPage ? 'Agent preview' : 'Agent setup'}
            </h1>
            {!isPreviewPage && (
              <span className="text-sm text-muted-foreground">
                Complete all fields {completionText}
              </span>
            )}
          </div>
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
