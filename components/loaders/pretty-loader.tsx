'use client';

import { Baloo_2 } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Logo } from '../common/logo';

const baloo2 = Baloo_2({ subsets: ['latin'], weight: ['400', '500'] });

type PrettyLoaderProps = {
  isCopilot?: boolean;
};

export const PrettyLoader = ({ isCopilot = false }: PrettyLoaderProps) => {
  const t = useTranslations('app');
  const pathname = usePathname();

  const isChatPage = pathname?.startsWith('/chat');
  const isAiAgentsPage = pathname?.startsWith('/ai-agents');

  const isCopilotFlow = isChatPage || isAiAgentsPage || isCopilot;

  return (
    <div className="w-full h-full flex items-center justify-center gap-2">
      <Logo onlyLogoIcon isLoader isCopilot={isCopilotFlow} />
      <div className={baloo2.className}>
        <div className="flex items-center gap-2">
          <p className="font-semibold text-base text-neutral-700 dark:text-neutral-300">
            {isCopilotFlow ? 'Nova Copilot' : t('name')}
          </p>
          <div className="flex">
            <span className="w-1 h-1 mr-1 rounded-full bg-neutral-400 inline-block animate-flash"></span>
            <span className="w-1 h-1 mr-1 rounded-full bg-neutral-400 inline-block animate-flash [animation-delay:0.2s]"></span>
            <span className="w-1 h-1 mr-1 rounded-full bg-neutral-400 inline-block animate-flash [animation-delay:0.4s]"></span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {t(isCopilotFlow ? 'description-ai' : 'description')}
        </p>
      </div>
    </div>
  );
};
