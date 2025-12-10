import { Conversation } from '@/actions/chat/get-chat-conversations';

import { getRandomInt } from '../utils';

export const getChatMessages = (conversations: Conversation[]) =>
  conversations.reduce<Record<string, Conversation['messages']>>((acc, conversation) => {
    acc[conversation.id] = conversation.messages;

    return acc;
  }, {});

export const generateConversationTitle = () => {
  const words = [
    'Epic',
    'Quest',
    'Mystery',
    'Adventure',
    'Journey',
    'Legend',
    'Saga',
    'Fable',
    'Chronicle',
    'Odyssey',
    'Tale',
    'Story',
    'Secret',
    'Kingdom',
    'Empire',
    'Whisper',
    'Shadow',
    'Hero',
    'Crown',
    'Sword',
    'Castle',
    'Dream',
    'Fantasy',
  ];

  const titleLength = getRandomInt(1, 3);
  let title = '';

  for (let i = 0; i < titleLength; i++) {
    const randomIndex = getRandomInt(1, words.length - 1);
    title += words[randomIndex] + ' ';
  }

  return title.trim();
};
