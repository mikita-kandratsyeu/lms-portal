import { AiModelFeature } from '@prisma/client';
import { create } from 'zustand';

import { Conversation } from '@/actions/chat/get-chat-conversations';

type ChatMessages = Record<string, Conversation['messages']>;

export type AttachedFile = {
  key: string;
  name: string;
  url: string;
};

type ChatStore = {
  activeFeature: string;
  attachedFile: AttachedFile | null;
  chatMessages: ChatMessages;
  conversationId: string;
  conversations: Conversation[];
  isFetching: boolean;
  setActiveFeature: (value: string) => void;
  setAttachedFile: (file: AttachedFile | null) => void;
  setChatMessages: (messages: ChatMessages) => void;
  setConversationId: (conversationId: string) => void;
  removeConversation: (id: string) => void;
  setConversations: (conversations: Conversation[]) => void;
  setIsFetching: (value: boolean) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  activeFeature: AiModelFeature.text,
  attachedFile: null,
  chatMessages: {},
  conversationId: '',
  conversations: [],
  isFetching: false,
  setActiveFeature: (value) =>
    set((state) => ({
      activeFeature: state.activeFeature === value ? AiModelFeature.text : value,
    })),
  setAttachedFile: (file) => set({ attachedFile: file }),
  setChatMessages: (messages) => set({ chatMessages: messages }),
  setConversationId: (conversationId) => set({ conversationId }),
  setConversations: (conversations) => set({ conversations }),
  removeConversation: (id) =>
    set((state) => {
      const filteredConversations = state.conversations.filter((c) => c.id !== id);
      const filteredChatMessages = Object.fromEntries(
        Object.entries(state.chatMessages).filter(([key]) => key !== id),
      );
      const nextConversationId =
        state.conversationId === id ? filteredConversations[0]?.id ?? '' : state.conversationId;

      return {
        conversations: filteredConversations,
        conversationId: nextConversationId,
        chatMessages: filteredChatMessages,
      };
    }),
  setIsFetching: (value) => set({ isFetching: value }),
}));
