import { type KeyboardEvent, useRef, useEffect } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { Button } from './button';
import { useVercelAI } from '@/services/ai/vercel-ai-service';
import type { ChatMessage } from '@/services/ai/vercel-ai-service';

interface SpecializedChatProps {
  onClose?: () => void;
  title: string;
  instructions: string;
  suggestions: string[];
  placeholder?: string;
  onMessageReceived?: (message: string) => void;
  initialMessage?: string;
}

export function SpecializedChat({
  onClose,
  title,
  instructions,
  suggestions,
  placeholder = 'Ask a question...',
  onMessageReceived,
  initialMessage,
}: SpecializedChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useVercelAI({
      systemMessage: instructions,
      onError: (error) => {
        console.error('Specialized chat error:', error);
      },
      onMessageReceived,
      initialAssistantMessage: initialMessage,
    });

  // Keep input focused throughout the conversation
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keep input focused after messages are added
  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleSubmit(e);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    // Set the input to the suggestion and immediately send it
    handleInputChange({
      target: { value: suggestion },
    } as React.ChangeEvent<HTMLTextAreaElement>);

    // Create a fake form event and submit immediately
    const fakeEvent = {
      preventDefault: () => {},
    } as React.FormEvent;

    // Send the message immediately
    handleSubmit(fakeEvent);
  };

  const handleTextareaKeyDown = (
    e: KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    }
  };

  return (
    <div className='flex h-[520px] w-full flex-col bg-zinc-900/95 text-zinc-100'>
      <div className='flex items-center justify-between border-b border-zinc-800 px-3 py-2'>
        <div className='flex items-center gap-2 text-sm font-medium text-zinc-200'>
          <Bot className='h-4 w-4 text-primary' /> {title}
        </div>
        <Button variant='ghost' size='icon' onClick={onClose} title='Close'>
          <X className='h-4 w-4' />
        </Button>
      </div>

      {Array.isArray(suggestions) && suggestions.length > 0 && (
        <div className='flex flex-wrap gap-2 border-b border-zinc-800 px-3 py-2'>
          {suggestions.map((q, idx) => (
            <Button
              key={idx}
              size='sm'
              variant='outline'
              className='text-xs'
              onClick={() => handleSuggestionClick(q)}
              disabled={isLoading}
              title={q}>
              {isLoading ? 'Sending...' : q}
            </Button>
          ))}
        </div>
      )}

      <div className='flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800'>
        {messages
          .filter((m) => m.role !== 'system')
          .map((m, idx) => (
            <div
              key={idx}
              className={
                m.role === 'user'
                  ? 'ml-auto max-w-[80%] rounded-lg bg-primary/10 px-3 py-2 text-sm'
                  : 'mr-auto max-w-[80%] rounded-lg bg-zinc-800 px-3 py-2 text-sm'
              }>
              {m.content}
            </div>
          ))}
        {error && (
          <div className='mr-auto max-w-[80%] rounded-lg border border-red-600 bg-red-950/40 px-3 py-2 text-sm text-red-200'>
            {error.message}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className='border-t border-zinc-800 p-2'>
        <div className='flex items-end gap-2'>
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleTextareaKeyDown}
            placeholder={placeholder}
            rows={2}
            className='flex-1 resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary'
            disabled={isLoading}
            autoFocus
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || input.trim().length === 0}
            title='Send'>
            <Send className='h-4 w-4' />
          </Button>
        </div>
        <div className='mt-1 px-1 text-xs text-zinc-500'>
          Specialized assistant - Powered by local Ollama AI
        </div>
      </div>
    </div>
  );
}
