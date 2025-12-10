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
    <div className="flex flex-col gap-4 mt-8">
      <p className="font-medium text-xl">{t('advancedOptions')}</p>
      <PublicProfileForm initialData={initialData} />
      <NewTabCopilotForm initialData={initialData} />
      {config?.features?.christmas && <ChristmasForm initialData={initialData} />}
    </div>
  );
};
