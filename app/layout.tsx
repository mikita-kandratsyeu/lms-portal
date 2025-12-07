import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import { Noto_Sans } from 'next/font/google';
import { getLocale, getMessages, getTimeZone } from 'next-intl/server';

import { getConnectedAgents } from '@/actions/ai/agent/get-connected-agents';
import { getAppConfig } from '@/actions/configs/get-app-config';
import { getUserSettings } from '@/actions/users/get-user-settings';
import { CookieConsent } from '@/components/common/cookie-consent';
import { TestModeDeclaimer } from '@/components/common/test-mode-declaimer';
import { PLATFORM_DESCRIPTION } from '@/constants/common';
import { cn } from '@/lib/utils';

import { Providers } from './providers';

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
  width: 'device-width',
};

export const metadata: Metadata = {
  title: 'Nova Academy',
  description: PLATFORM_DESCRIPTION,
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_DOMAIN },
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const notoSans = Noto_Sans({ subsets: ['latin'] });

const RootLayout = async ({ children }: RootLayoutProps) => {
  const appConfig = await getAppConfig();
  const userSettings = await getUserSettings();
  const messages = await getMessages();

  const locale = await getLocale();
  const timeZone = await getTimeZone();

  const connectedAgents = await getConnectedAgents();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn('min-h-full bg-background font-sans antialiased', notoSans.className)}>
        <Providers
          appConfig={appConfig}
          connectedAgents={connectedAgents}
          locale={locale}
          messages={messages}
          timeZone={timeZone}
          userSettings={userSettings}
        >
          {appConfig.features.testMode && <TestModeDeclaimer useToast />}
          {children}
          <CookieConsent />
        </Providers>
        {/* Vercel Cloud Tools */}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
