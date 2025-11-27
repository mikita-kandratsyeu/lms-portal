'use client';

import { AiModel } from '@prisma/client';

import { TextBadge } from '@/components/common/text-badge';
import { getModelFeaturesStyle } from '@/lib/ai/models';

type AgentFeaturesProps = {
  models: AiModel[];
};

export const AgentFeatures = ({ models }: AgentFeaturesProps) => {
  const features = models.flatMap((model) => model.features).toSorted((a, b) => a.localeCompare(b));
  const uniqFeatures = [...new Set(features)];

  return (
    <div className="ml-auto flex items-center gap-x-2">
      {uniqFeatures.map((feature) => {
        const { label, variant } = getModelFeaturesStyle(feature);

        return <TextBadge key={feature} label={label} variant={variant} />;
      })}
    </div>
  );
};
