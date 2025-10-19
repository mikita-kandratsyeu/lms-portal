'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { GetAppConfig } from '@/actions/configs/get-app-config';
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
import { AI_PROVIDER } from '@/constants/ai/general';
import { useAppConfigStore } from '@/hooks/store/use-app-config-store';
import { useChatStore } from '@/hooks/store/use-chat-store';
import { useCurrentUser } from '@/hooks/use-current-user';

type Model = GetAppConfig['ai'][0]['text-models'][0];

type AiModelSwitcherProps = {
  className?: string;
};

export const AiModelSwitcher = ({ className }: AiModelSwitcherProps) => {
  const { user } = useCurrentUser();

  const t = useTranslations('chat.top-bar');

  const { config: appConfig } = useAppConfigStore((state) => ({
    config: state.config,
  }));
  const { currentModel, setCurrentModel, setCurrentModelLabel, setHasSearch } = useChatStore();

  const [paidModels, freeModels] = useMemo(
    () =>
      (
        appConfig?.ai?.flatMap((ai) => {
          if (process.env.NODE_ENV === 'production' && ai.provider === AI_PROVIDER.ollama) {
            return [];
          }

          return ai['text-models'];
        }) ?? []
      ).reduce<[Model[], Model[]]>(
        (acc, model) => {
          if (model.isSubscription) {
            acc[0].push(model);
          } else {
            acc[1].push(model);
          }

          return acc;
        },
        [[], []],
      ),
    [appConfig?.ai],
  );

  const handleValueChange = (value: string) => {
    const model = [...freeModels, ...paidModels].find((model) => model.value === value);

    if (model) {
      setCurrentModel(model.value);
      setCurrentModelLabel(model.label);
      setHasSearch(Boolean(model.hasSearch));
    }
  };

  return (
    <div className={className}>
      <Select onValueChange={handleValueChange} defaultValue={currentModel || freeModels[0]?.value}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a LLM model" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="text-xs text-muted-foreground">{t('models')}</SelectLabel>
            {freeModels.map((model) => (
              <SelectItem
                key={model.value}
                className="text-sm hover:bg-muted transition-colors duration-200 ease-in-out hover:cursor-pointer"
                value={model.value}
              >
                <p className="font-semibold">{model.label}</p>
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel className="text-xs text-muted-foreground">Preview</SelectLabel>
            {paidModels.map((model) => (
              <SelectItem
                className="text-sm hover:bg-muted transition-colors duration-200 ease-in-out hover:cursor-pointer"
                disabled={!user?.hasSubscription && model.isSubscription}
                key={model.value}
                value={model.value}
              >
                <p className="font-semibold">{model.label}</p>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
