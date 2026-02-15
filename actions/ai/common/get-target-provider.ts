'use server';

import OpenAI from 'openai';

import { AI_PROVIDER } from '@/constants/ai/general';

import { GetAgentDataResponse } from '../agent/get-agent-data';

const AIProvider = (providerName: string) => {
  let options: { apiKey: string; baseURL?: string } = {
    apiKey: '',
    baseURL: '',
  };

  if (providerName === AI_PROVIDER.deepseek) {
    options = {
      apiKey: process.env.DEEPSEEK_API_KEY as string,
      baseURL: 'https://api.deepseek.com',
    };
  }

  if (providerName === AI_PROVIDER.openai) {
    options = {
      apiKey: process.env.OPENAI_API_KEY as string,
    };
  }

  if (providerName === AI_PROVIDER.gemini) {
    options = {
      apiKey: process.env.GEMINI_API_KEY as string,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    };
  }

  if (providerName === AI_PROVIDER.openrouter) {
    options = {
      apiKey: process.env.OPENROUTER_API_KEY as string,
      baseURL: 'https://openrouter.ai/api/v1',
    };
  }

  return new OpenAI(options);
};

export const getProviderByAgent = async (
  agent: GetAgentDataResponse['agent'],
  modelId?: string,
) => {
  const model = agent?.aiModels.find((model) => (modelId ? model.id === modelId : model.isDefault));

  if (model) {
    return {
      model,
      provider: AIProvider(model.provider),
      providerName: model.provider,
    };
  }

  return {};
};
