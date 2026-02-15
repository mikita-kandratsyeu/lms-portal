'use server';

import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/index.mjs';
import { ResponseCreateParamsBase, Tool } from 'openai/resources/responses/responses.mjs';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { AI_PROVIDER, ChatCompletionRole, DEFAULT_TEMPERATURE } from '@/constants/ai/general';
import { LocaleInfo } from '@/hooks/store/use-locale-store';

import { getAgentData } from '../agent/get-agent-data';
import { updateAiAnalytics } from '../analytics/update-ai-analytics';
import { logAiModelPricingUsage } from '../pricing/update-ai-pricing';
import { getProviderByAgent } from './get-target-provider';

type GenerateCompletion = Omit<ResponseCreateParamsBase, 'model'> & {
  agentId?: string;
  customTools?: unknown[];
  isSearch?: boolean;
  localeInfo?: LocaleInfo;
  modelId?: string;
  temperature?: number;
};

export const generateCompletion = async ({
  agentId,
  customTools = [],
  input,
  instructions,
  isSearch = false,
  localeInfo,
  modelId,
  stream = false,
  temperature = DEFAULT_TEMPERATURE,
}: GenerateCompletion) => {
  const user = await getCurrentUser();

  const { agent } = await getAgentData({ agentId });
  const { model, provider, providerName } = await getProviderByAgent(agent, modelId);

  if (!model || (!user?.hasSubscription && model?.isSubscription)) {
    return { completion: null, model: model?.value };
  }

  const tools = [
    ...customTools,
    ...(isSearch
      ? [
          {
            type: 'web_search_preview' as const,
            user_location: localeInfo
              ? {
                  type: 'approximate' as const,
                  country: localeInfo.details.countryCode,
                  city: localeInfo.details.city,
                  region: localeInfo.details.country,
                }
              : null,
          },
        ]
      : []),
  ];

  const commonArgs = {
    model: model.value,
    stream,
    temperature,
  };

  const completion: any =
    providerName === AI_PROVIDER.openai
      ? await provider.responses.create({
          ...commonArgs,
          input,
          instructions,
          tools: tools as unknown as Tool[],
          tool_choice: 'auto',
        })
      : await provider.chat.completions.create({
          ...commonArgs,
          ...(stream ? { stream_options: { include_usage: true } } : {}),
          messages: [
            ...(instructions ? [{ role: ChatCompletionRole.SYSTEM, content: instructions }] : []),
            ...input,
          ] as ChatCompletionMessageParam[],

          tool_choice: 'auto',
          tools: tools as unknown as ChatCompletionTool[],
        });

  const usageAgentId = agent?.id;
  const usageEmail = user?.email ?? '';
  const usageModel = model.value;
  const usageUserId = user?.userId;

  if (stream) {
    const encoder = new TextEncoder();
    const stream_response = new TransformStream();

    (async () => {
      const writer = stream_response.writable.getWriter();
      let streamUsage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
        prompt_tokens_details?: { cached_tokens?: number };
      } | null = null;

      try {
        for await (const event of completion as any) {
          if (providerName === AI_PROVIDER.openai) {
            if (event.type === 'response.output_text.delta') {
              await writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({
                    item_id: event.item_id,
                    output_index: event.output_index,
                    content_index: event.content_index,
                    delta: event.delta,
                  })}\n\n`,
                ),
              );
            } else if (event.type === 'response.completed' && event.response?.usage) {
              const u = event.response.usage;
              streamUsage = {
                prompt_tokens: u.input_tokens ?? 0,
                completion_tokens: u.output_tokens ?? 0,
                total_tokens: u.total_tokens ?? 0,
                ...(u.input_tokens_details?.cached_tokens != null && {
                  prompt_tokens_details: { cached_tokens: u.input_tokens_details.cached_tokens },
                }),
              };
            }
          } else if (
            [
              AI_PROVIDER.deepseek,
              AI_PROVIDER.gemini,
              AI_PROVIDER.lmsstudio,
              AI_PROVIDER.ollama,
              AI_PROVIDER.openrouter,
            ].includes(providerName as AI_PROVIDER)
          ) {
            if (event.usage) {
              streamUsage = {
                prompt_tokens: event.usage.prompt_tokens ?? 0,
                completion_tokens: event.usage.completion_tokens ?? 0,
                total_tokens: event.usage.total_tokens ?? 0,
                ...(event.usage.prompt_tokens_details && {
                  prompt_tokens_details: event.usage.prompt_tokens_details,
                }),
              };
            }
            if (event.choices?.[0]?.finish_reason !== 'stop') {
              await writer.write(encoder.encode(event.choices[0].delta?.content ?? ''));
            }
          }
        }
      } catch (error) {
        console.error('Stream processing error:', error);

        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ error: 'Stream processing error' })}\n\n`),
        );
      } finally {
        await writer.close();

        if (usageAgentId && usageUserId && streamUsage) {
          await logAiModelPricingUsage({
            email: usageEmail,
            model: usageModel,
            providerName,
            usage: streamUsage,
            userId: usageUserId,
          });
        }
      }
    })();

    if (usageAgentId && usageUserId) {
      await updateAiAnalytics({
        agentId: usageAgentId,
        userId: usageUserId,
        model: usageModel,
      });
    }

    return { completion: stream_response.readable, model: usageModel };
  }

  if (usageAgentId && usageUserId) {
    await updateAiAnalytics({
      agentId: usageAgentId,
      userId: usageUserId,
      model: usageModel,
    });

    if (completion?.usage) {
      await logAiModelPricingUsage({
        email: usageEmail,
        model: usageModel,
        providerName,
        usage: completion.usage,
        userId: usageUserId,
      });
    }
  }

  return { completion, model: usageModel };
};
