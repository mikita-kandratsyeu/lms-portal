'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo, useCallback, useMemo, useState } from 'react';

import { GetAppConfig } from '@/actions/configs/get-app-config';
import {
  Button,
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui';
import { AI_PROVIDER } from '@/constants/ai/general';
import { useAppConfigStore } from '@/hooks/store/use-app-config-store';
import { useChatStore } from '@/hooks/store/use-chat-store';
import { useCurrentUser } from '@/hooks/use-current-user';
import { cn } from '@/lib/utils';

type Model = GetAppConfig['ai'][0]['text-models'][0];

type Callback = {
  currentModel: string;
  currentModelLabel: string;
  hasSearch?: boolean;
  isOpen: boolean;
};

type CommandItemsProps = {
  callback: (args: Callback) => void;
  currentModel: string;
  models: Model[];
};

type ChatModelSwitcherProps = {
  className?: string;
};

const CommandItems = memo(({ callback, currentModel, models }: CommandItemsProps) => {
  const { user } = useCurrentUser();

  return models.map((model) => (
    <CommandItem
      disabled={!user?.hasSubscription && model.isSubscription}
      key={model.value}
      value={model.value}
      onSelect={(currentValue) => {
        const value = currentValue === currentModel ? '' : currentValue;
        callback({
          currentModel: value,
          currentModelLabel: model.label,
          hasSearch: model.hasSearch,
          isOpen: false,
        });
      }}
    >
      <div className="flex">
        <Check
          className={cn(
            'mr-2 mt-1 h-4 w-4',
            currentModel === model.value ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div className="flex flex-col">
          <p className="font-semibold">{model.label}</p>
          <p className="text-xs text-muted-foreground">{model.owner}</p>
        </div>
      </div>
    </CommandItem>
  ));
});

export const ChatModelSwitcher = ({ className }: ChatModelSwitcherProps) => {
  const t = useTranslations('chat.top-bar');

  const { config: appConfig } = useAppConfigStore((state) => ({
    config: state.config,
  }));
  const { currentModel, setCurrentModel, setCurrentModelLabel, setHasSearch } = useChatStore();

  const [open, setOpen] = useState(false);

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

  const handleCommandItemsCallback = useCallback(
    ({
      currentModel,
      currentModelLabel,
      hasSearch,
      isOpen,
    }: {
      currentModel: string;
      currentModelLabel: string;
      hasSearch?: boolean;
      isOpen: boolean;
    }) => {
      setCurrentModel(currentModel);
      setCurrentModelLabel(currentModelLabel);
      setOpen(isOpen);
      setHasSearch(Boolean(hasSearch));
    },
    [setCurrentModel, setCurrentModelLabel, setHasSearch],
  );

  const handleOpenChange = useCallback((value: boolean) => {
    setOpen(value);
  }, []);

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button variant="ghost" aria-expanded={open} className="justify-between truncate">
            {currentModel
              ? [...freeModels, ...paidModels].find((model) => model.value === currentModel)?.label
              : freeModels[0]?.label}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0">
          <Command>
            <CommandList>
              <CommandGroup heading={t('models')}>
                <CommandItems
                  callback={handleCommandItemsCallback}
                  currentModel={currentModel}
                  models={freeModels}
                />
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading={'Preview'}>
                <CommandItems
                  callback={handleCommandItemsCallback}
                  currentModel={currentModel}
                  models={paidModels}
                />
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

CommandItems.displayName = 'CommandItems';
