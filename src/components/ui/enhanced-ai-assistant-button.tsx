import { useState } from 'react';
import { Bot } from 'lucide-react';
import { Button } from './button';
import { SpecializedChat } from './specialized-chat';
import { AI_ASSISTANTS } from './ai-assistants-config';
import type { OwnCompany } from '@/services/project-service';

interface EnhancedAIAssistantButtonProps {
  assistantType: keyof typeof AI_ASSISTANTS;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  currentFormData?: OwnCompany;
  onFormUpdate?: (field: keyof OwnCompany, value: string) => void;
}

export function EnhancedAIAssistantButton({
  assistantType,
  variant = 'default',
  size = 'sm',
  className = '',
  children,
  currentFormData,
  onFormUpdate,
}: EnhancedAIAssistantButtonProps) {
  const [showAssistant, setShowAssistant] = useState(false);
  const assistant = AI_ASSISTANTS[assistantType];

  if (!assistant) {
    console.error(`Assistant type "${assistantType}" not found`);
    return null;
  }

  // Create enhanced instructions that include current form state
  const enhancedInstructions =
    assistantType === 'icp-form-tool'
      ? `${assistant.instructions}

CURRENT FORM STATE:
${
  currentFormData
    ? Object.entries(currentFormData)
        .filter(([_, value]) => value && value.trim())
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
    : 'No form data yet'
}

When suggesting form values, format your response like this:
SUGGESTION: [field_name] = [suggested_value]

For example:
SUGGESTION: targetMarket = Small businesses in Finland looking to automate their marketing
SUGGESTION: valueProposition = We help small businesses save time and money with AI-powered marketing automation

You can suggest multiple fields at once. Users can then apply these suggestions to their form.

IMPORTANT: Keep responses SHORT and DIRECT. Ask one field at a time. After each answer, provide SUGGESTION and ask next field. No long explanations.

DROPDOWN VALUES FOR REFERENCE:
- industry: SaaS/Software, E-commerce, Healthcare, Finance/Banking, Education, Manufacturing, Real Estate, Marketing/Advertising, Consulting, Retail, Technology, Media/Entertainment, Transportation, Energy, Other
- companySize: Startup (1-10 employees), Small Business (11-50 employees), Medium Business (51-200 employees), Large Business (201-1000 employees), Enterprise (1000+ employees)
- pricingModel: Subscription, One-time purchase, Freemium, Usage-based, Tiered pricing, Custom pricing, Free`
      : assistant.instructions;

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
              instructions={enhancedInstructions}
              suggestions={assistant.suggestions}
              placeholder={assistant.placeholder}
              onClose={() => setShowAssistant(false)}
              initialMessage={
                assistantType === 'icp-form-tool'
                  ? "Hi! I'm here to help you fill out your company information for creating Ideal Customer Profiles (ICPs). Let's go through this step by step. First, what's your company name?"
                  : undefined
              }
              onMessageReceived={(message) => {
                // Parse AI suggestions and apply them to form
                if (assistantType === 'icp-form-tool' && onFormUpdate) {
                  console.log('AI Message received:', message); // Debug log

                  const suggestions = message.match(
                    /SUGGESTION:\s*(\w+)\s*=\s*(.+)/g,
                  );

                  console.log('Found suggestions:', suggestions); // Debug log

                  if (suggestions) {
                    suggestions.forEach((suggestion) => {
                      const match = suggestion.match(
                        /SUGGESTION:\s*(\w+)\s*=\s*(.+)/,
                      );
                      if (match) {
                        const [, field, value] = match;
                        const fieldKey = field as keyof OwnCompany;
                        console.log(
                          'Applying suggestion:',
                          fieldKey,
                          '=',
                          value.trim(),
                        ); // Debug log
                        onFormUpdate(fieldKey, value.trim());
                      }
                    });
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
