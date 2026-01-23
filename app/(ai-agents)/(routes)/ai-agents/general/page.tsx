import { GlobeIcon, HousePlugIcon, LockKeyholeIcon } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { getAgentsData } from '@/actions/ai/agent/get-agents-data';
import { getCurrentUser } from '@/actions/auth/get-current-user';
import { AgentCard } from '@/components/ai-agents/agent-card/agent-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LIMIT_CONNECTED_AI_AGENTS } from '@/constants/ai/general';
import { getTotalUses } from '@/lib/ai/analytics';

import { Header } from './_components/header';

type GeneralPageProps = {
  searchParams: Promise<{ search?: string; scope?: string }>;
};

const GeneralPage = async (props: GeneralPageProps) => {
  const t = await getTranslations('ai-agents.general');
  const searchParams = await props.searchParams;
  const user = await getCurrentUser();

  const search = searchParams.search ?? '';
  const scope = searchParams.scope === 'mine' ? 'mine' : 'all';

  const { analytics, connectedAgents, defaultAgent, privateOrDraftAgents, publicAgents } =
    await getAgentsData(search);

  const isMine = (agent: (typeof publicAgents)[number]) =>
    Boolean(user?.userId) && agent.user?.id === user?.userId;

  const scopedConnectedAgents = scope === 'mine' ? connectedAgents.filter(isMine) : connectedAgents;
  const scopedDefaultAgent = scope === 'mine' ? null : defaultAgent;
  const scopedPrivateOrDraftAgents = scope === 'mine' ? privateOrDraftAgents : privateOrDraftAgents;
  const scopedPublicAgents = scope === 'mine' ? publicAgents.filter(isMine) : publicAgents;

  const createScopeHref = (nextScope: 'all' | 'mine') => {
    const params = new URLSearchParams();

    if (search) {
      params.set('search', search);
    }

    if (nextScope === 'mine') {
      params.set('scope', nextScope);
    }

    const query = params.toString();
    return query ? `/ai-agents/general?${query}` : '/ai-agents/general';
  };

  const notFoundAgents =
    !scopedConnectedAgents.length &&
    !scopedDefaultAgent &&
    !scopedPrivateOrDraftAgents.length &&
    !scopedPublicAgents.length;

  return (
    <div className="w-full p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-medium sm:text-2xl">{t('title')}</h1>
          <Tabs value={scope}>
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:h-9 sm:inline-flex sm:w-auto sm:grid-cols-none sm:gap-0">
              <TabsTrigger value="all" className="w-full" asChild>
                <Link href={createScopeHref('all')}>{t('scopes.all')}</Link>
              </TabsTrigger>
              <TabsTrigger value="mine" className="w-full" asChild>
                <Link href={createScopeHref('mine')}>{t('scopes.mine')}</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <Header />
      {(scopedDefaultAgent || scopedConnectedAgents.length > 0) && (
        <>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 my-5 sm:my-6">
            <HousePlugIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            <h2 className="text-lg font-semibold sm:text-xl">
              {t('sections.connected')}{' '}
              <span>
                ({scopedConnectedAgents.length}/{LIMIT_CONNECTED_AI_AGENTS})
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
            {scopedDefaultAgent && (
              <AgentCard
                agentId={scopedDefaultAgent.id}
                key={scopedDefaultAgent.id}
                totalUses={getTotalUses(analytics, scopedDefaultAgent.id)}
                {...scopedDefaultAgent}
              />
            )}
            {scopedConnectedAgents.map((agent) => (
              <AgentCard
                agentId={agent.id}
                isConnected
                key={agent.id}
                totalUses={getTotalUses(analytics, agent.id)}
                {...agent}
              />
            ))}
          </div>
        </>
      )}
      {scopedPrivateOrDraftAgents.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-7 mb-4 sm:mt-8">
            <LockKeyholeIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            <h2 className="text-lg font-semibold sm:text-xl">
              {t('sections.private')}{' '}
              {!user?.hasSubscription && (
                <span>
                  ({scopedPrivateOrDraftAgents.length}/{LIMIT_CONNECTED_AI_AGENTS})
                </span>
              )}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
            {scopedPrivateOrDraftAgents.map((agent) => (
              <AgentCard
                agentId={agent.id}
                key={agent.id}
                totalUses={getTotalUses(analytics, agent.id)}
                {...agent}
              />
            ))}
          </div>
        </>
      )}
      {scopedPublicAgents.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-7 mb-4 sm:mt-8">
            <GlobeIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            <h2 className="text-lg font-semibold sm:text-xl">{t('sections.public')}</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
            {scopedPublicAgents.map((agent) => (
              <AgentCard
                agentId={agent.id}
                key={agent.id}
                totalUses={getTotalUses(analytics, agent.id)}
                {...agent}
              />
            ))}
          </div>
        </>
      )}
      {notFoundAgents && (
        <div className="text-center text-sm text-muted-foreground mt-8 sm:mt-10">
          {t('notFound')}
        </div>
      )}
    </div>
  );
};

export default GeneralPage;
