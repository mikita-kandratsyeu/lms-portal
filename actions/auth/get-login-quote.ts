'use server';

import { getLocale } from 'next-intl/server';
import { ChatCompletionUserMessageParam } from 'openai/resources/index.mjs';

import { ChatCompletionRole } from '@/constants/ai/general';
import { TEN_MINUTE_SEC } from '@/constants/common';
import { fetchCachedData } from '@/lib/cache';
import { extractValidJson } from '@/lib/utils';

import { generateCompletion } from '../ai/generate-completion';

export const getLoginQuote = async () => {
  const locale = await getLocale();

  try {
    const response = await fetchCachedData(
      `login-quote_${locale}`,
      async () => {
        const response = await generateCompletion({
          instructions:
            'You are a machine that only returns JSON object format without unnecessary symbols.',
          input: [
            {
              content: `Generate a quote from a famous philosopher. Language code is ${locale}. Write it down in JSON format - {"quote": "Quote", "author": "Quote the author"}`,
              role: ChatCompletionRole.USER as unknown as ChatCompletionUserMessageParam['role'],
            },
          ],
        });

        return response;
      },
      TEN_MINUTE_SEC,
    );

    const generatedQuote = JSON.parse(
      extractValidJson(
        response.completion.output_text ?? response.completion.choices[0].message.content,
      ) ?? '{}',
    );
    const model = response.model ?? '';

    return {
      author: generatedQuote?.author ?? '',
      model,
      quote: generatedQuote?.quote ?? '',
    };
  } catch (error) {
    console.error('[GET_LOGIN_CITE_ACTION]', error);

    return {
      author: '',
      model: '',
      quote: '',
    };
  }
};
