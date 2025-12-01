import { redirect } from 'next/navigation';

import { getAgentData } from '@/actions/ai/agent/get-agent-data';
import { Banner } from '@/components/common/banner';

import { Body } from './_components/body/body';
import { Header } from './_components/header/header';

type AgentIdPageProps = { params: Promise<{ agentId: string }> };

const AgentIdPage = async (props: AgentIdPageProps) => {
  const { agentId } = await props.params;
  const { agent, models } = await getAgentData(agentId);

  if (!agent) {
    redirect('/ai-agents/general');
  }

  const commonFormProps = {
    agentId,
    initialData: agent,
  };

  return (
    <>
      {agent.isDraft && (
        <Banner label="This agent has not been published. It will not be available for you or other members." />
      )}
      <div className="p-6">
        <Header {...commonFormProps} />
        <Body {...commonFormProps} models={models} />
      </div>
    </>
  );
};

export default AgentIdPage;
