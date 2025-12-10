import { notFound } from 'next/navigation';

import { getAgentData } from '@/actions/ai/agent/get-agent-data';

import { Body } from './edit/_components/body/body';
import { Header } from './edit/_components/header/header';

type AgentIdPageProps = { params: Promise<{ agentId: string }> };

const AgentIdPage = async (props: AgentIdPageProps) => {
  const { agentId } = await props.params;
  const { agent } = await getAgentData({ agentId });

  if (!agent) {
    notFound();
  }

  const commonFormProps = {
    agentId,
    initialData: agent,
  };

  return (
    <div className="p-6">
      <Header {...commonFormProps} isPreviewPage />
      <Body {...commonFormProps} isPreviewPage />
    </div>
  );
};

export default AgentIdPage;
