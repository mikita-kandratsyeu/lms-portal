'use client';

import { ChartColumnIcon, PlugIcon } from 'lucide-react';
import Link from 'next/link';

import { TextBadge } from '@/components/common/text-badge';
import { UserHoverCard } from '@/components/common/user-hover-card';
import { Avatar, AvatarFallback, AvatarImage, Button } from '@/components/ui';
import { getFallbackName } from '@/lib/utils';

export const AgentCard = () => {
  return (
    <Link href={'/'} title={'Nova Copilot'}>
      <div className="group hover:shadow-sm transition duration-300 overflow-hidden border rounded-lg p-4 h-full dark:bg-neutral-900 hover:bg-blue-500/10 dark:hover:bg-neutral-900/75 relative">
        <div className="flex space-x-4 items-center mb-4">
          <Avatar className="border dark:border-muted-foreground w-12 h-12">
            <AvatarImage src={''} />
            <AvatarFallback>{getFallbackName('Nova Copilot')}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-2">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-x-2">
                <h4 className="font-semibold">Nova Copilot</h4>
                <TextBadge label={'Draft'} />
              </div>
              <UserHoverCard userId={'8ace3aad-5ad8-482e-9b0a-03175726f8a3'}>
                <button className="flex items-center justify-start gap-x-1 text-neutral-500 p-0 font-normal hover:underline">
                  <span className="text-xs">by Nova Academy</span>
                </button>
              </UserHoverCard>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae perferendis reiciendis
          ducimus explicabo saepe quasi, corporis nostrum ut ipsa dignissimos eos odit vero
          exercitationem itaque qui in quo magnam quod.
        </p>
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
      </div>
    </Link>
  );
};
