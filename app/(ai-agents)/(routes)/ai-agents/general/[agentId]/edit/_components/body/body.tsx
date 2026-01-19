'use client';

import {
  FlaskConicalIcon,
  LayoutDashboardIcon,
  MessageCircleMoreIcon,
  ServerIcon,
  SlidersHorizontalIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { GetAgentDataResponse } from '@/actions/ai/agent/get-agent-data';
import { IconBadge } from '@/components/common/icon-badge';

import { ConversationStartersForm } from './form/conversation-starters-form';
import { CustomizeModelForm } from './form/customize-model-form';
import { DescriptionModelForm } from './form/description-model-form';
import { ModelsForm } from './form/models-form';

type BodyProps = {
  agentId: string;
  initialData: GetAgentDataResponse['agent'];
  isPreviewPage?: boolean;
  models?: GetAgentDataResponse['models'];
};

export const Body = ({ agentId, initialData, isPreviewPage, models = [] }: BodyProps) => {
  const t = useTranslations('ai-agents.edit.body');
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <div className="space-y-6">
        <div>
          {!isPreviewPage && (
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboardIcon} />
              <h2 className="text-xl">{t('customize')}</h2>
            </div>
          )}
          <DescriptionModelForm
            agentId={agentId}
            initialData={initialData}
            isPreviewPage={isPreviewPage}
          />
        </div>
        <div>
          {!isPreviewPage && (
            <div className="flex items-center gap-x-2">
              <IconBadge icon={MessageCircleMoreIcon} />
              <h2 className="text-xl">{t('starters')}</h2>
            </div>
          )}
          <ConversationStartersForm
            agentId={agentId}
            initialData={initialData}
            isPreviewPage={isPreviewPage}
          />
        </div>
        <div>
          {!isPreviewPage && (
            <div className="flex items-center gap-x-2">
              <IconBadge icon={SlidersHorizontalIcon} />
              <h2 className="text-xl">{t('customizeLlm')}</h2>
            </div>
          )}
          <CustomizeModelForm
            agentId={agentId}
            initialData={initialData}
            isPreviewPage={isPreviewPage}
          />
        </div>
      </div>
      <div className="space-y-6">
        <div>
          {!isPreviewPage && (
            <div className="flex items-center gap-x-2">
              <IconBadge icon={ServerIcon} />
              <h2 className="text-xl">{t('selectLlm')}</h2>
            </div>
          )}
          <ModelsForm
            agentId={agentId}
            initialData={initialData}
            isPreviewPage={isPreviewPage}
            models={models}
          />
        </div>
        {!isPreviewPage && (
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={FlaskConicalIcon} />
              <h2 className="text-xl">{t('experimental.title')}</h2>
            </div>
            <p>{t('experimental.api')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
