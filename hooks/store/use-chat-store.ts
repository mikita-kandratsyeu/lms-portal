import { AiModelFeature } from '@prisma/client';
import { create } from 'zustand';

import { Conversation } from '@/actions/chat/get-chat-conversations';

type ChatMessages = Record<string, Conversation['messages']>;

type ChatStore = {
  activeFeature: string;
  chatMessages: ChatMessages;
  conversationId: string;
  conversations: Conversation[];
  isFetching: boolean;
  setActiveFeature: (value: string) => void;
  setChatMessages: (messages: ChatMessages) => void;
  setConversationId: (conversationId: string) => void;
  setConversations: (conversations: Conversation[]) => void;
  setIsFetching: (value: boolean) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  activeFeature: AiModelFeature.text,
  chatMessages: {},
  conversationId: '',
  conversations: [],
  isFetching: false,
  setActiveFeature: (value) =>
    set((state) => ({
      activeFeature: state.activeFeature === value ? AiModelFeature.text : value,
    })),
  setChatMessages: (messages) => set({ chatMessages: messages }),
  setConversationId: (conversationId) => set({ conversationId }),
  setConversations: (conversations) => set({ conversations }),
  setIsFetching: (value) => set({ isFetching: value }),
}));
