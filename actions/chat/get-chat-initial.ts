'use server';

import { getLocale } from 'next-intl/server';
import { ChatCompletionUserMessageParam } from 'openai/resources/index.mjs';

import { ChatCompletionRole } from '@/constants/ai/general';
import { ONE_DAY_SEC } from '@/constants/common';
import { fetchCachedData } from '@/lib/cache';

import { generateCompletion } from '../ai/generate-completion';

export const getChatInitial = async () => {
  const locale = await getLocale();

  try {
    const introMessages = await fetchCachedData(
      `chat-initial_${locale}`,
      async () => {
        const response = await generateCompletion({
          instructions:
            'You are a machine that only returns array - ["question 1", "question 2", ...]',
          input: [
            {
              content: `Generate 4 questions ranging from 120 to 150 characters long for an intelligent chat on the topic of programming. Language code is ${locale}. Write the result to an array.`,
              role: ChatCompletionRole.USER as unknown as ChatCompletionUserMessageParam['role'],
            },
          ],
        });

        return response.completion;
      },
      ONE_DAY_SEC,
    );

    return {
      introMessages: JSON.parse(
        introMessages.output_text ?? introMessages.choices[0].message.content ?? '[]',
      ),
    };
  } catch (error) {
    console.error('[GET_CHAT_INITIAL_ACTION]', error);

    return {
      introMessages: [],
    };
  }
};
