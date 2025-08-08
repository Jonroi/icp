import { useState } from 'react';
import { Button } from './button';
import { Bot } from 'lucide-react';
import { ChatPanel } from './chat-panel';

export function FloatingChat() {
  const [open, setOpen] = useState(false);

  return (
    <div className='fixed right-6 bottom-6 z-50'>
      {/* Toggle button */}
      {!open && (
        <Button
          variant='default'
          size='icon'
          className='h-12 w-12 shadow-lg'
          title='Open AI Assistant'
          onClick={() => setOpen(true)}>
          <Bot className='h-5 w-5' />
        </Button>
      )}

      {/* Chat panel */}
      {open && (
        <div className='w-[360px] max-w-[90vw] shadow-2xl border border-zinc-800 bg-zinc-900/95 backdrop-blur rounded-lg overflow-hidden'>
          <ChatPanel onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
