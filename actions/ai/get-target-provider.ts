'use server';

import OpenAI from 'openai';

import { AI_PROVIDER } from '@/constants/ai/general';

import { getAppConfig } from '../configs/get-app-config';

const AIProvider = (provider: string) => {
  let options = {};

  switch (provider) {
    case AI_PROVIDER.deepseek:
      options = {
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com',
      };
      break;
    case AI_PROVIDER.openai:
      options = {
        apiKey: process.env.OPENAI_API_KEY,
      };
      break;
    default:
      options = {
        apiKey: 'ollama',
        baseURL: process.env.OLLAMA_BASE_URL,
      };
  }

  return new OpenAI(options);
};

export const getTargetProvider = async (model: string | undefined) => {
  const config = await getAppConfig();

  const targetProvider = config.ai.find((ai) => {
    const allModels = [...ai['image-models'], ...ai['text-models']].map((model) => model.value);

    return allModels.includes(String(model));
  });

  if (!targetProvider) {
    const { provider, 'text-models': textModels, 'image-models': imageModels } = config.ai[0];

    return {
      provider: AIProvider(provider),
      providerName: provider,
      targetImageModel: imageModels[0],
      targetTextModel: textModels[0],
    };
  }

  const { provider, 'text-models': textModels, 'image-models': imageModels } = targetProvider;

  const targetTextModel =
    textModels.find((textModel) => textModel.value === model) ?? textModels[0];
  const targetImageModel =
    imageModels.find((imageModel) => imageModel.value === model) ?? imageModels[0];

  return {
    provider: AIProvider(provider),
    providerName: provider,
    targetImageModel,
    targetTextModel,
  };
};
