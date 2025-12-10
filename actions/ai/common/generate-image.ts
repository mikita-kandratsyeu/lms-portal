'use server';

import { ImageGenerateParams } from 'openai/resources/images.mjs';

import { getCurrentUser } from '@/actions/auth/get-current-user';

import { getAgentData } from '../agent/get-agent-data';
import { getProviderByAgent } from './get-target-provider';

type GenerateImage = Omit<ImageGenerateParams, 'model'> & {
  agentId?: string;
  modelId?: string;
};

export const generateImage = async ({ agentId, modelId, prompt }: GenerateImage) => {
  const user = await getCurrentUser();

  const { agent } = await getAgentData({ agentId });
  const { model, provider } = await getProviderByAgent(agent, modelId);

  if (!model || (!user?.hasSubscription && model?.isSubscription)) {
    return { image: null, model: model?.value };
  }

  const response = await provider.images.generate({
    model: model.value,
    n: 1,
    prompt,
    quality: 'hd',
    response_format: 'b64_json',
    size: '1024x1024',
  });

  return {
    image: response,
    model: model.value,
  };
};
