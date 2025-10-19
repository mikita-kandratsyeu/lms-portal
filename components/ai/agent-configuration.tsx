'use client';

import { X } from 'lucide-react';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { Button } from '../ui';
import { AiModelSwitcher } from './ai-model-switcher';

type AgentConfigurationProps = {
  children: React.ReactNode;
};

export const AgentConfiguration = ({ children }: AgentConfigurationProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="rightCopilot">
        <SheetHeader>
          <SheetTitle>
            <div className="flex justify-between items-center">
              <h2>General</h2>
              <SheetClose asChild>
                <Button variant="outline">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="h-full">
          <div className="flex flex-col gap-y-4 mt-4">
            <div className="flex flex-col gap-y-2">
              <h4 className="text-sm text-muted-foreground">Primary LLM Engine</h4>
              <AiModelSwitcher className="flex items-center w-full gap-x-2" />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
