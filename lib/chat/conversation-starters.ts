import { ChatConversationStarters } from '@prisma/client';

export const mapConversationStarters = (starters: ChatConversationStarters[] = []) =>
  starters.map((starter) => ({
    id: starter.id,
    language: starter.language || '',
    text: starter.text || '',
  })) || [];

export const getConversationStartersByLanguage = <T extends { language?: string | null }>(
  starters: T[] = [],
  language: string,
) =>
  starters.reduce<T[]>((acc, starter) => {
    if (starter?.language === language) {
      acc.push(starter);
    }
    return acc;
  }, []);
