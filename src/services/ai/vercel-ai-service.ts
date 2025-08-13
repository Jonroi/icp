import { useChat, type Message } from 'ai/react';

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface UseChatOptions {
  initialMessages?: ChatMessage[];
  systemMessage?: string;
  onError?: (error: Error) => void;
  onMessageReceived?: (message: string) => void;
  initialAssistantMessage?: string;
}

export function useVercelAI(options: UseChatOptions = {}) {
  const {
    initialMessages = [],
    systemMessage,
    onError,
    onMessageReceived,
    initialAssistantMessage,
  } = options;

  const mergedInitialMessages: Message[] = [
    ...(systemMessage
      ? [{ id: 'system', role: 'system' as const, content: systemMessage }]
      : []),
    ...(initialAssistantMessage
      ? [
          {
            id: 'initial',
            role: 'assistant' as const,
            content: initialAssistantMessage,
          },
        ]
      : []),
    ...initialMessages,
  ];

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append,
  } = useChat({
    api: '/api/chat',
    initialMessages: mergedInitialMessages,
    onError(error) {
      onError?.(error);
    },
    onFinish(message) {
      onMessageReceived?.(message.content);
    },
  });

  return {
    messages: messages.filter((m) => m.role !== 'system') as ChatMessage[],
    input,
    handleInputChange,
    handleSubmit,
    append,
    isLoading,
    error,
  };
}
