'use client';

import { SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Conversation } from '@/actions/chat/get-chat-conversations';
import { ChatSkeleton } from '@/components/loaders/chat-skeleton';
import { useToast } from '@/components/ui/use-toast';
import { ChatCompletionRole } from '@/constants/ai/general';
import { CONVERSATION_ACTION } from '@/constants/chat';
import { useAiAgentStore } from '@/hooks/store/use-ai-agent-store';
import { useChatStore } from '@/hooks/store/use-chat-store';
import { useLocaleStore } from '@/hooks/store/use-locale-store';
import { useHydration } from '@/hooks/use-hydration';
import { getChatMessages } from '@/lib/chat/chat';
import { fetcher } from '@/lib/fetcher';

import { ChatBody } from './chat-body';
import { ChatInput } from './chat-input';
import { ChatSharedTopBar } from './chat-shared-top-bar';
import { ChatTopBar } from './chat-top-bar';

type Message = Conversation['messages'][0];

type ChatProps = {
  conversations?: Conversation[];
  isEmbed?: boolean;
  isShared?: boolean;
};

export const Chat = ({ conversations = [], isEmbed, isShared }: ChatProps) => {
  const { toast } = useToast();

  const { chatMessages, conversationId, setChatMessages, setConversationId, setIsFetching } =
    useChatStore();

  const { currentAgent, currentModel, setCurrentModel } = useAiAgentStore((state) => ({
    currentAgent: state.currentAgent,
    currentModel: state.currentModel,
    setCurrentModel: state.setCurrentModel,
  }));
  const localeInfo = useLocaleStore((state) => state.localeInfo);

  const { isMounted } = useHydration();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [assistantMessage, setAssistantMessage] = useState('');
  const [assistantImage, setAssistantImage] = useState('');

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (conversations.length) {
      const chatMessages = getChatMessages(conversations);

      if (isShared) {
        setConversationId(conversations[0].id);
      }

      // setCurrentModel(currentModel || TEXT_MODELS?.[0]?.value || '');
      // setCurrentModelLabel(currentModelLabel || TEXT_MODELS?.[0]?.label || '');
      setChatMessages(chatMessages);
      // setHasSearch(hasSearch || TEXT_MODELS?.[0]?.hasSearch || false);
    }
  }, [conversations, isEmbed, isShared, setChatMessages, setConversationId, setCurrentModel]);

  const saveLastMessages = useCallback(
    async (
      conversationId: string,
      userMessage: Message,
      assistMessage: Message & { url: string },
    ) => {
      const response = await fetcher.post('/api/chat', {
        body: {
          conversationId,
          image: false
            ? {
                messageId: assistMessage.id,
                model: currentModel?.value,
                revisedPrompt: assistMessage.content,
                url: assistMessage.url,
              }
            : null,
          messages: [userMessage, assistMessage],
          model: currentModel?.value,
        },
        responseType: 'json',
      });

      if (response?.messages) {
        const updatedChatMessages = {
          ...chatMessages,
          [conversationId]: [...chatMessages[conversationId], ...response.messages],
        };

        setAssistantMessage('');
        setAssistantImage('');
        setChatMessages(updatedChatMessages);
      }
    },
    [chatMessages, currentModel, setAssistantMessage, setAssistantImage, setChatMessages],
  );

  const handleSubmit = useCallback(
    async (event: SyntheticEvent, options?: { userMessage?: string }) => {
      event.preventDefault();

      setIsSubmitting(true);
      setIsFetching(true);

      let currentConversationId = conversationId;

      if (!currentConversationId && isEmbed) {
        const newConversation = await fetcher.post(
          `/api/chat/conversations?action=${CONVERSATION_ACTION.NEW}`,
          {
            body: {
              title: currentMessage || options?.userMessage || '',
            },
            responseType: 'json',
          },
        );

        currentConversationId = newConversation?.id;
        setConversationId(newConversation?.id);
      }

      const messages = chatMessages[currentConversationId] ?? [];

      const currentUserMessage = {
        content: currentMessage || options?.userMessage || '',
        id: uuidv4(),
        role: ChatCompletionRole.USER,
      } as Message;

      const currentAssistantMessage = {
        content: options?.userMessage ? '' : assistantMessage,
        id: uuidv4(),
        role: ChatCompletionRole.ASSISTANT,
      } as Message;

      const messagesForApi = [currentAssistantMessage, currentUserMessage].filter(
        (message) => message.content.length,
      );

      if (!messagesForApi.length) {
        return;
      }

      const updatedChatMessages = {
        ...chatMessages,
        [currentConversationId]: [...messages, ...messagesForApi],
      };

      setChatMessages(updatedChatMessages);

      setAssistantMessage('');
      setCurrentMessage('');

      let streamAssistMessage = '';
      let streamAssistImage = '';

      try {
        if (false) {
          const imageGeneration = await fetcher.post('api/ai/image', {
            responseType: 'json',
            body: {
              agentId: currentAgent?.id,
              modelId: currentModel?.id,
              prompt: currentMessage,
            },
            cache: 'no-cache',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          streamAssistMessage = imageGeneration.revisedPrompt;
          streamAssistImage = imageGeneration.url;

          setAssistantMessage(imageGeneration.revisedPrompt);
          setAssistantImage(imageGeneration.url);
        } else {
          abortControllerRef.current = new AbortController();
          const signal = abortControllerRef.current.signal;

          const completionStream = await fetcher.post('/api/ai/completions', {
            body: {
              input: [...messages, ...messagesForApi].map(({ content, role }) => ({
                content,
                role,
              })),
              agentId: currentAgent?.id,
              instructions: currentAgent?.systemInstruction,
              isSearch: false,
              localeInfo,
              modelId: currentModel?.id,
              stream: true,
              temperature: currentAgent?.temperature,
            },
            cache: 'no-cache',
            headers: {
              'Content-Type': 'application/json',
            },
            signal,
          });

          const reader = completionStream.body?.getReader();
          const decoder = new TextDecoder('utf-8');

          while (true) {
            const rawChunk = await reader?.read();

            if (!rawChunk) {
              throw new Error('Unable to process chunk');
            }

            const { done, value } = rawChunk;

            if (done) {
              break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter((line) => line.trim());

            const isDataDelta = lines.some((line) => line.startsWith('data: '));

            if (isDataDelta) {
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = JSON.parse(line.slice(6));

                  streamAssistMessage += data.delta;
                  setAssistantMessage((prev) => prev + data.delta);
                }
              }
            } else {
              streamAssistMessage += chunk;
              setAssistantMessage((prev) => prev + chunk);
            }
          }
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          toast({
            description: String(error?.message),
            isError: true,
          });
        }
      } finally {
        saveLastMessages(currentConversationId, currentUserMessage, {
          content: streamAssistMessage,
          id: uuidv4(),
          role: ChatCompletionRole.ASSISTANT,
          url: streamAssistImage,
        } as Message & { url: string });

        setIsSubmitting(false);
        setIsFetching(false);
      }
    },
    [
      assistantMessage,
      chatMessages,
      conversationId,
      currentAgent?.id,
      currentMessage,
      currentModel?.id,
      isEmbed,
      localeInfo,
      saveLastMessages,
      setChatMessages,
      setConversationId,
      setIsFetching,
      toast,
    ],
  );

  const handleAbortGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  if (!isMounted) {
    return <ChatSkeleton />;
  }

  return (
    <div className="flex h-full w-full">
      <div className="flex h-full w-full flex-col overflow-hidden bg-background outline-none">
        <div className="flex h-full w-full flex-col">
          {isShared && (
            <ChatSharedTopBar
              expiredAt={conversations?.[0]?.shared?.expiredAt}
              title={conversations?.[0]?.title}
            />
          )}
          {!isShared && <ChatTopBar isEmbed={isEmbed} />}
          <ChatBody
            assistantImage={assistantImage}
            assistantMessage={assistantMessage}
            isShared={isShared}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            sharedName={conversations?.[0]?.shared?.username}
            sharedPicture={conversations?.[0]?.shared?.pictureUrl}
          />
          {!isShared && (
            <ChatInput
              currenMessage={currentMessage}
              isSubmitting={isSubmitting}
              onAbortGenerating={handleAbortGenerating}
              onSubmit={handleSubmit}
              setCurrentMessage={setCurrentMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
};
