import { GlobeIcon, HousePlugIcon, LockKeyholeIcon } from 'lucide-react';

import { AgentCard } from '@/components/ai-agents/agent-card/agent-card';

import { AgentFilter } from './_components/agent-filter';

const GeneralPage = async () => {
  return (
    <div className="w-full p-6 space-y-4">
      <h1 className="text-2xl font-medium mb-12">AI agents</h1>
      <AgentFilter />

      <div className="flex gap-x-2 items-center mb-4">
        <HousePlugIcon className="w-6 h-6" />
        <h2 className="text-xl font-semibold">Connected agents</h2>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
        <AgentCard />
        <AgentCard />
        <AgentCard />
        <AgentCard />
      </div>

      <div className="flex gap-x-2 items-center mb-4 mt-8">
        <LockKeyholeIcon className="w-6 h-6" />
        <h2 className="text-xl font-semibold">Private agents</h2>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
        <AgentCard />
        <AgentCard />
        <AgentCard />
        <AgentCard />
      </div>

      <div className="flex gap-x-2 items-center mb-4 mt-8">
        <GlobeIcon className="w-6 h-6" />
        <h2 className="text-xl font-semibold">Public agents</h2>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
        <AgentCard />
        <AgentCard />
        <AgentCard />
        <AgentCard />
      </div>

      {false && <div className="text-center text-sm text-muted-foreground mt-10">notFound</div>}
    </div>
  );
};

export default GeneralPage;
