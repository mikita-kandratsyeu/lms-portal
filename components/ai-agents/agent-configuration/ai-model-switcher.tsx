'use client';

import { AiModel, AiModelFeature } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { TextBadge } from '@/components/common/text-badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { useAiAgentStore } from '@/hooks/store/use-ai-agent-store';
import { useChatStore } from '@/hooks/store/use-chat-store';
import { useCurrentUser } from '@/hooks/use-current-user';

type AiModelSwitcherProps = {
  className?: string;
};

export const AiModelSwitcher = ({ className }: AiModelSwitcherProps) => {
  const { user } = useCurrentUser();

  const tAi = useTranslations('ai-agents.switchers');
  const t = useTranslations('chat.top-bar');
  const tProfile = useTranslations('profileButton');

  const { connectedAgents, currentAgent, currentModel, setCurrentModel } = useAiAgentStore(
    (state) => ({
      connectedAgents: state.connectedAgents,
      currentAgent: state.currentAgent,
      currentModel: state.currentModel,
      setCurrentModel: state.setCurrentModel,
    }),
  );

  const { isFetching, setActiveFeature } = useChatStore((state) => ({
    isFetching: state.isFetching,
    setActiveFeature: state.setActiveFeature,
  }));

  const defaultAgent = useMemo(
    () => connectedAgents.find((agent) => agent.isDefault),
    [connectedAgents],
  );

  const models = useMemo(
    () => (currentAgent ? currentAgent.aiModels : defaultAgent?.aiModels ?? []),
    [currentAgent, defaultAgent?.aiModels],
  );

  const [previewModels, freeModels] = models.reduce<[AiModel[], AiModel[]]>(
    (acc, model) => {
      if (model.features?.[0] !== AiModelFeature.image) {
        if (model.isSubscription) {
          acc[0].push(model);
        } else {
          acc[1].push(model);
        }
      }

      return acc;
    },
    [[], []],
  );

  const selectedModelId =
    currentModel?.id &&
    currentModel?.features?.[0] !== AiModelFeature.image &&
    models.some((model) => model.id === currentModel.id)
      ? currentModel.id
      : freeModels?.find((model) => model.isDefault)?.id ?? freeModels[0]?.id ?? models[0]?.id;

  const handleValueChange = (modelId: string) => {
    const model = models.find((model) => model.id === modelId);

    if (model) {
      setActiveFeature(AiModelFeature.text);
      setCurrentModel(model);
    }
  };

  return (
    <div className={className}>
      <Select onValueChange={handleValueChange} value={selectedModelId}>
        <SelectTrigger className="w-full" disabled={isFetching}>
          <SelectValue placeholder={tAi('modelPlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          {Boolean(freeModels.length) && (
            <SelectGroup>
              <SelectLabel className="text-xs text-muted-foreground">{t('models')}</SelectLabel>
              {freeModels.map((model) => (
                <SelectItem
                  key={model.id}
                  className="text-sm hover:bg-muted transition-colors duration-200 ease-in-out hover:cursor-pointer"
                  value={model.id}
                >
                  <p>{model.name}</p>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
          {Boolean(freeModels.length) && Boolean(previewModels.length) && <SelectSeparator />}
          {Boolean(previewModels.length) && (
            <SelectGroup>
              <SelectLabel className="text-xs text-muted-foreground">
                <div className="flex gap-x-2 items-center">
                  <p>{tAi('preview')}</p>
                  <TextBadge label={tProfile('premium')} variant="lime" />
                </div>
              </SelectLabel>
              {previewModels.map((model) => (
                <SelectItem
                  className="text-sm hover:bg-muted transition-colors duration-200 ease-in-out hover:cursor-pointer"
                  disabled={!user?.hasSubscription && Boolean(model.isSubscription)}
                  key={model.id}
                  value={model.id}
                >
                  <p>{model.name}</p>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
