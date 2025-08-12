import { useState, type KeyboardEvent } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { OllamaClient } from '@/services/ai';
import { Button } from './button';

interface SpecializedChatProps {
  onClose?: () => void;
  title: string;
  instructions: string;
  suggestions: string[];
  placeholder?: string;
}

type ChatRole = 'system' | 'user' | 'assistant';

interface ChatEntry {
  role: ChatRole;
  content: string;
}

export function SpecializedChat({
  onClose,
  title,
  instructions,
  suggestions,
  placeholder = 'Ask a question...',
}: SpecializedChatProps) {
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      role: 'system',
      content: instructions,
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isSending) return;

    const nextMessages: ChatEntry[] = [
      ...messages,
      { role: 'user', content: trimmed },
    ];

    setMessages(nextMessages);
    setInput('');
    setIsSending(true);
    setError(null);

    try {
      const client = OllamaClient.getInstance();

      // Build conversation context for Ollama
      const conversationContext = nextMessages
        .filter((m) => m.role !== 'system')
        .map(
          (m) => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`,
        )
        .join('\n');

      const prompt = `${instructions}

Conversation:
${conversationContext}

Please provide a helpful response:`;

      const assistantReply = await client.generateResponse(prompt);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: assistantReply },
      ]);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      setError(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = async () => {
    await sendMessage(input);
  };

  const handleTextareaKeyDown = (
    e: KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
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
              onClick={() => void sendMessage(q)}
              disabled={isSending}
              title={q}>
              {q}
            </Button>
          ))}
        </div>
      )}

      <div className='flex-1 overflow-y-auto px-3 py-3 space-y-3'>
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
            {error}
          </div>
        )}
      </div>

      <div className='border-t border-zinc-800 p-2'>
        <div className='flex items-end gap-2'>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder={placeholder}
            rows={2}
            className='flex-1 resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary'
            disabled={isSending}
          />
          <Button
            onClick={handleSend}
            disabled={isSending || input.trim().length === 0}
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
