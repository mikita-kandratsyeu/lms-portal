'use client';

import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import type { GetAppConfig as AppConfig } from '@/actions/configs/get-app-config';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Separator,
  Switch,
} from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { OAUTH_LABELS, Provider } from '@/constants/auth';
import { fetcher } from '@/lib/fetcher';
import { capitalize } from '@/lib/utils';

export const AppConfigManager = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const t = useTranslations('owner.configurations.appConfig');
  const tAuth = useTranslations('owner.configurations.appConfig.authSettings');
  const tProviders = useTranslations('owner.configurations.appConfig.authProviders');
  const tFeatures = useTranslations('owner.configurations.appConfig.featureFlags');
  const tCommon = useTranslations('owner.configurations.common');
  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
      setIsLoading(true);

      const response = await fetcher.get('/api/configurations/app-config', {
        responseType: 'json',
      });

      setConfig(response);
    } catch (error) {
      console.error('Failed to fetch app config:', error);
      toast({ title: t('messages.loadError'), isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!config) return;

    try {
      setIsSaving(true);
      await fetcher.patch('/api/configurations/app-config', {
        body: config,
        responseType: 'json',
      });
      toast({ title: t('messages.saveSuccess'), type: 'success' });
    } catch (error) {
      console.error('Failed to save config:', error);
      toast({ title: t('messages.saveError'), isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  const updateAuthConfig = (key: keyof AppConfig['auth'], value: boolean) => {
    if (!config) return;
    setConfig({
      ...config,
      auth: {
        ...config.auth,
        [key]: value,
      },
    });
  };

  const updateAuthProvider = (provider: keyof AppConfig['auth']['providers'], value: boolean) => {
    if (!config) return;
    setConfig({
      ...config,
      auth: {
        ...config.auth,
        providers: {
          ...config.auth.providers,
          [provider]: value,
        },
      },
    });
  };

  const updateFeature = (feature: string, value: boolean) => {
    if (!config) return;
    setConfig({
      ...config,
      features: {
        ...config.features,
        [feature]: value,
      },
    });
  };

  if (isLoading) {
    return (
      <Card className="shadow-none">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <p className="text-sm text-muted-foreground">{tCommon('loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!config) {
    return (
      <Card className="shadow-none">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <p className="text-sm text-destructive">{t('loadError')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2 shrink-0">
            <Save className="h-4 w-4" />
            {isSaving ? tCommon('saving') : tCommon('save')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-medium">{tAuth('title')}</h3>
            <p className="text-sm text-muted-foreground">{tAuth('description')}</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="allowNewUsers">{tAuth('allowNewUsers')}</Label>
                <p className="text-sm text-muted-foreground">{tAuth('allowNewUsersDescription')}</p>
              </div>
              <Switch
                id="allowNewUsers"
                checked={config.auth.allowNewUsers}
                onCheckedChange={(value) => updateAuthConfig('allowNewUsers', value)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="allowNewUserSubscriptions">
                  {tAuth('allowNewUserSubscriptions')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {tAuth('allowNewUserSubscriptionsDescription')}
                </p>
              </div>
              <Switch
                id="allowNewUserSubscriptions"
                checked={config.auth.allowNewUserSubscriptions}
                onCheckedChange={(value) => updateAuthConfig('allowNewUserSubscriptions', value)}
              />
            </div>
          </div>
        </div>
        <Separator />
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-medium">{tProviders('title')}</h3>
            <p className="text-sm text-muted-foreground">{tProviders('description')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(config.auth.providers).map(([provider, enabled]) => {
              const oAuthLabel = OAUTH_LABELS[provider as Provider] ?? capitalize(provider);
              return (
                <div
                  key={provider}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <Label htmlFor={provider} className="cursor-pointer">
                    {oAuthLabel}
                  </Label>
                  <Switch
                    id={provider}
                    checked={enabled}
                    onCheckedChange={(value) =>
                      updateAuthProvider(provider as keyof AppConfig['auth']['providers'], value)
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
        <Separator />
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-medium">{tFeatures('title')}</h3>
            <p className="text-sm text-muted-foreground">{tFeatures('description')}</p>
          </div>
          <div className="space-y-3">
            {Object.entries(config.features).map(([feature, enabled]) => (
              <div
                key={feature}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-0.5">
                  <Label htmlFor={feature} className="capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {feature === 'christmas' && tFeatures('christmas')}
                    {feature === 'testMode' && tFeatures('testMode')}
                  </p>
                </div>
                <Switch
                  id={feature}
                  checked={enabled}
                  onCheckedChange={(value) => updateFeature(feature, value)}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
