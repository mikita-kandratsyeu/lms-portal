'use client';

import { AiModel } from '@prisma/client';
import { useEffect, useState } from 'react';

import { AgentFeatures } from '@/components/ai-agents/agent-card/agent-features';
import { TextBadge } from '@/components/common/text-badge';
import { Checkbox } from '@/components/ui';
import { cn } from '@/lib/utils';

type ModelsListProps = {
  isFetching?: boolean;
  models?: AiModel[];
  onUpdate?: (modelIds: string[]) => void;
  selectedModels: AiModel[];
};

export const ModelsList = ({
  isFetching,
  selectedModels,
  onUpdate,
  models = [],
}: ModelsListProps) => {
  const [modelIds, setModelIds] = useState(selectedModels.map((model) => model.id));

  const isEdit = models.length > 0;
  const allModels = selectedModels.length > 0 && isEdit ? models : selectedModels;

  useEffect(() => {
    onUpdate?.(modelIds);
  }, [modelIds, modelIds.length, onUpdate]);

  return allModels.map((model) => {
    const isSelected = Boolean(model.isDefault) || modelIds.includes(model.id);

    return (
      <div
        key={model.id}
        className={cn(
          'flex items-center gap-x-2 bg-neutral-200 border-neutral-200 border text-neutral-700 rounded-md mb-4 text-sm dark:bg-muted dark:text-primary dark:border-muted p-3',
          isSelected &&
            'bg-blue-500/15 border-blue-500/20 text-blue-700 dark:text-blue-400 dark:bg-blue-500/15 dark:border-blue-500/20',
        )}
      >
        {isEdit && (
          <div className="rounded-l-md transition duration-300 dark:hover:bg-neutral-900/50 mr-4">
            <Checkbox
              checked={isSelected}
              disabled={Boolean(model.isDefault) || isFetching}
              onCheckedChange={(value) =>
                setModelIds((prev) =>
                  value ? [...prev, model.id] : prev.filter((id) => id !== model.id),
                )
              }
              aria-label="Select LLM model"
            />
          </div>
        )}
        <div className="flex flex-col">
          <div className="flex gap-x-2 items-center">
            <strong>{model.name}</strong>
            {model.isDefault && <TextBadge label="Default" />}
          </div>

          <p className="text-xs font-light">{model.value}</p>
        </div>
        <div className="ml-auto flex items-center gap-x-2">
          {isEdit && <AgentFeatures models={[model]} />}
        </div>
      </div>
    );
  });
};
