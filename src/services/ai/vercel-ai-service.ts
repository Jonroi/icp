import { useState, useCallback, useMemo } from 'react';

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
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialAssistantMessage) {
      return [
        {
          id: 'initial',
          role: 'assistant',
          content: initialAssistantMessage,
        },
      ];
    }
    return initialMessages;
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Add system message if provided
  const allMessages = useMemo(
    () =>
      systemMessage
        ? [
            { id: 'system', role: 'system' as const, content: systemMessage },
            ...messages,
          ]
        : messages,
    [systemMessage, messages],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: input.trim(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: allMessages.concat(userMessage),
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Call the callback with the assistant's message
        onMessageReceived?.(assistantMessage.content);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, allMessages, onError, onMessageReceived],
  );

  return {
    messages: messages.filter((m) => m.role !== 'system'),
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  };
}
