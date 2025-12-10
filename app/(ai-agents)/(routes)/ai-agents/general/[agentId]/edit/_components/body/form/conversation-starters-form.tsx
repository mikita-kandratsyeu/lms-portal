'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CirclePlusIcon, PencilLineIcon, Trash2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import * as z from 'zod';

import { GetAgentDataResponse } from '@/actions/ai/agent/get-agent-data';
import { ChatStarters } from '@/components/chat/chat-starters';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import { Button, Input } from '@/components/ui';
import { Form, FormField } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { LIMIT_CONVERSATION_STARTERS } from '@/constants/ai/general';
import {
  getConversationStartersByLanguage,
  mapConversationStarters,
} from '@/lib/chat/conversation-starters';
import { fetcher } from '@/lib/fetcher';

type ConversationStartersFormProps = {
  agentId: string;
  initialData: GetAgentDataResponse['agent'];
  isPreviewPage?: boolean;
};

type ConversationStarter = {
  id: string;
  language: string;
  text: string;
};

const formSchema = z.object({
  chatConversationStarters: z
    .array(
      z.object({
        id: z.string(),
        language: z.string(),
        text: z.string(),
      }),
    )
    .min(1),
});

export const ConversationStartersForm = ({
  agentId,
  initialData,
  isPreviewPage,
}: ConversationStartersFormProps) => {
  const { toast } = useToast();

  const router = useRouter();
  const locale = useLocale();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chatConversationStarters: mapConversationStarters(initialData?.chatConversationStarters),
    },
  });

  const [currentInput, setCurrentInput] = useState('');
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const [isEditing, setIsEditing] = useState(false);

  const { isSubmitting, isValid } = form.formState;

  const currentConversationStarters = getConversationStartersByLanguage(
    form.watch('chatConversationStarters'),
    selectedLocale,
  );

  useEffect(() => {
    setSelectedLocale(locale);
    form.reset({
      chatConversationStarters: mapConversationStarters(initialData?.chatConversationStarters),
    });
  }, [form, initialData?.chatConversationStarters, locale]);

  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev);
    form.reset();
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetcher.patch(`/api/ai/agents/${agentId}`, {
        body: values,
      });

      toast({ title: 'Star conversations has been updated' });
      handleToggleEdit();

      router.refresh();
    } catch (error) {
      console.error('[CONVERSATION_STARTERS_FORM]', error);

      toast({ isError: true });
    }
  };

  const handleAddConversationStarter = (
    field: {
      value: ConversationStarter[];
      onChange: (value: ConversationStarter[] | undefined) => void;
    },
    starter: ConversationStarter,
  ) => {
    field.onChange([...field.value, starter]);
    setCurrentInput('');
  };

  const handleRemoveConversationStarter = (
    field: {
      value: ConversationStarter[];
      onChange: (value: ConversationStarter[] | undefined) => void;
    },
    id: string,
  ) => {
    field.onChange(field.value.filter((value) => value.id !== id));
  };

  return (
    <div className="mt-6 border  bg-neutral-100 dark:bg-neutral-900 rounded-md p-4">
      <div className="font-medium flex items-center justify-between gap-x-2">
        <div className="flex flex-col gap-x-2 justify-center">
          <span>Conversation starters</span>
          {isEditing && (
            <span className="text-sm text-muted-foreground">
              {currentConversationStarters.length} of {LIMIT_CONVERSATION_STARTERS} (Max)
            </span>
          )}
        </div>
        <div className="flex gap-x-2 items-center">
          <LanguageSwitcher
            callback={setSelectedLocale}
            isDisabled={isSubmitting}
            value={selectedLocale}
          />
          {!isPreviewPage && (
            <Button disabled={isSubmitting} onClick={handleToggleEdit} size="sm" variant="outline">
              {isEditing && <>Cancel</>}
              {!isEditing && (
                <>
                  <PencilLineIcon className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          )}
          {isEditing && (
            <Button
              disabled={!isValid || isSubmitting}
              isLoading={isSubmitting}
              onClick={form.handleSubmit(handleSubmit)}
              size="sm"
              type="submit"
            >
              Save
            </Button>
          )}
        </div>
      </div>
      {!isEditing && (
        <div className="text-sm mt-4">
          {Boolean(currentConversationStarters.length) && (
            <ChatStarters starters={currentConversationStarters} showCopyButton />
          )}
          {!currentConversationStarters.length && (
            <span className="text-muted-foreground italic">No conversation starters for chat.</span>
          )}
        </div>
      )}
      {isEditing && (
        <Form {...form}>
          <form className="space-y-4 mt-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="flex gap-x-4">
              <FormField
                control={form.control}
                name="chatConversationStarters"
                render={({ field }) => {
                  const currentStarted = {
                    id: uuidv4(),
                    language: selectedLocale,
                    text: currentInput,
                  };

                  const isLimited =
                    currentConversationStarters.length >= LIMIT_CONVERSATION_STARTERS;

                  return (
                    <div className="flex flex-col w-full gap-y-2">
                      <div className="flex flex-col text-sm gap-y-2 w-full">
                        {currentConversationStarters.map((starter) => (
                          <div className="flex gap-x-2 w-full" key={starter.id}>
                            <p className="border rounded p-2 line-clamp-1 flex-1">{starter.text}</p>
                            <Button
                              disabled={isSubmitting}
                              onClick={() => handleRemoveConversationStarter(field, starter.id)}
                              type="button"
                              variant="outline"
                            >
                              <Trash2Icon className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-x-2">
                        <Input
                          disabled={isSubmitting}
                          placeholder="e.g. 'What is the weather today?'"
                          value={currentInput}
                          onChange={(event) => setCurrentInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();

                              if (!currentInput.length || isLimited) {
                                return;
                              }

                              handleAddConversationStarter(field, currentStarted);
                            }
                          }}
                        />
                        <Button
                          disabled={isSubmitting || !currentInput.length || isLimited}
                          onClick={() => handleAddConversationStarter(field, currentStarted)}
                          type="button"
                          variant="outline"
                        >
                          <CirclePlusIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
