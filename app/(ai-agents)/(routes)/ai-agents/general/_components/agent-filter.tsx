'use client';

import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

import { Button, Input } from '@/components/ui';

export const AgentFilter = () => {
  return (
    <div className="flex items-center pb-4 justify-between space-x-2 flex-row gap-y-4">
      <div className="flex gap-x-2 w-full">
        <Input
          placeholder={'AI agents filter...'}
          value={''}
          onChange={(event) => {}}
          className="sm:max-w-sm"
        />
      </div>
      <Link href="/ai-agents/create">
        <Button>
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:flex sm:ml-2">Create Agent</span>
        </Button>
      </Link>
    </div>
  );
};
