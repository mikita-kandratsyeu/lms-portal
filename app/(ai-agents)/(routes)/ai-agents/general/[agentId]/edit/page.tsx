import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getAgentData } from '@/actions/ai/agent/get-agent-data';
import { getCurrentUser } from '@/actions/auth/get-current-user';
import { Banner } from '@/components/common/banner';

import { Body } from './_components/body/body';
import { Header } from './_components/header/header';

type AgentIdPageProps = { params: Promise<{ agentId: string }> };

const AgentIdPage = async (props: AgentIdPageProps) => {
  const t = await getTranslations('ai-agents.edit');
  const user = await getCurrentUser();

  const { agentId } = await props.params;
  const { agent, models } = await getAgentData({
    agentId,
    includeAllModels: true,
    userId: user?.userId,
  });

  if (!agent) {
    notFound();
  }

  const commonFormProps = {
    agentId,
    initialData: agent,
  };

  return (
    <>
      {agent.isDraft && <Banner label={t('draftBanner')} />}
      <div className="p-6">
        <Header {...commonFormProps} />
        <Body {...commonFormProps} models={models} />
      </div>
    </>
  );
};

export default AgentIdPage;
