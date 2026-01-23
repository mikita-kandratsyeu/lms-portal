'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CirclePlusIcon, PencilLineIcon, Trash2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { BsStars } from 'react-icons/bs';
import { v4 as uuidv4 } from 'uuid';
import * as z from 'zod';

import { GetAgentDataResponse } from '@/actions/ai/agent/get-agent-data';
import { ChatStarters } from '@/components/chat/chat-starters';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import { Button, Input } from '@/components/ui';
import { Form, FormField } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { ChatCompletionRole, LIMIT_CONVERSATION_STARTERS } from '@/constants/ai/general';
import {
  SYSTEM_CONVERSATION_STARTERS_PROMPT,
  USER_CONVERSATION_STARTERS_PROMPT,
} from '@/constants/ai/prompts';
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
  const t = useTranslations('ai-agents.edit.conversationStarters');
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
  const [isGenerating, setIsGenerating] = useState(false);

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

      toast({ title: t('toast.updated') });
      handleToggleEdit();

      router.refresh();
    } catch (error) {
      console.error('[CONVERSATION_STARTERS_FORM]', error);

      toast({ isError: true, description: (error as Error)?.message ?? '' });
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

  const getCompletionText = (completion: any) => {
    if (!completion) {
      return '';
    }

    if (typeof completion === 'string') {
      return completion;
    }

    if (typeof completion.output_text === 'string') {
      return completion.output_text;
    }

    const content = completion.choices?.[0]?.message?.content ?? completion.choices?.[0]?.text;

    if (Array.isArray(content)) {
      return content.map((item) => item?.text ?? '').join('');
    }

    return typeof content === 'string' ? content : '';
  };

  const parseGeneratedStarters = (rawText: string) => {
    const trimmedText = rawText.trim();
    const fencedMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const jsonCandidate = fencedMatch ? fencedMatch[1] : trimmedText;
    const startIndex = jsonCandidate.indexOf('{');
    const endIndex = jsonCandidate.lastIndexOf('}');
    const normalized =
      startIndex !== -1 && endIndex !== -1 ? jsonCandidate.slice(startIndex, endIndex + 1) : '';

    if (!normalized) {
      throw new Error(t('toast.generateError'));
    }

    return JSON.parse(normalized) as Record<string, string[]>;
  };

  const buildStarterEntries = (language: string, texts: unknown) => {
    if (!Array.isArray(texts)) {
      return [];
    }

    const uniqueTexts = Array.from(
      new Set(
        texts
          .filter((text) => typeof text === 'string')
          .map((text) => text.trim())
          .filter(Boolean),
      ),
    ).slice(0, LIMIT_CONVERSATION_STARTERS);

    return uniqueTexts.map((text) => ({
      id: uuidv4(),
      language,
      text,
    }));
  };

  const handleGenerateStarters = async () => {
    try {
      setIsGenerating(true);

      const prompt = USER_CONVERSATION_STARTERS_PROMPT({
        agentName: initialData?.name,
        agentDescription: initialData?.description,
        systemInstruction: initialData?.systemInstruction,
        limit: LIMIT_CONVERSATION_STARTERS,
      });

      const response = await fetcher.post('/api/ai/completions', {
        body: {
          input: [{ role: ChatCompletionRole.USER, content: prompt }],
          instructions: SYSTEM_CONVERSATION_STARTERS_PROMPT,
        },
        cache: 'no-cache',
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const completionText = getCompletionText(response?.completion);
      const generated = parseGeneratedStarters(completionText);

      const startersByLanguage = {
        en: buildStarterEntries('en', generated.en),
        ru: buildStarterEntries('ru', generated.ru),
        be: buildStarterEntries('be', generated.be),
      };

      const starters = Object.values(startersByLanguage).flat();
      const hasAllLanguages = Object.values(startersByLanguage).every((items) => items.length > 0);

      if (!starters.length || !hasAllLanguages) {
        throw new Error(t('toast.generateError'));
      }

      form.setValue('chatConversationStarters', starters, { shouldValidate: true });
      setCurrentInput('');
      toast({ title: t('toast.generated') });
    } catch (error) {
      toast({
        isError: true,
        description: (error as Error)?.message ?? t('toast.generateError'),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-6 border  bg-neutral-100 dark:bg-neutral-900 rounded-md p-4">
      <div className="font-medium flex items-start justify-between gap-x-2">
        <div className="flex flex-col gap-1 min-w-0">
          <span>{t('title')}</span>
          {isEditing && (
            <span className="text-sm text-muted-foreground">
              {t('limit', {
                count: currentConversationStarters.length,
                max: LIMIT_CONVERSATION_STARTERS,
              })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-x-2">
          {!isPreviewPage && !isEditing && (
            <Button disabled={isSubmitting} onClick={handleToggleEdit} size="sm" variant="outline">
              <PencilLineIcon className="h-4 w-4 mr-2" />
              {t('edit')}
            </Button>
          )}
          {isEditing && (
            <>
              <Button
                disabled={isSubmitting}
                onClick={handleToggleEdit}
                size="sm"
                variant="outline"
              >
                {t('cancel')}
              </Button>
              <Button
                disabled={!isValid || isSubmitting}
                isLoading={isSubmitting}
                onClick={form.handleSubmit(handleSubmit)}
                size="sm"
                type="submit"
              >
                {t('save')}
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <LanguageSwitcher
          callback={setSelectedLocale}
          isDisabled={isSubmitting || isGenerating}
          value={selectedLocale}
        />
        {isEditing && (
          <Button
            disabled={isSubmitting || isGenerating}
            isLoading={isGenerating}
            onClick={handleGenerateStarters}
            size="sm"
            variant="outline"
          >
            <BsStars className="h-4 w-4 mr-2" />
            {t(isGenerating ? 'generatingAi' : 'generateAi')}
          </Button>
        )}
      </div>
      {!isEditing && (
        <div className="text-sm mt-4">
          {Boolean(currentConversationStarters.length) && (
            <ChatStarters starters={currentConversationStarters} showCopyButton />
          )}
          {!currentConversationStarters.length && (
            <span className="text-muted-foreground italic">{t('empty')}</span>
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
                          placeholder={t('placeholder')}
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
