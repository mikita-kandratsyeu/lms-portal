import { AiModelFeature } from '@prisma/client';

import { TextVariantsProps } from '@/components/common/text-badge';

import { capitalize } from '../utils';

type Variant = TextVariantsProps['variant'];

export const getModelFeaturesStyle = (
  modelFeature: AiModelFeature,
): { label: string; variant: Variant } => {
  let variant: Variant = 'default';

  if (modelFeature === AiModelFeature.text) {
    variant = 'indigo';
  }

  if (modelFeature === AiModelFeature.search) {
    variant = 'green';
  }

  if (modelFeature === AiModelFeature.reasoning) {
    variant = 'lime';
  }

  if (modelFeature === AiModelFeature.file) {
    variant = 'yellow';
  }

  if (modelFeature === AiModelFeature.image) {
    variant = 'green';
  }

  return {
    label: capitalize(modelFeature),
    variant,
  };
};
