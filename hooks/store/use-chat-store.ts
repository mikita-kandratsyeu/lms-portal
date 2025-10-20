import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Conversation } from '@/actions/chat/get-chat-conversations';

type ChatMessages = Record<string, Conversation['messages']>;

type ChatStore = {
  chatMessages: ChatMessages;
  conversationId: string;
  currentModelLabel: string; // delete
  hasSearch: boolean; // delete
  isFetching: boolean;
  isImageGeneration?: boolean; // delete
  isSearchMode: boolean; // delete
  setChatMessages: (messages: ChatMessages) => void;
  setConversationId: (conversationId: string) => void;
  setCurrentModelLabel: (label: string) => void; // delete
  setHasSearch: (value: boolean) => void; // delete
  setIsFetching: (value: boolean) => void;
  setIsImageGeneration: (value: boolean) => void; // delete
  setIsSearchMode: (value: boolean) => void; // delete
};

export const useChatStore = create<ChatStore, any>(
  persist(
    (set) => ({
      chatMessages: {},
      conversationId: '',
      currentModelLabel: '',
      hasSearch: false,
      isFetching: false,
      isImageGeneration: false,
      isSearchMode: false,
      setChatMessages: (messages) => set({ chatMessages: messages }),
      setConversationId: (conversationId) => set({ conversationId }),
      setCurrentModelLabel: (label) => set({ currentModelLabel: label }),
      setHasSearch: (value) => set({ hasSearch: value }),
      setIsFetching: (value) => set({ isFetching: value }),
      setIsImageGeneration: (value) => set({ isImageGeneration: value }),
      setIsSearchMode: (value) => set({ isSearchMode: value }),
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        currentModelLabel: state.currentModelLabel,
        hasSearch: state.hasSearch,
      }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
