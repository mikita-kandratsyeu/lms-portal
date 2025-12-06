'use client';

import { AiAgent, AiModel } from '@prisma/client';
import { ChartColumnIcon, PlugIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SyntheticEvent, useState } from 'react';

import { TextBadge } from '@/components/common/text-badge';
import { UserHoverCard } from '@/components/common/user-hover-card';
import { Avatar, AvatarFallback, AvatarImage, Button } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { AGENT_ACTION } from '@/constants/ai/general';
import { fetcher } from '@/lib/fetcher';
import { cn, getFallbackName } from '@/lib/utils';

import { AgentFeatures } from './agent-features';

type AgentCardProps = Partial<
  Pick<
    AiAgent,
    | 'description'
    | 'isDefault'
    | 'isDraft'
    | 'isPublic'
    | 'isSystem'
    | 'language'
    | 'name'
    | 'pictureUrl'
  >
> & {
  agentId?: string;
  aiModels?: AiModel[];
  isConnected?: boolean;
  isEdit?: boolean;
  totalUses?: number;
  user?: { id?: string | null; name?: string | null } | null;
};

export const AgentCard = ({
  agentId,
  aiModels = [],
  description,
  isConnected,
  isDefault,
  isDraft,
  isEdit,
  isPublic,
  isSystem,
  name,
  pictureUrl,
  totalUses,
  user,
}: AgentCardProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const [isFetching, setIsFetching] = useState(false);

  const handleConnection = async (event: SyntheticEvent) => {
    event.preventDefault();

    setIsFetching(true);

    try {
      await fetcher.post(`/api/ai/agents/${agentId}/connection`, {
        body: { action: isConnected ? AGENT_ACTION.DISCONNECT : AGENT_ACTION.CONNECT },
      });

      toast({
        title: `${name} Agent has been ${isConnected ? 'disconnected' : 'connected'}.`,
        type: isConnected ? 'warning' : 'success',
      });

      router.refresh();
    } catch (error) {
      console.error('[AGENT_CONNECTION]', error);

      toast({ isError: true, description: (error as Error)?.message });
    } finally {
      setIsFetching(false);
    }
  };

  const content = (
    <div
      className={cn(
        'group overflow-hidden rounded-lg h-full dark:bg-neutral-900 relative',
        !isEdit &&
          'border p-4 hover:shadow-sm transition duration-300 hover:bg-blue-500/10 dark:hover:bg-neutral-900/75',
      )}
    >
      <div className="flex flex-col justify-between h-full">
        <div>
          <div className="flex space-x-4 items-center mb-4">
            <Avatar className="border dark:border-muted-foreground w-12 h-12">
              <AvatarImage src={pictureUrl || ''} />
              <AvatarFallback>{getFallbackName(name || '')}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-2">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-x-2">
                  <h4 className="font-semibold">{name}</h4>
                  {isDraft && <TextBadge label={'Draft'} />}
                  {isDefault && <TextBadge label={'Default'} />}
                  {!isPublic && !isDraft && <TextBadge label={'Private'} variant="indigo" />}
                  {isPublic && <TextBadge label={'Public'} variant="lime" />}
                </div>
                {user?.id && user?.name && (
                  <UserHoverCard userId={user.id} isDisabledHover={Boolean(isSystem)}>
                    <button className="flex items-center justify-start gap-x-1 text-muted-foreground p-0 font-normal hover:underline">
                      <span className="text-xs">{`by ${isSystem ? 'System' : user.name}`}</span>
                    </button>
                  </UserHoverCard>
                )}
              </div>
            </div>
          </div>
          <p className={cn('text-sm text-muted-foreground', !isEdit && 'line-clamp-2')}>
            {description}
          </p>
          {!isEdit && <AgentFeatures className="mt-4 mb-8" models={aiModels} />}
        </div>
        {!isEdit && (
          <div>
            <div className="flex justify-between items-center gap-x-4">
              <Button
                disabled={Boolean(isDefault) || isFetching || Boolean(isDraft)}
                isLoading={isFetching}
                onClick={handleConnection}
                size="sm"
                type="button"
                variant="outline"
              >
                {!isFetching && <PlugIcon className="w-4 h-4 mr-2" />}
                <span>{isConnected || isDefault ? 'Disconnect' : 'Connect'}</span>
              </Button>
              {!isDraft && Boolean(totalUses) && (
                <div className="flex gap-x-1 items-center text-muted-foreground">
                  <ChartColumnIcon className="w-4 h-4" />
                  <span className="text-xs">{totalUses} total uses</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return isEdit ? (
    content
  ) : (
    <Link href={`/ai-agents/general/${agentId}`} title={name}>
      {content}
    </Link>
  );
};
