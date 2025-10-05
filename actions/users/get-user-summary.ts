'use server';

import { getLocale } from 'next-intl/server';
import { ChatCompletionUserMessageParam } from 'openai/resources/index.mjs';

import { ChatCompletionRole } from '@/constants/ai/general';
import { USER_SUMMARY } from '@/constants/ai/prompts';
import { extractValidJson } from '@/lib/utils';

import { generateCompletion } from '../ai/generate-completion';

export const getUserSummary = async <T>(data: T) => {
  const locale = await getLocale();

  try {
    const response: any = await generateCompletion({
      instructions:
        'You are a machine that only returns JSON object format without unnecessary symbols.',
      input: [
        {
          content: USER_SUMMARY(data, locale),
          role: ChatCompletionRole.USER as unknown as ChatCompletionUserMessageParam['role'],
        },
      ],
    });

    const generatedSummary = JSON.parse(
      extractValidJson(
        response.completion.output_text ?? response.completion.choices[0].message.content,
      ) ?? '{}',
    );

    return generatedSummary?.content ?? '';
  } catch (error) {
    console.error('[GET_USER_SUMMARY_ACTION]', error);

    return '';
  }
};
