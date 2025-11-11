import { AgentCard } from '@/components/ai-agents/agent-card/agent-card';

import { AgentFilter } from './_components/agent-filter';

const GeneralPage = async () => {
  return (
    <div className="w-full p-6 space-y-4">
      <h1 className="text-2xl font-medium mb-12">AI Agents</h1>
      <AgentFilter />
      {true && (
        <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
          <AgentCard />
          <AgentCard />
          <AgentCard />
          <AgentCard />
        </div>
      )}
      {false && <div className="text-center text-sm text-muted-foreground mt-10">notFound</div>}
    </div>
  );
};

export default GeneralPage;
