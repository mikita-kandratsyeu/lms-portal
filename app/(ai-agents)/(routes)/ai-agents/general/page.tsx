import { GlobeIcon, HousePlugIcon, LockKeyholeIcon } from 'lucide-react';

import { getAgentsData } from '@/actions/ai/agent/get-agents-data';
import { AgentCard } from '@/components/ai-agents/agent-card/agent-card';

import { AgentFilter } from './_components/agent-filter';

const GeneralPage = async () => {
  const { connectedAgents, defaultAgent, privateOrDraftAgents, publicAgents } =
    await getAgentsData();

  const notFoundAgents =
    !connectedAgents.length && !defaultAgent && !privateOrDraftAgents && !publicAgents;

  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-medium mb-12">AI agents</h1>
      <AgentFilter />
      {(defaultAgent || connectedAgents.length > 0) && (
        <>
          <div className="flex gap-x-2 items-center my-6">
            <HousePlugIcon className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Connected agents</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
            {defaultAgent && (
              <AgentCard agentId={defaultAgent.id} key={defaultAgent.id} {...defaultAgent} />
            )}
            {connectedAgents.map((agent) => (
              <AgentCard agentId={agent.id} key={agent.id} {...agent} />
            ))}
          </div>
        </>
      )}
      {privateOrDraftAgents.length > 0 && (
        <>
          <div className="flex gap-x-2 items-center mt-8 mb-4">
            <LockKeyholeIcon className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Private agents</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
            {privateOrDraftAgents.map((agent) => (
              <AgentCard agentId={agent.id} key={agent.id} {...agent} />
            ))}
          </div>
        </>
      )}
      {publicAgents.length > 0 && (
        <>
          <div className="flex gap-x-2 items-center mt-8 mb-4">
            <GlobeIcon className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Public agents</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
            {publicAgents.map((agent) => (
              <AgentCard agentId={agent.id} key={agent.id} {...agent} />
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
