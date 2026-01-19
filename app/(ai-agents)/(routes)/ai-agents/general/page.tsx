import { GlobeIcon, HousePlugIcon, LockKeyholeIcon } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { getAgentsData } from '@/actions/ai/agent/get-agents-data';
import { getCurrentUser } from '@/actions/auth/get-current-user';
import { AgentCard } from '@/components/ai-agents/agent-card/agent-card';
import { ButtonGroup, buttonVariants } from '@/components/ui';
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
    <div className="w-full p-6">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-2xl font-medium">{t('title')}</h1>
        <ButtonGroup>
          <Link
            className={buttonVariants({ variant: scope === 'all' ? 'default' : 'outline' })}
            href={createScopeHref('all')}
          >
            {t('scopes.all')}
          </Link>
          <Link
            className={buttonVariants({ variant: scope === 'mine' ? 'default' : 'outline' })}
            href={createScopeHref('mine')}
          >
            {t('scopes.mine')}
          </Link>
        </ButtonGroup>
      </div>
      <Header />
      {(scopedDefaultAgent || scopedConnectedAgents.length > 0) && (
        <>
          <div className="flex gap-x-2 items-center my-6">
            <HousePlugIcon className="w-6 h-6" />
            <h2 className="text-xl font-semibold">
              {t('sections.connected')}{' '}
              <span>
                ({scopedConnectedAgents.length}/{LIMIT_CONNECTED_AI_AGENTS})
              </span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
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
          <div className="flex gap-x-2 items-center mt-8 mb-4">
            <LockKeyholeIcon className="w-6 h-6" />
            <h2 className="text-xl font-semibold">
              {t('sections.private')}{' '}
              {!user?.hasSubscription && (
                <span>
                  ({scopedPrivateOrDraftAgents.length}/{LIMIT_CONNECTED_AI_AGENTS})
                </span>
              )}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
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
          <div className="flex gap-x-2 items-center mt-8 mb-4">
            <GlobeIcon className="w-6 h-6" />
            <h2 className="text-xl font-semibold">{t('sections.public')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
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
        <div className="text-center text-sm text-muted-foreground mt-10">{t('notFound')}</div>
      )}
    </div>
  );
};

export default GeneralPage;
