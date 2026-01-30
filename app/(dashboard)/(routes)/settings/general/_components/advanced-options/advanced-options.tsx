'use client';

import { User, UserSettings } from '@prisma/client';
import { useTranslations } from 'next-intl';

import { useAppConfigStore } from '@/hooks/store/use-app-config-store';

import { ChristmasForm } from './christmas-form';
import { NewTabCopilotForm } from './new-tab-copilot-form';
import { PublicProfileForm } from './public-profile-form';

type AdvancedOptionsProps = {
  initialData: User & { settings: UserSettings | null };
};

export const AdvancedOptions = ({ initialData }: AdvancedOptionsProps) => {
  const t = useTranslations('settings');

  const { config } = useAppConfigStore((state) => ({ config: state.config }));

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{t('advancedOptions')}</h2>
      <div className="space-y-4">
        <PublicProfileForm initialData={initialData} />
        <NewTabCopilotForm initialData={initialData} />
        {config?.features?.christmas && <ChristmasForm initialData={initialData} />}
      </div>
    </div>
  );
};
