import { useState } from 'react';
import { Bot } from 'lucide-react';
import { Button } from './button';
import { SpecializedChat } from './specialized-chat';
import { AI_ASSISTANTS } from './ai-assistants-config';

interface AIAssistantButtonProps {
  assistantType: keyof typeof AI_ASSISTANTS;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export function AIAssistantButton({
  assistantType,
  variant = 'default',
  size = 'sm',
  className = '',
  children,
}: AIAssistantButtonProps) {
  const [showAssistant, setShowAssistant] = useState(false);
  const assistant = AI_ASSISTANTS[assistantType];

  if (!assistant) {
    console.error(`Assistant type "${assistantType}" not found`);
    return null;
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowAssistant(true)}
        className={`flex items-center gap-2 shadow-lg ${className}`}>
        <Bot className='h-4 w-4' />
        {children || `AI Assistant`}
      </Button>

      {showAssistant && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='w-[600px] max-w-[90vw] h-[600px] max-h-[90vh]'>
            <SpecializedChat
              title={assistant.title}
              instructions={assistant.instructions}
              suggestions={assistant.suggestions}
              placeholder={assistant.placeholder}
              onClose={() => setShowAssistant(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
