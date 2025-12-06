import { Menu } from 'lucide-react';

import { Conversation } from '@/actions/chat/get-chat-conversations';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import { ChatSideBar } from './chat-sidebar';

type ChatMobileSideBarProps = {
  agentsAmount?: number;
  conversations: Conversation[];
};

export const ChatMobileSideBar = ({ agentsAmount, conversations }: ChatMobileSideBarProps) => {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition duration-300">
        <Menu />
      </SheetTrigger>
      <SheetContent className="p-0 bg-white w-72" side="left">
        <ChatSideBar agentsAmount={agentsAmount} conversations={conversations} />
      </SheetContent>
    </Sheet>
  );
};
