import { GlobeIcon, HousePlugIcon, LockKeyholeIcon } from 'lucide-react';

import { getAgentsData } from '@/actions/ai/agent/get-agents-data';
import { getCurrentUser } from '@/actions/auth/get-current-user';
import { AgentCard } from '@/components/ai-agents/agent-card/agent-card';
import { LIMIT_CONNECTED_AI_AGENTS } from '@/constants/ai/general';
import { getTotalUses } from '@/lib/ai/analytics';

import { Header } from './_components/header';

type GeneralPageProps = {
  searchParams: Promise<{ search: string }>;
};

const GeneralPage = async (props: GeneralPageProps) => {
  const searchParams = await props.searchParams;
  const user = await getCurrentUser();

  const { analytics, connectedAgents, defaultAgent, privateOrDraftAgents, publicAgents } =
    await getAgentsData(searchParams.search);

  const notFoundAgents =
    !connectedAgents.length && !defaultAgent && !privateOrDraftAgents && !publicAgents;

  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-medium mb-12">AI agents</h1>
      <Header />
      {(defaultAgent || connectedAgents.length > 0) && (
        <>
          <div className="flex gap-x-2 items-center my-6">
            <HousePlugIcon className="w-6 h-6" />
            <h2 className="text-xl font-semibold">
              Connected agents{' '}
              <span>
                ({connectedAgents.length}/{LIMIT_CONNECTED_AI_AGENTS})
              </span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
            {defaultAgent && (
              <AgentCard
                agentId={defaultAgent.id}
                key={defaultAgent.id}
                totalUses={getTotalUses(analytics, defaultAgent.id)}
                {...defaultAgent}
              />
            )}
            {connectedAgents.map((agent) => (
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
      {privateOrDraftAgents.length > 0 && (
        <>
          <div className="flex gap-x-2 items-center mt-8 mb-4">
            <LockKeyholeIcon className="w-6 h-6" />
            <h2 className="text-xl font-semibold">
              Private agents{' '}
              {!user?.hasSubscription && (
                <span>
                  ({privateOrDraftAgents.length}/{LIMIT_CONNECTED_AI_AGENTS})
                </span>
              )}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
            {privateOrDraftAgents.map((agent) => (
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
      {publicAgents.length > 0 && (
        <>
          <div className="flex gap-x-2 items-center mt-8 mb-4">
            <GlobeIcon className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Publicly available agents</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
            {publicAgents.map((agent) => (
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
        <div className="text-center text-sm text-muted-foreground mt-10">notFound</div>
      )}
    </div>
  );
};

export default GeneralPage;
