'use client';

import { AiAgent, AiModel } from '@prisma/client';
import { CirclePlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import * as z from 'zod';

import { AgentFeatures } from '@/components/ai-agents/agent-card/agent-features';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

import { ModelsList } from '../models-list';

type ModelsProps = {
  agentId: string;
  initialData: AiAgent & { aiModels: AiModel[] };
  models: AiModel[];
};

const formSchema = z.object({
  modelIds: z.array(z.string()),
});

export const ModelsForm = ({ agentId, initialData, models }: ModelsProps) => {
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

      handleToggleEdit();

      toast({ title: 'LLM models has been updated' });
      router.refresh();
    } catch (error) {
      toast({ isError: true });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="mt-6 border  bg-neutral-100 dark:bg-neutral-900 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        <div className="flex gap-x-2 items-center">
          <span>LLM models</span>
          {!isEditing && <AgentFeatures models={initialData.aiModels} />}
        </div>
        <div className="flex gap-x-2 items-center">
          <Button onClick={handleToggleEdit} variant="outline" size="sm" disabled={isFetching}>
            {isEditing && <>Cancel</>}
            {!isEditing && (
              <>
                <CirclePlusIcon className="h-4 w-4 mr-2" />
                Select
              </>
            )}
          </Button>
          {isEditing && (
            <Button
              size="sm"
              onClick={() => handleSubmit({ modelIds: selectedModelIds })}
              isLoading={isFetching}
              disabled={isFetching}
            >
              Save
            </Button>
          )}
        </div>
      </div>
      {!isEditing && (
        <div
          className={cn(
            'text-sm mr-2 mt-4',
            !initialData.aiModels.length && 'text-neutral-500 italic',
          )}
        >
          {!initialData.aiModels.length && <p>No selected LLM models</p>}
          <ModelsList selectedModels={initialData.aiModels} />
        </div>
      )}
      {isEditing && (
        <div className="mt-4">
          <ModelsList
            isFetching={isFetching}
            models={models}
            onUpdate={setSelectedModelIds}
            selectedModels={initialData.aiModels}
          />
          <div className="flex text-xs items-start justify-between">
            <div className="text-muted-foreground mt-4">Select LLM models for your agent</div>
          </div>
        </div>
      )}
    </div>
  );
};
