import { useTranslations } from 'next-intl';

import { ConfigurationTabs } from './_components/configuration-tabs';

const ConfigurationsPage = () => {
  const t = useTranslations('owner.configurations.page');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-medium">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
        </div>
      </div>
      <ConfigurationTabs />
    </div>
  );
};

export default ConfigurationsPage;
