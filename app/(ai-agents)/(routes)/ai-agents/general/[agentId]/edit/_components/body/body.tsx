'use client';

import { AiAgent, AiModel } from '@prisma/client';
import {
  FlaskConicalIcon,
  LayoutDashboardIcon,
  MessageCircleMoreIcon,
  ServerIcon,
  SlidersHorizontalIcon,
} from 'lucide-react';

import { IconBadge } from '@/components/common/icon-badge';

import { CustomizeModelForm } from './form/customize-model-form';
import { ModelsForm } from './form/models-form';

type BodyProps = {
  agentId: string;
  initialData: AiAgent & { aiModels: AiModel[] };
  models: AiModel[];
};

export const Body = ({ agentId, initialData, models }: BodyProps) => {
  return (
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
            <IconBadge icon={ServerIcon} />
            <h2 className="text-xl">Select LLM engine</h2>
          </div>
          <ModelsForm agentId={agentId} initialData={initialData} models={models} />
        </div>
        <div>
          <div className="flex items-center gap-x-2">
            <IconBadge icon={SlidersHorizontalIcon} />
            <h2 className="text-xl">Customize LLM engine</h2>
          </div>
          <CustomizeModelForm agentId={agentId} initialData={initialData} />
        </div>
        <div>
          <div className="flex items-center gap-x-2">
            <IconBadge icon={FlaskConicalIcon} />
            <h2 className="text-xl">Experimental features</h2>
          </div>
          <p>Own API server (Ollama)</p>
        </div>
      </div>
    </div>
  );
};
