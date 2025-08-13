import { useState, useEffect, useCallback } from 'react';
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
  const [currentData, setCurrentData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const agent = agentManager.getAgent(agentId);

  console.log('Agent button render:', {
    agentId,
    agent: agent?.name,
    showAgent,
  });

  const loadCurrentData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const result = await agentManager.executeTool(
        agentId,
        'get_current_form_data',
        {},
      );
      setCurrentData(result);
      console.log('Loaded current data:', result);
    } catch (error) {
      console.error('Error loading current data:', error);
      setCurrentData(null);
    } finally {
      setIsLoadingData(false);
    }
  }, [agentId]);

  // Open chat after ensuring current data is loaded (for company profile agent)
  const openChat = useCallback(async () => {
    if (agentId === 'company-profile-agent') {
      await loadCurrentData();
    }
    setShowAgent(true);
  }, [agentId, loadCurrentData]);

  const handleToolExecuted = useCallback(
    (toolName: string, result: any) => {
      console.log('Tool executed:', toolName, result);

      // Handle form field updates from agent tools
      if (
        agentId === 'company-profile-agent' &&
        toolName === 'update_form_field' &&
        onFormUpdate
      ) {
        if (result.success && result.field && result.value) {
          const fieldKey = result.field as keyof OwnCompany;
          console.log(
            'Updating form field from tool:',
            fieldKey,
            '=',
            result.value,
          );
          onFormUpdate(fieldKey, result.value);
        }
      }

      // Call the original onToolExecuted if provided
      if (onToolExecuted) {
        onToolExecuted(toolName, result);
      }
    },
    [agentId, onFormUpdate, onToolExecuted],
  );

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

  const getInitialMessage = () => {
    if (!agent) return undefined;

    // Generate greeting based on agent type
    switch (agentId) {
      case 'company-profile-agent':
        return `🤖 Hi! I'm your ${agent.name}. I'm here to automate the tedious task of filling out your company profile form.

I can:
• Fill forms systematically with smart suggestions
• Validate inputs to prevent errors
• Update multiple fields efficiently
• Track your progress and guide you through completion
• Provide intelligent field suggestions based on context

Let me check your current progress...`;

      case 'icp-analyzer-agent':
        return `🎯 Hi! I'm your ${agent.name}. I'm here to help you analyze and generate Ideal Customer Profiles (ICPs).

I can help you with:
• Analyzing customer data and reviews
• Generating detailed ICPs
• Providing market insights
• Optimizing your customer targeting

What would you like to work on? You can:
• Generate new ICPs
• Analyze existing customer data
• Get market insights
• Or ask me anything about customer profiling!`;

      case 'campaign-creator-agent':
        return `🚀 Hi! I'm your ${agent.name}. I'm here to help you create effective marketing campaigns.

I can help you with:
• Creating targeted marketing campaigns
• Developing ad copy and messaging
• Planning campaign strategies
• Optimizing campaign performance

What would you like to create? You can:
• Design a new campaign
• Get campaign ideas
• Optimize existing campaigns
• Or tell me about your marketing goals!`;

      case 'research-agent':
        return `🔍 Hi! I'm your ${agent.name}. I'm here to help you research competitors and market opportunities.

I can help you with:
• Competitor analysis
• Market research
• Industry insights
• Data collection and analysis

What would you like to research? You can:
• Analyze competitors
• Research market trends
• Gather industry data
• Or tell me what you'd like to explore!`;

      case 'general-guide-agent':
        return `🤖 Hi! I'm your ${agent.name}. I'm here to help you with general business guidance and questions.

I can help you with:
• Business strategy advice
• General questions about ICPs and marketing
• Best practices and tips
• Troubleshooting issues

What can I help you with today? Feel free to ask me anything!`;

      default:
        return `👋 Hi! I'm your ${agent.name}. How can I help you today?`;
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={openChat}
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
              onToolExecuted={handleToolExecuted}
              context={{ ...context, currentData }}
              initialMessage={getInitialMessage()}
            />
          </div>
        </div>
      )}
    </>
  );
}
