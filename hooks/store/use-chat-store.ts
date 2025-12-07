import { create } from 'zustand';

import { Conversation } from '@/actions/chat/get-chat-conversations';

type ChatMessages = Record<string, Conversation['messages']>;

type ChatStore = {
  chatMessages: ChatMessages;
  conversationId: string;
  conversations: Conversation[];
  isFetching: boolean;
  setChatMessages: (messages: ChatMessages) => void;
  setConversationId: (conversationId: string) => void;
  setConversations: (conversations: Conversation[]) => void;
  setIsFetching: (value: boolean) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  chatMessages: {},
  conversationId: '',
  conversations: [],
  isFetching: false,
  setChatMessages: (messages) => set({ chatMessages: messages }),
  setConversationId: (conversationId) => set({ conversationId }),
  setConversations: (conversations) => set({ conversations }),
  setIsFetching: (value) => set({ isFetching: value }),
}));
