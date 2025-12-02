'use client';

import { ChartColumnIcon, PlugIcon } from 'lucide-react';
import Link from 'next/link';

import { TextBadge } from '@/components/common/text-badge';
import { UserHoverCard } from '@/components/common/user-hover-card';
import { Avatar, AvatarFallback, AvatarImage, Button } from '@/components/ui';
import { cn, getFallbackName } from '@/lib/utils';

type AgentCardProps = {
  description?: string | null;
  isDraft?: boolean;
  isEdit?: boolean;
  isPublic?: boolean;
  name: string;
  pictureUrl?: string | null;
  user: { userId?: string | null; name?: string | null };
};

export const AgentCard = ({
  description,
  isDraft,
  isEdit,
  isPublic,
  name,
  pictureUrl,
  user,
}: AgentCardProps) => {
  const content = (
    <div
      className={cn(
        'group hover:shadow-sm transition duration-300 overflow-hidden rounded-lg h-full dark:bg-neutral-900 hover:bg-blue-500/10 dark:hover:bg-neutral-900/75 relative',
        !isEdit && 'border p-4',
      )}
    >
      <div className="flex space-x-4 items-center mb-4">
        <Avatar className="border dark:border-muted-foreground w-12 h-12">
          <AvatarImage src={pictureUrl || ''} />
          <AvatarFallback>{getFallbackName(name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col space-y-2">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-x-2">
              <h4 className="font-semibold">{name}</h4>
              {isDraft && <TextBadge label={'Draft'} />}
              {isEdit && isPublic && <TextBadge label={'Public'} variant="lime" />}
              {isEdit && !isPublic && !isDraft && <TextBadge label={'Private'} variant="indigo" />}
            </div>
            {user?.userId && user?.name && (
              <UserHoverCard userId={user.userId}>
                <button className="flex items-center justify-start gap-x-1 text-neutral-500 p-0 font-normal hover:underline">
                  <span className="text-xs">{`by ${user.name}`}</span>
                </button>
              </UserHoverCard>
            )}
          </div>
        </div>
      </div>
      <p className={cn('text-sm text-muted-foreground', !isEdit && 'line-clamp-2')}>
        {description}
      </p>
      {!isEdit && (
        <>
          <div className="flex my-4 gap-x-2 line-clamp-1">
            <TextBadge label={'Text'} variant="indigo" />
            <TextBadge label={'Search'} variant="green" />
            <TextBadge label={'Reasoning'} variant="lime" />
          </div>
          <div className="flex justify-between items-center gap-x-4">
            <Button variant="outline" size="sm">
              <PlugIcon className="w-4 h-4 mr-2" />
              <span>Connect</span>
            </Button>
            <div className="flex gap-x-2 items-center text-muted-foreground">
              <ChartColumnIcon className="w-4 h-4" />
              <span className="text-xs">123 total uses</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
  return isEdit ? (
    content
  ) : (
    <Link href={'/'} title={'Nova Copilot'}>
      {content}
    </Link>
  );
};
