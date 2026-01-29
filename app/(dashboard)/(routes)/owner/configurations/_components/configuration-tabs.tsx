'use client';

import { useTranslations } from 'next-intl';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';

import { AiModelManager } from './ai-model-manager';
import { AppConfigManager } from './app-config-manager';
import { CategoryManager } from './category-manager';
import { CsmCategoryManager } from './csm-category-manager';
import { FeeManager } from './fee-manager';
import { StripeSubscriptionManager } from './stripe-subscription-manager';

export const ConfigurationTabs = () => {
  const t = useTranslations('owner.configurations.tabs');

  return (
    <Tabs defaultValue="subscriptions" className="w-full">
      <TabsList className="h-auto flex-wrap justify-start">
        <TabsTrigger value="subscriptions">{t('subscriptions')}</TabsTrigger>
        <TabsTrigger value="fees">{t('fees')}</TabsTrigger>
        <TabsTrigger value="categories">{t('categories')}</TabsTrigger>
        <TabsTrigger value="csm-categories">{t('csmCategories')}</TabsTrigger>
        <TabsTrigger value="ai-models">{t('aiModels')}</TabsTrigger>
        <TabsTrigger value="app-config">{t('appConfig')}</TabsTrigger>
      </TabsList>
      <TabsContent value="subscriptions" className="mt-6">
        <StripeSubscriptionManager />
      </TabsContent>
      <TabsContent value="fees" className="mt-6">
        <FeeManager />
      </TabsContent>
      <TabsContent value="categories" className="mt-6">
        <CategoryManager />
      </TabsContent>
      <TabsContent value="csm-categories" className="mt-6">
        <CsmCategoryManager />
      </TabsContent>
      <TabsContent value="ai-models" className="mt-6">
        <AiModelManager />
      </TabsContent>
      <TabsContent value="app-config" className="mt-6">
        <AppConfigManager />
      </TabsContent>
    </Tabs>
  );
};
