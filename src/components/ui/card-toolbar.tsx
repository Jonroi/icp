import { Button } from './button';
import { HelpCircle, Bot } from 'lucide-react';
import { ChatPanel } from './chat-panel';
import { useState } from 'react';

interface CardToolbarProps {
  tooltip?: string;
  questions?: string[];
}

export function CardToolbar({ tooltip, questions }: CardToolbarProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className='flex items-center gap-2'>
      {tooltip && (
        <Button variant='ghost' size='icon' className='h-8 w-8' title={tooltip}>
          <HelpCircle className='h-4 w-4' />
        </Button>
      )}
      <Button
        variant='ghost'
        size='icon'
        className='h-8 w-8'
        title='Open AI Assistant'
        onClick={() => setIsChatOpen((v) => !v)}>
        <Bot className='h-4 w-4' />
      </Button>

      {isChatOpen && (
        <div className='fixed right-6 bottom-6 z-50 w-[360px] max-w-[90vw] shadow-2xl border border-zinc-800 bg-zinc-900/95 backdrop-blur rounded-lg overflow-hidden'>
          <ChatPanel
            onClose={() => setIsChatOpen(false)}
            suggestions={questions}
          />
        </div>
      )}
    </div>
  );
}
