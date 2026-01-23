'use client';

import { CirclePlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import * as z from 'zod';

import { GetAgentDataResponse } from '@/actions/ai/agent/get-agent-data';
import { AgentFeatures } from '@/components/ai-agents/agent-card/agent-features';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

import { ModelsList } from '../models-list';

type ModelsProps = {
  agentId: string;
  initialData: GetAgentDataResponse['agent'];
  isPreviewPage?: boolean;
  models: GetAgentDataResponse['models'];
};

const formSchema = z.object({
  modelIds: z.array(z.string()),
});

export const ModelsForm = ({ agentId, initialData, isPreviewPage, models }: ModelsProps) => {
  const t = useTranslations('ai-agents.edit.models');
  const { toast } = useToast();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);

  const handleToggleEdit = () => setIsEditing((prev) => !prev);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsFetching(true);

    try {
      await fetcher.patch(`/api/ai/agents/${agentId}`, { body: values });

      toast({ title: t('toast.updated') });
      handleToggleEdit();

      router.refresh();
    } catch (error) {
      console.error('[MODELS_FORM]', error);

      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="mt-6 border  bg-neutral-100 dark:bg-neutral-900 rounded-md p-4">
      <div className="font-medium flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
        <div className="flex gap-x-2 items-center min-w-0">
          <span>{t('title')}</span>
          {!isEditing && <AgentFeatures models={initialData?.aiModels ?? []} />}
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-2 items-center justify-end">
          {!isPreviewPage && (
            <Button onClick={handleToggleEdit} variant="outline" size="sm" disabled={isFetching}>
              {isEditing && <>{t('cancel')}</>}
              {!isEditing && (
                <>
                  <CirclePlusIcon className="h-4 w-4 mr-2" />
                  {t('select')}
                </>
              )}
            </Button>
          )}
          {isEditing && (
            <Button
              size="sm"
              onClick={() => handleSubmit({ modelIds: selectedModelIds })}
              isLoading={isFetching}
              disabled={isFetching}
            >
              {t('save')}
            </Button>
          )}
        </div>
      </div>
      {!isEditing && (
        <div
          className={cn(
            'text-sm mr-2 mt-4',
            !initialData?.aiModels?.length && 'text-muted-foreground italic',
          )}
        >
          {!initialData?.aiModels?.length && <span>{t('empty')}</span>}
          {Boolean(initialData?.aiModels?.length) && (
            <ModelsList selectedModels={initialData?.aiModels ?? []} />
          )}
        </div>
      )}
      {isEditing && (
        <div className="mt-4">
          <ModelsList
            isFetching={isFetching}
            models={models}
            onUpdate={setSelectedModelIds}
            selectedModels={initialData?.aiModels ?? []}
          />
          <div className="flex text-sm items-start justify-between">
            <div className="text-muted-foreground mt-4">{t('helper')}</div>
          </div>
        </div>
      )}
    </div>
  );
};
