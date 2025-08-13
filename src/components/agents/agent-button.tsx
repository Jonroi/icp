import { useState } from 'react';
import { Bot } from 'lucide-react';
import { Button } from '../ui/button';
import { AgentChat } from './agent-chat';
import { agentManager } from './agent-manager';
import type { OwnCompany } from '@/services/project-service';

interface AgentButtonProps {
  agentId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  context?: any;
  onFormUpdate?: (field: keyof OwnCompany, value: string) => void;
  onToolExecuted?: (toolName: string, result: any) => void;
}

export function AgentButton({
  agentId,
  variant = 'default',
  size = 'sm',
  className = '',
  children,
  context,
  onFormUpdate,
  onToolExecuted,
}: AgentButtonProps) {
  const [showAgent, setShowAgent] = useState(false);
  const agent = agentManager.getAgent(agentId);

  console.log('Agent button render:', {
    agentId,
    agent: agent?.name,
    showAgent,
  });

  if (!agent) {
    console.error(`Agent "${agentId}" not found in agent manager`);
    console.log(
      'Available agents:',
      agentManager.getAllAgents().map((a) => a.id),
    );
    return null;
  }

  const handleMessageReceived = (message: string) => {
    // Parse AI form field updates and apply them to form for company profile agent
    if (agentId === 'company-profile-agent' && onFormUpdate) {
      const fillFields = message.match(
        /FILL_FIELD:\s*(\w+)\s*=\s*(.+?)(?:\n|$)/g,
      );

      if (fillFields) {
        fillFields.forEach((fillField) => {
          const match = fillField.match(
            /FILL_FIELD:\s*(\w+)\s*=\s*(.+?)(?:\n|$)/,
          );
          if (match) {
            const [, field, value] = match;
            const fieldKey = field as keyof OwnCompany;
            console.log('Filling form field:', fieldKey, '=', value.trim());
            onFormUpdate(fieldKey, value.trim());
          }
        });
      }
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowAgent(true)}
        className={`flex items-center gap-2 shadow-lg ${className}`}>
        <Bot className='h-4 w-4' />
        {children || agent.name}
      </Button>

      {showAgent && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='w-[800px] max-w-[95vw] h-[700px] max-h-[95vh]'>
            <AgentChat
              agentId={agentId}
              onClose={() => setShowAgent(false)}
              onMessageReceived={handleMessageReceived}
              onToolExecuted={onToolExecuted}
              context={context}
              initialMessage={
                agentId === 'company-profile-agent'
                  ? `Hi! I'm your ${agent.name}. I'll help you fill out your company information step by step. What's your company name?`
                  : undefined
              }
            />
          </div>
        </div>
      )}
    </>
  );
}
